export type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
};

export type GoogleUserInfo = {
  email?: string;
};

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
];

type SessionLike = {
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
  userEmail?: string;
};

function getRedirectUri(): string {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI ?? 'http://localhost:4000/auth/google/callback';
}

export function buildAuthUrl(state?: string): string {
  const url = new URL(GOOGLE_AUTH_BASE);
  url.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID ?? '');
  url.searchParams.append('redirect_uri', getRedirectUri());
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', (process.env.GOOGLE_OAUTH_SCOPES ?? DEFAULT_SCOPES.join(' ')));
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent');
  if (state) {
    url.searchParams.append('state', state);
  }
  return url.toString();
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', process.env.GOOGLE_CLIENT_ID ?? '');
  params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET ?? '');
  params.append('redirect_uri', getRedirectUri());
  params.append('grant_type', 'authorization_code');

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google OAuthトークンの取得に失敗しました: ${text}`);
  }

  return response.json() as Promise<TokenResponse>;
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams();
  params.append('refresh_token', refreshToken);
  params.append('client_id', process.env.GOOGLE_CLIENT_ID ?? '');
  params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET ?? '');
  params.append('grant_type', 'refresh_token');

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`アクセストークンのリフレッシュに失敗しました: ${text}`);
  }

  const data = (await response.json()) as TokenResponse;
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export async function fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ユーザー情報の取得に失敗しました: ${text}`);
  }

  return response.json() as Promise<GoogleUserInfo>;
}

export async function ensureValidAccessToken(session: SessionLike): Promise<string> {
  if (session.accessToken && session.tokenExpiry && session.tokenExpiry > Date.now()) {
    return session.accessToken;
  }

  if (session.refreshToken) {
    const refreshed = await refreshAccessToken(session.refreshToken);
    session.accessToken = refreshed.accessToken;
    session.tokenExpiry = Date.now() + refreshed.expiresIn * 1000;
    return session.accessToken;
  }

  throw new Error('Google認証が必要です');
}

export async function uploadTextToDrive(options: {
  accessToken: string;
  content: Buffer;
  fileName: string;
  folderId?: string;
}): Promise<{ fileId: string }> {
  const metadata = {
    name: options.fileName,
    parents: options.folderId ? [options.folderId] : undefined
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', options.content, options.fileName);

  const response = await fetch(options.folderId ? `${GOOGLE_UPLOAD_URL}&supportsAllDrives=true` : GOOGLE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.accessToken}`
    },
    body: form as any
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Driveへのアップロードに失敗しました: ${text}`);
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new Error('Google DriveのレスポンスにファイルIDが含まれていません');
  }
  return { fileId: data.id };
}

export type ApiSuccess<T> = { success: true; data: T; message?: string };
export type ApiFailure = { success: false; errorCode: string; message: string; details?: string[] };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type UploadPayload = { fileId?: string; originalName?: string; size?: number };
export type AuthInfo = { authenticated: boolean; email?: string };

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(input, init);
  const data = (await response.json()) as ApiResponse<T>;
  return data;
}

export async function logout(): Promise<ApiResponse<AuthInfo>> {
  return requestJson<AuthInfo>('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
}

export async function me(): Promise<ApiResponse<AuthInfo>> {
  return requestJson<AuthInfo>('/api/auth/me', {
    method: 'GET',
    credentials: 'include'
  });
}

export async function uploadTextFile(formData: FormData): Promise<ApiResponse<UploadPayload>> {
  return requestJson<UploadPayload>('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
}

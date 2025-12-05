import { useEffect, useState } from 'react';
import { logout, me, uploadTextFile } from './services/api';
import type { ApiFailure, ApiResponse, AuthInfo } from './services/api';
import LoginForm from './components/LoginForm';
import UploadForm from './components/UploadForm';

export type AuthState = {
  authenticated: boolean;
  email?: string;
};

function formatError(response: ApiFailure | Error): string {
  if (response instanceof Error) {
    return response.message;
  }
  const detail = response.details?.length ? `: ${response.details.join(' / ')}` : '';
  return `${response.message}${detail}`;
}

function App() {
  const [auth, setAuth] = useState<AuthState>({ authenticated: false });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, '', window.location.pathname);
    }

    me()
      .then((response: ApiResponse<AuthInfo>) => {
        if (response.success && response.data.authenticated) {
          setAuth(response.data);
        } else {
          setAuth({ authenticated: false });
        }
      })
      .catch(() => setAuth({ authenticated: false }));
  }, []);

  const handleLogin = () => {
    setError(null);
    setMessage(null);
    window.location.href = '/api/auth/google';
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setAuth({ authenticated: false });
      setMessage(result.message ?? 'ログアウトしました');
      setError(null);
    }
  };

  const handleUpload = async (data: FormData) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const response = await uploadTextFile(data);
      if (response.success) {
        const fileInfo = response.data.fileId ? ` (fileId: ${response.data.fileId})` : '';
        setMessage(`${response.message ?? 'アップロードに成功しました'}${fileInfo}`);
      } else {
        setError(formatError(response));
      }
    } catch (err) {
      setError(formatError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>テキストファイルアップローダー</h1>
          <p className="subtitle">学生番号と日付を入力して、Google Driveにファイルを保存します</p>
        </div>
        {auth.authenticated && (
          <div className="user-info">
            <span>{auth.email}</span>
            <button className="secondary" onClick={handleLogout} disabled={loading}>
              ログアウト
            </button>
          </div>
        )}
      </header>

      {!auth.authenticated ? (
        <LoginForm onStartOAuth={handleLogin} error={error} />
      ) : (
        <UploadForm onSubmit={handleUpload} error={error} loading={loading} />
      )}

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
    </div>
  );
}

export default App;

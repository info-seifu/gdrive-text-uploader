type Props = {
  onStartOAuth: () => void;
  error: string | null;
};

export default function LoginForm({ onStartOAuth, error }: Props) {
  return (
    <div className="card">
      <h2>Googleでログイン</h2>
      <p className="subtitle">Googleアカウントでログインし、Drive連携を許可してください</p>
      <div className="form-grid">
        <button type="button" onClick={onStartOAuth}>
          Googleアカウントで続行
        </button>
      </div>
      {error && <div className="message error">{error}</div>}
    </div>
  );
}

import { FormEvent, useMemo, useState } from 'react';

const today = new Date().toISOString().slice(0, 10);

type Props = {
  onSubmit: (data: FormData) => Promise<void>;
  error: string | null;
  loading: boolean;
};

type FieldErrors = {
  studentId?: string;
  date?: string;
  file?: string;
};

export default function UploadForm({ onSubmit, error, loading }: Props) {
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(today);
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isBusy = useMemo(() => loading, [loading]);

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};
    if (!/^\d{8}$/.test(studentId)) {
      nextErrors.studentId = '学生番号は8桁の半角数字で入力してください';
    }
    if (!date) {
      nextErrors.date = '日付を入力してください';
    }
    if (!file) {
      nextErrors.file = 'テキストファイルを選択してください';
    } else {
      if (file.type !== 'text/plain') {
        nextErrors.file = 'テキストファイル（.txt）のみアップロード可能です';
      } else if (file.size > 10 * 1024 * 1024) {
        nextErrors.file = 'ファイルサイズは10MB以下にしてください';
      }
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('date', date);
    if (file) {
      formData.append('file', file);
    }
    await onSubmit(formData);
  };

  return (
    <div className="card">
      <h2>ファイルアップロード</h2>
      <p className="subtitle">学生番号・日付・テキストファイルを入力してください</p>
      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        <label>
          学生番号 (8桁数字)
          <input
            type="text"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            placeholder="12345678"
            pattern="\d{8}"
            required
            aria-invalid={Boolean(fieldErrors.studentId)}
          />
          {fieldErrors.studentId && <span className="inline-error">{fieldErrors.studentId}</span>}
        </label>
        <label>
          日付 (YYYY-MM-DD)
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required aria-invalid={Boolean(fieldErrors.date)} />
          {fieldErrors.date && <span className="inline-error">{fieldErrors.date}</span>}
        </label>
        <label>
          テキストファイル (.txt)
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            required
            aria-invalid={Boolean(fieldErrors.file)}
          />
          {fieldErrors.file && <span className="inline-error">{fieldErrors.file}</span>}
        </label>
        <button type="submit" disabled={isBusy}>
          {isBusy ? 'アップロード中…' : 'アップロード'}
        </button>
      </form>
      {error && <div className="message error">{error}</div>}
    </div>
  );
}

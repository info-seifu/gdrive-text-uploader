import { FormEvent, useState } from 'react';

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

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};
    if (!/^\d{7}$/.test(studentId)) {
      nextErrors.studentId = '学生番号は7桁の半角数字で入力してください';
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

    if (!file) {
      return;
    }

    const formElement = event.target as HTMLFormElement;
    const fileInput = formElement.querySelector('input[type="file"]') as HTMLInputElement;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setFieldErrors({ ...fieldErrors, file: 'ファイルが選択されていません' });
      return;
    }

    const selectedFile = fileInput.files[0];

    try {
      const formData = new FormData();
      formData.append('studentId', studentId);
      formData.append('date', date);
      formData.append('file', selectedFile);

      await onSubmit(formData);
    } catch (e) {
      setFieldErrors({ ...fieldErrors, file: 'ファイルのアップロードに失敗しました' });
    }
  };

  return (
    <div className="card">
      <h2>ファイルアップロード</h2>
      <p className="subtitle">学生番号・日付・テキストファイルを入力してください</p>
      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        <label>
          学生番号 (7桁数字)
          <input
            type="text"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            placeholder="1234567"
            pattern="\d{7}"
            required
            aria-invalid={Boolean(fieldErrors.studentId)}
            name="studentId"
          />
          {fieldErrors.studentId && <span className="inline-error">{fieldErrors.studentId}</span>}
        </label>
        <label>
          日付 (YYYY-MM-DD)
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.date)}
            name="date"
          />
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
            name="file"
          />
          {fieldErrors.file && <span className="inline-error">{fieldErrors.file}</span>}
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'アップロード中…' : 'アップロード'}
        </button>
      </form>
      {error && <div className="message error">{error}</div>}
    </div>
  );
}
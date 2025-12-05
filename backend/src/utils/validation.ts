export type PlainUploadedFile = {
  mimetype?: string;
  size: number;
  buffer: Buffer;
};

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; message: string; details?: string[] };

export function validateStudentId(value?: string): ValidationResult<string> {
  if (!value) {
    return { ok: false, message: '学生番号を入力してください' };
  }
  if (!/^\d{7}$/.test(value)) {
    return { ok: false, message: '学生番号は7桁の半角数字で入力してください' };
  }
  return { ok: true, value };
}

export function validateDate(value?: string): ValidationResult<string> {
  if (!value) {
    return { ok: false, message: '日付を入力してください' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, message: '日付はYYYY-MM-DD形式で入力してください' };
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, message: '有効な日付を入力してください' };
  }
  return { ok: true, value };
}

export function validatePlainTextFile(file?: PlainUploadedFile): ValidationResult<PlainUploadedFile> {
  if (!file) {
    return { ok: false, message: 'アップロードファイルを選択してください' };
  }
  const errors: string[] = [];
  if (file.mimetype !== 'text/plain') {
    errors.push('テキストファイル（.txt）のみアップロード可能です');
  }
  const tenMb = 10 * 1024 * 1024;
  if (file.size > tenMb) {
    errors.push('ファイルサイズは10MB以下にしてください');
  }
  if (errors.length > 0) {
    return { ok: false, message: 'ファイルのバリデーションに失敗しました', details: errors };
  }
  return { ok: true, value: file };
}

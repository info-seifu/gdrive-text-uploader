import fs from 'fs';
import path from 'path';

export function buildBaseFileName(studentId: string, date: string): string {
  return `${studentId}_${date}.txt`;
}

export function generateUniqueFileName(
  uploadDir: string,
  studentId: string,
  date: string
): string {
  const baseName = buildBaseFileName(studentId, date);
  const basePath = path.join(uploadDir, baseName);

  if (!fs.existsSync(basePath)) {
    return baseName;
  }

  let counter = 2;
  let candidate = baseName;

  while (fs.existsSync(path.join(uploadDir, candidate))) {
    candidate = `${studentId}_${date}_${counter}.txt`;
    counter += 1;
  }

  return candidate;
}

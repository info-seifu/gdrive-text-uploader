import assert from 'node:assert/strict';
import test from 'node:test';
import { validateDate, validatePlainTextFile, validateStudentId } from '../src/utils/validation.js';

test('学生番号は7桁数字のみ有効', () => {
  assert.equal(validateStudentId('1234567').ok, true);
  assert.equal(validateStudentId('abc').ok, false);
  assert.equal(validateStudentId('12345678').ok, false);
});

test('日付はYYYY-MM-DD形式でバリデーション', () => {
  assert.equal(validateDate('2024-07-01').ok, true);
  assert.equal(validateDate('2024/07/01').ok, false);
});

test('プレーンテキストのファイルのみ許可', () => {
  const valid = validatePlainTextFile({ mimetype: 'text/plain', size: 10, buffer: Buffer.from('hi') } as any);
  assert.equal(valid.ok, true);
  const invalid = validatePlainTextFile({ mimetype: 'application/pdf', size: 10, buffer: Buffer.from('hi') } as any);
  assert.equal(invalid.ok, false);
});

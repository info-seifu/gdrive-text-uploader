import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildBaseFileName, generateUniqueFileName } from '../src/utils/fileNameGenerator.js';

test('基本ファイル名を生成する', () => {
  assert.equal(buildBaseFileName('12345678', '2024-01-02'), '12345678_2024-01-02.txt');
});

test('既存ファイルがある場合は連番で付与する', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-test-'));
  const first = path.join(tempDir, '12345678_2024-01-02.txt');
  fs.writeFileSync(first, 'dummy');
  const second = generateUniqueFileName(tempDir, '12345678', '2024-01-02');
  assert.equal(second, '12345678_2024-01-02_2.txt');
  fs.rmSync(tempDir, { recursive: true, force: true });
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEmail } from '../src/utils/emailValidator.js';

test('許可ドメインのメールは有効', () => {
  assert.deepEqual(validateEmail('user@i-seifu.jp'), { valid: true });
});

test('他ドメインは拒否', () => {
  const result = validateEmail('user@example.com');
  assert.equal(result.valid, false);
  assert.ok('error' in result);
});

test('数字のみローカルパートは拒否', () => {
  const result = validateEmail('12345@i-seifu.jp');
  assert.equal(result.valid, false);
});

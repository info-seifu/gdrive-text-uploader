export type EmailValidationResult = { valid: true } | { valid: false; error: string };

export function validateEmail(email: string): EmailValidationResult {
  if (!email.endsWith('@i-seifu.jp')) {
    return { valid: false, error: 'i-seifu.jpドメインのメールアドレスでログインしてください' };
  }

  const localPart = email.split('@')[0];
  if (/^\d+$/.test(localPart)) {
    return { valid: false, error: 'このアカウントではログインできません' };
  }

  return { valid: true };
}

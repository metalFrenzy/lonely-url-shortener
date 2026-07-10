// src/url/base62.util.ts
const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function encodeBase62(id: number): string {
  if (id === 0) return ALPHABET[0];
  let result = '';
  let num = id;
  while (num > 0) {
    result = ALPHABET[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

/**
 * password.js — เก็บรหัสผ่านอย่างปลอดภัยด้วย scrypt (มากับ Node ใน node:crypto)
 *
 * รูปแบบที่เก็บ:  scrypt$<salt-hex>$<hash-hex>
 *   salt = randomBytes(16) → hex (32 ตัว) · ใช้เป็น "ข้อความ" ของ salt ให้ scryptSync
 *   hash = scryptSync(รหัสผ่าน, salt, 64) → hex (128 ตัว)
 *
 * ⚠ รูปแบบนี้ตรงกับ hash ของบัญชี staff ใน schema.sql — ถ้าเปลี่ยนรูปแบบ login จะพัง
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const SCHEME = 'scrypt';

export function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex'); // 32 ตัว
  const hash = scryptSync(plain, salt, KEY_LENGTH).toString('hex'); // 128 ตัว
  return `${SCHEME}$${salt}$${hash}`;
}

export function verifyPassword(plain, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  const [scheme, salt, hashHex] = parts;
  if (scheme !== SCHEME) return false;
  if (!/^[0-9a-f]+$/i.test(salt) || !/^[0-9a-f]+$/i.test(hashHex)) return false;
  if (hashHex.length % 2 !== 0) return false;

  let candidate;
  try {
    candidate = scryptSync(plain, salt, hashHex.length / 2);
  } catch {
    return false;
  }
  const expected = Buffer.from(hashHex, 'hex');
  if (candidate.length !== expected.length) return false;
  // เทียบด้วย timingSafeEqual · กัน timing attack ที่เทียบ byte-by-byte แล้วหยุดเร็วถ้าไม่ตรง
  return timingSafeEqual(candidate, expected);
}

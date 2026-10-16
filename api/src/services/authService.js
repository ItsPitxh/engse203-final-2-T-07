import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { findUserByEmail } from './requestService.js';
import { verifyPassword } from '../utils/password.js';

/**
 * login(email, password) — ตรวจสิทธิ์เจ้าหน้าที่
 *   ① หาผู้ใช้จากอีเมล
 *   ② ต้องเป็น role='staff' และ verifyPassword ผ่าน
 *   ③ ไม่ว่าจะผิดเพราะอะไร (ไม่มีอีเมล / ไม่ใช่ staff / รหัสผ่านผิด) ให้คืน null
 *     เพื่อให้ API ตอบ error เดียวกัน — กันการบอกใบ้ว่า "มีบัญชีนี้ในระบบ" (user enumeration)
 */
export function login(email, password) {
  const user = findUserByEmail(email);
  if (!user) return null;
  if (user.role !== 'staff') return null;
  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) return null;

  const payload = {
    sub: String(user.id),
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  // คืน user แบบที่ปลอดภัย (ไม่มี password_hash)
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

/** ตรวจ token — ถูกต้องคืน payload · ปลอม/หมดอายุ โยน error */
export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

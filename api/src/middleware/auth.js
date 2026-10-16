import { verifyToken } from '../services/authService.js';

/**
 * authenticate — "คุณคือใคร"
 *   ไม่มี token / token ปลอม / หมดอายุ → 401
 *   ผ่าน → ติด req.user = payload แล้วไปต่อ
 */
export function authenticate(req, res, next) {
  const auth = req.get('Authorization') ?? '';
  const [scheme, token] = auth.split(/\s+/);
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'ต้องเข้าสู่ระบบก่อน' });
  }
  try {
    req.user = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'ต้องเข้าสู่ระบบก่อน' });
  }
  next();
}

/**
 * requireRole(role) — "คุณทำสิ่งนี้ได้ไหม"
 *   รู้ว่าเป็นใครแล้ว แต่สิทธิ์ไม่พอ → 403
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ทำรายการนี้' });
    }
    next();
  };
}

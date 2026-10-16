import { Router } from 'express';
import * as authService from '../services/authService.js';
import { validateLoginInput } from '../validators/requestValidator.js';

const router = Router();

/**
 * ⭐ Challenge · จำกัดการเดารหัสผ่าน
 *   ผิด 5 ครั้งภายใน 15 นาที (ต่ออีเมล) → 429
 *   ล็อก 15 นาทีหลังครั้งที่ 5
 *   เก็บใน Map (process memory) — เพียงพอสำหรับ API เครื่องเดียว
 *   production ควรใช้ Redis เพื่อให้แชร์กันได้หลาย instance
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const attempts = new Map(); // email → { count, firstAt }

export function resetLoginLimiter() {
  attempts.clear();
}

function tooManyAttempts(email) {
  const rec = attempts.get(email);
  if (!rec) return false;
  if (Date.now() - rec.firstAt > WINDOW_MS) {
    attempts.delete(email);
    return false;
  }
  return rec.count >= MAX_FAILS;
}

function recordFailure(email) {
  const now = Date.now();
  const rec = attempts.get(email);
  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(email, { count: 1, firstAt: now });
    return;
  }
  rec.count += 1;
}

function recordSuccess(email) {
  attempts.delete(email);
}

router.post('/login', (req, res) => {
  const errors = validateLoginInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง', details: errors });
  }

  const email = String(req.body.email).toLowerCase().trim();

  if (tooManyAttempts(email)) {
    return res.status(429).json({ error: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง' });
  }

  const result = authService.login(email, req.body.password);
  if (!result) {
    recordFailure(email);
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }

  recordSuccess(email);
  res.status(200).json(result);
});

export default router;

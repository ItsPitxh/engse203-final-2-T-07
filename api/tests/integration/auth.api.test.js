import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { loadSeed } from '../../src/services/requestService.js';
import { STAFF, loginAsStaff, tokenFor } from '../helpers/auth.js';
import { resetLoginLimiter } from '../../src/routes/authRoutes.js';

/** Week 13 — เข้าสู่ระบบและสิทธิ์ */
const app = createApp();
beforeEach(async () => {
  await loadSeed();
  resetLoginLimiter?.();
});

describe('POST /api/auth/login', () => {
  test('อีเมลและรหัสผ่านถูก → 200 พร้อม token', async () => {
    const r = await request(app).post('/api/auth/login').send(STAFF);
    expect(r.status).toBe(200);
    expect(r.body.token.split('.')).toHaveLength(3);
  });
  test('รหัสผ่านผิด → 401', async () => {
    const r = await request(app).post('/api/auth/login').send({ ...STAFF, password: 'nope1234' });
    expect(r.status).toBe(401);
  });
  test('อีเมลที่ไม่มีในระบบ → 401 ข้อความเดียวกับรหัสผ่านผิด (กัน user enumeration)', async () => {
    const miss = await request(app).post('/api/auth/login').send({ email: 'ghost@rmutl.ac.th', password: 'anything1234' });
    const wrong = await request(app).post('/api/auth/login').send({ ...STAFF, password: 'wrong-pass-1' });
    expect(miss.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(miss.body.error).toBe(wrong.body.error);
  });
  test('ผู้แจ้งทั่วไป (role != staff) → 401', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'somchai@rmutl.ac.th', password: 'anything1234' });
    expect(r.status).toBe(401);
  });
  test('body ไม่ครบ → 400', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'bad' });
    expect(r.status).toBe(400);
  });
});

describe('สิทธิ์ของ PUT / DELETE', () => {
  test('ไม่มี token → 401', async () => {
    const r = await request(app).put('/api/requests/REQ-001').send({ status: 'completed' });
    expect(r.status).toBe(401);
  });
  test('token ที่ไม่ใช่เจ้าหน้าที่ (role=requester) → 403', async () => {
    const token = tokenFor('requester');
    const r = await request(app).put('/api/requests/REQ-001')
      .set('Authorization', `Bearer ${token}`).send({ status: 'completed' });
    expect(r.status).toBe(403);
  });
  test('token ปลอม (secret อื่น) → 401', async () => {
    const token = tokenFor('staff', 'not-the-real-secret');
    const r = await request(app).put('/api/requests/REQ-001')
      .set('Authorization', `Bearer ${token}`).send({ status: 'completed' });
    expect(r.status).toBe(401);
  });
  test('เจ้าหน้าที่: PUT → 200 และ DELETE → 204', async () => {
    const token = await loginAsStaff(app);
    const put = await request(app).put('/api/requests/REQ-001')
      .set('Authorization', `Bearer ${token}`).send({ status: 'in-progress' });
    expect(put.status).toBe(200);
    const del = await request(app).delete('/api/requests/REQ-003')
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);
  });
});

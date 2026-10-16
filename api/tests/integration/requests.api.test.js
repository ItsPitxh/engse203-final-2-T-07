import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { loadSeed } from '../../src/services/requestService.js';
import { loginAsStaff } from '../helpers/auth.js';

/**
 * Integration test — ยิง HTTP จริงผ่านทุกชั้น: route → controller → service → SQLite
 * Week 13: PUT และ DELETE ต้องแนบ token ของเจ้าหน้าที่
 */

const app = createApp();
let staffAuth;
beforeEach(async () => {
  await loadSeed();
  staffAuth = { Authorization: `Bearer ${await loginAsStaff(app)}` };
});

const valid = {
  requesterName: 'ทดสอบ อัตโนมัติ', requestType: 'แจ้งซ่อม',
  location: 'C3-401', details: 'รายละเอียดยาวพอสมควรจริง', priority: 'normal',
};

describe('GET /api/requests', () => {
  test('คืน array 5 รายการจากข้อมูลตั้งต้น พร้อม 200', async () => {
    const r = await request(app).get('/api/requests');
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(5);
  });
  test('คืน requesterName ไม่ใช่ requester_id', async () => {
    const r = await request(app).get('/api/requests');
    expect(r.body[0]).toHaveProperty('requesterName');
    expect(r.body[0]).not.toHaveProperty('requester_id');
  });
  test('กรอง ?status= ทำงาน', async () => {
    const r = await request(app).get('/api/requests?status=pending');
    expect(r.body.length).toBeGreaterThan(0);
    expect(r.body.every((x) => x.status === 'pending')).toBe(true);
  });
  test('SQL injection ผ่าน ?status= ไม่หลุด', async () => {
    const r = await request(app).get("/api/requests?status=' OR '1'='1");
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(0);
  });
});

describe('GET /api/requests/:id', () => {
  test('พบ → 200', async () => {
    const r = await request(app).get('/api/requests/REQ-001');
    expect(r.status).toBe(200);
    expect(r.body.id).toBe('REQ-001');
  });
  test('ไม่พบ → 404', async () => {
    const r = await request(app).get('/api/requests/REQ-999');
    expect(r.status).toBe(404);
  });
});

describe('POST /api/requests (เปิดสาธารณะ — ไม่ต้องเข้าสู่ระบบ)', () => {
  test('ข้อมูลถูกต้อง → 201 · ได้รหัสถัดไป', async () => {
    const r = await request(app).post('/api/requests').send(valid);
    expect(r.status).toBe(201);
    expect(r.body.id).toBe('REQ-006');
    expect(r.body.requesterName).toBe('ทดสอบ อัตโนมัติ');
  });
  test('ข้อมูลไม่ครบ → 400 พร้อมรายการ error', async () => {
    const r = await request(app).post('/api/requests').send({ requesterName: 'x' });
    expect(r.status).toBe(400);
    expect(Array.isArray(r.body.details)).toBe(true);
  });
  // 🐞 regression test — BUG #1
  test('ลบรายการกลาง (เจ้าหน้าที่) แล้วเพิ่มใหม่ → 201 และรหัสไม่ซ้ำของเดิม', async () => {
    await request(app).delete('/api/requests/REQ-002').set(staffAuth).expect(204);
    const r = await request(app).post('/api/requests').send(valid);
    expect(r.status).toBe(201);
    const ids = (await request(app).get('/api/requests')).body.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('PUT /api/requests/:id (ต้องเป็นเจ้าหน้าที่)', () => {
  test('เจ้าหน้าที่เปลี่ยนสถานะ → 200 และค่าใหม่ถูกบันทึก', async () => {
    const r = await request(app).put('/api/requests/REQ-001').set(staffAuth).send({ status: 'completed' });
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('completed');
  });
  test('เจ้าหน้าที่ส่งสถานะนอกรายการ → 400', async () => {
    const r = await request(app).put('/api/requests/REQ-001').set(staffAuth).send({ status: 'done' });
    expect(r.status).toBe(400);
  });
  // 🐞 regression test — BUG #3
  test('เจ้าหน้าที่เปลี่ยนสถานะคำร้องที่ไม่มีอยู่ → 404 (ไม่ใช่ 500)', async () => {
    const r = await request(app).put('/api/requests/REQ-999').set(staffAuth).send({ status: 'completed' });
    expect(r.status).toBe(404);
  });
  test('ไม่มี token → 401', async () => {
    const r = await request(app).put('/api/requests/REQ-001').send({ status: 'completed' });
    expect(r.status).toBe(401);
  });
});

describe('DELETE /api/requests/:id (ต้องเป็นเจ้าหน้าที่)', () => {
  test('เจ้าหน้าที่ลบแล้ว GET ซ้ำ → 404', async () => {
    await request(app).delete('/api/requests/REQ-003').set(staffAuth).expect(204);
    await request(app).get('/api/requests/REQ-003').expect(404);
  });
  test('เจ้าหน้าที่ลบรายการที่ไม่มี → 404', async () => {
    await request(app).delete('/api/requests/REQ-999').set(staffAuth).expect(404);
  });
  test('ไม่มี token → 401', async () => {
    const r = await request(app).delete('/api/requests/REQ-001');
    expect(r.status).toBe(401);
  });
});

describe('GET /api/health และ /api/users', () => {
  test('health บอกว่าต่อฐานข้อมูลได้', async () => {
    const r = await request(app).get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body.database.connected).toBe(true);
  });
  test('/api/users ใช้ฐานข้อมูลชุดเดียวกับ service', async () => {
    const r = await request(app).get('/api/users');
    expect(r.body).toHaveLength(5);   // 4 ผู้แจ้ง + staff 1
    expect(r.body[0]).not.toHaveProperty('email');
  });
});

describe('เส้นทางและข้อมูลที่ไม่ถูกต้อง', () => {
  test('GET /api/nope → 404 เป็น JSON', async () => {
    const r = await request(app).get('/api/nope');
    expect(r.status).toBe(404);
    expect(r.body.error).toMatch(/ไม่พบเส้นทาง/);
  });
  test('ส่ง JSON ที่เสีย → 400 เป็น JSON ไม่ใช่ 500', async () => {
    const r = await request(app).post('/api/requests')
      .set('Content-Type', 'application/json').send('{"requesterName": ');
    expect(r.status).toBe(400);
    expect(r.body).toHaveProperty('error');
  });
  test('body ใหญ่เกิน 10kb → 413 เป็น JSON', async () => {
    const bigBody = { ...valid, details: 'x'.repeat(20000) };
    const r = await request(app).post('/api/requests').send(bigBody);
    expect(r.status).toBe(413);
    expect(r.body).toHaveProperty('error');
  });
  test('GET /api/users/1/requests → คำร้องของผู้ใช้คนนั้น', async () => {
    const r = await request(app).get('/api/users/1/requests');
    expect(r.status).toBe(200);
    expect(r.body.map((x) => x.id)).toEqual(['REQ-001', 'REQ-004']);
  });
});

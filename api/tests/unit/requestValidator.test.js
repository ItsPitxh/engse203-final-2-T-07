import { describe, test, expect } from 'vitest';
import { validateRequestInput, isValidStatus } from '../../src/validators/requestValidator.js';

/**
 * Unit test — ทดสอบ pure function โดยตรง ไม่ต้องเปิด server ไม่ต้องมีฐานข้อมูล
 * กรณีทดสอบมาจากตาราง TEST_CASES.md (CP44): แบ่งกลุ่มข้อมูล + ค่าขอบ
 */

// ข้อมูลที่ถูกต้องทุกช่อง — แต่ละ test เปลี่ยนทีละช่องเพื่อให้รู้ว่าพังเพราะอะไร
const valid = {
  requesterName: 'สมชาย ใจดี',
  requestType: 'แจ้งซ่อม',
  location: 'ห้อง 301',
  details: 'แอร์ไม่เย็นตั้งแต่เช้า',
  priority: 'normal',
};
const withField = (patch) => ({ ...valid, ...patch });

describe('validateRequestInput — ข้อมูลถูกต้อง', () => {
  test('ทุกช่องถูกต้อง → ไม่มี error', () => {
    expect(validateRequestInput(valid)).toEqual([]);
  });
});

describe('validateRequestInput — รายละเอียด (ค่าขอบ 10 ตัวอักษร)', () => {
  test('9 ตัวอักษร → error (ต่ำกว่าขอบ 1)', () => {
    expect(validateRequestInput(withField({ details: '123456789' }))).toHaveLength(1);
  });
  test('10 ตัวอักษร → ผ่าน (ตรงขอบพอดี)', () => {
    expect(validateRequestInput(withField({ details: '1234567890' }))).toEqual([]);
  });
  test('11 ตัวอักษร → ผ่าน (เกินขอบ 1)', () => {
    expect(validateRequestInput(withField({ details: '12345678901' }))).toEqual([]);
  });
  test('ช่องว่างล้วนถูกตัดทิ้งก่อนนับ → error', () => {
    expect(validateRequestInput(withField({ details: '            ' }))).toHaveLength(1);
  });
});

describe('validateRequestInput — ชื่อผู้แจ้ง (ค่าขอบ 2 ตัวอักษร)', () => {
  test('1 ตัวอักษร → error', () => {
    expect(validateRequestInput(withField({ requesterName: 'ก' }))).toHaveLength(1);
  });
  test('2 ตัวอักษร → ผ่าน', () => {
    expect(validateRequestInput(withField({ requesterName: 'กข' }))).toEqual([]);
  });
});

describe('validateRequestInput — ค่าที่ต้องอยู่ในรายการ', () => {
  test('ประเภทคำร้องนอกรายการ → error', () => {
    expect(validateRequestInput(withField({ requestType: 'แจ้งเหตุ' }))).toContain('ประเภทคำร้องไม่ถูกต้อง');
  });
  test.each(['normal', 'urgent'])('priority "%s" → ผ่าน', (priority) => {
    expect(validateRequestInput(withField({ priority }))).toEqual([]);
  });
  test('priority "high" → error', () => {
    expect(validateRequestInput(withField({ priority: 'high' }))).toHaveLength(1);
  });
});

describe('validateRequestInput — ข้อมูลผิดรูปแบบ', () => {
  test.each([null, undefined, 'text', 42, []])('input = %j → error เดียว', (input) => {
    expect(validateRequestInput(input)).toEqual(['ต้องส่งข้อมูลคำร้องมาด้วย']);
  });
  test('ผิดหลายช่องพร้อมกัน → ได้ error ครบทุกช่อง', () => {
    expect(validateRequestInput({})).toHaveLength(5);
  });
});

describe('isValidStatus', () => {
  test.each(['pending', 'in-progress', 'completed'])('"%s" → true', (s) => {
    expect(isValidStatus(s)).toBe(true);
  });
  test.each(['done', 'in progress', '', undefined])('%j → false', (s) => {
    expect(isValidStatus(s)).toBe(false);
  });
});

describe('validateRequestInput — ค่าขอบสูงสุด (CP48)', () => {
  test('ชื่อผู้แจ้ง 100 ตัว → ผ่าน', () => {
    expect(validateRequestInput({
      requesterName: 'ก'.repeat(100), requestType: 'แจ้งซ่อม',
      location: 'ห้อง 301', details: 'รายละเอียดยาวพอ', priority: 'normal',
    })).toEqual([]);
  });
  test('ชื่อผู้แจ้ง 101 ตัว → error', () => {
    expect(validateRequestInput({
      requesterName: 'ก'.repeat(101), requestType: 'แจ้งซ่อม',
      location: 'ห้อง 301', details: 'รายละเอียดยาวพอ', priority: 'normal',
    })).toHaveLength(1);
  });
  test('รายละเอียด 1000 ตัว → ผ่าน · 1001 ตัว → error', () => {
    const base = { requesterName: 'สมชาย ใจดี', requestType: 'แจ้งซ่อม', location: 'ห้อง 301', priority: 'normal' };
    expect(validateRequestInput({ ...base, details: 'x'.repeat(1000) })).toEqual([]);
    expect(validateRequestInput({ ...base, details: 'x'.repeat(1001) })).toHaveLength(1);
  });
  test('สถานที่ 101 ตัว → error', () => {
    expect(validateRequestInput({
      requesterName: 'สมชาย ใจดี', requestType: 'แจ้งซ่อม',
      location: 'ก'.repeat(101), details: 'รายละเอียดยาวพอ', priority: 'normal',
    })).toHaveLength(1);
  });
  test('ชนิดข้อมูลไม่ใช่ string → error "ต้องเป็นข้อความ"', () => {
    expect(validateRequestInput({
      requesterName: 123, requestType: 'แจ้งซ่อม',
      location: 'ห้อง 301', details: 'รายละเอียดยาวพอ', priority: 'normal',
    })).toContainEqual(expect.stringContaining('ต้องเป็นข้อความ'));
  });
});

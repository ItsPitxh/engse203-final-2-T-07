/**
 * requestValidator.js — กฎตรวจข้อมูลคำร้อง เป็น "pure function"
 *
 * Week 13 · CP48 — ตรวจเข้มขึ้น
 *   ① ชนิดข้อมูล: requesterName · location · details ต้องเป็น string
 *   ② ความยาวสูงสุด: ชื่อ ≤ 100 · สถานที่ ≤ 100 · รายละเอียด ≤ 1000
 */

export const REQUEST_TYPES = ['แจ้งซ่อม', 'บริการบัญชีผู้ใช้', 'ขอใช้อุปกรณ์', 'อื่น ๆ'];
export const PRIORITIES = ['normal', 'urgent'];
export const STATUSES = ['pending', 'in-progress', 'completed'];

export const MIN_NAME = 2;
export const MAX_NAME = 100;
export const MIN_DETAILS = 10;
export const MAX_DETAILS = 1000;
export const MAX_LOCATION = 100;

function readText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateRequestInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return ['ต้องส่งข้อมูลคำร้องมาด้วย'];
  }

  const errors = [];

  // requesterName
  if (input.requesterName !== undefined && typeof input.requesterName !== 'string') {
    errors.push('ชื่อผู้แจ้งต้องเป็นข้อความ');
  } else {
    const name = readText(input.requesterName);
    if (name.length < MIN_NAME) {
      errors.push(`ชื่อผู้แจ้งต้องมีอย่างน้อย ${MIN_NAME} ตัวอักษร`);
    } else if (name.length > MAX_NAME) {
      errors.push(`ชื่อผู้แจ้งต้องยาวไม่เกิน ${MAX_NAME} ตัวอักษร`);
    }
  }

  if (!REQUEST_TYPES.includes(input.requestType)) {
    errors.push('ประเภทคำร้องไม่ถูกต้อง');
  }

  // location
  if (input.location !== undefined && typeof input.location !== 'string') {
    errors.push('สถานที่ต้องเป็นข้อความ');
  } else {
    const loc = readText(input.location);
    if (!loc) {
      errors.push('กรุณาระบุสถานที่');
    } else if (loc.length > MAX_LOCATION) {
      errors.push(`สถานที่ต้องยาวไม่เกิน ${MAX_LOCATION} ตัวอักษร`);
    }
  }

  // details
  if (input.details !== undefined && typeof input.details !== 'string') {
    errors.push('รายละเอียดต้องเป็นข้อความ');
  } else {
    const details = readText(input.details);
    if (details.length < MIN_DETAILS) {
      errors.push(`รายละเอียดต้องมีอย่างน้อย ${MIN_DETAILS} ตัวอักษร`);
    } else if (details.length > MAX_DETAILS) {
      errors.push(`รายละเอียดต้องยาวไม่เกิน ${MAX_DETAILS} ตัวอักษร`);
    }
  }

  if (!PRIORITIES.includes(input.priority)) {
    errors.push('ความเร่งด่วนต้องเป็น normal หรือ urgent');
  }
  return errors;
}

/** สถานะที่ PUT /api/requests/:id รับได้ */
export function isValidStatus(status) {
  return STATUSES.includes(status);
}

/** Week 13 — ข้อมูลเข้าสู่ระบบ ตรวจแค่รูปแบบ ส่วนถูกหรือผิดให้ authService ตัดสิน */
export function validateLoginInput(input) {
  if (!input || typeof input !== 'object') return ['ต้องส่งอีเมลและรหัสผ่าน'];
  const errors = [];
  if (typeof input.email !== 'string' || !input.email.includes('@') || input.email.length > 254) {
    errors.push('รูปแบบอีเมลไม่ถูกต้อง');
  }
  if (typeof input.password !== 'string' || input.password.length === 0 || input.password.length > 200) {
    errors.push('กรุณาระบุรหัสผ่าน');
  }
  return errors;
}

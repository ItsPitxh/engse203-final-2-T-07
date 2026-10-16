/**
 * loanValidator.js — pure functions ของ T07 ยืม-คืนอุปกรณ์ชมรม
 *
 * กฎเฉพาะของ T07:
 *   ① วันคืน > วันยืม และ ≤ วันยืม + 14 วัน
 *   ② จำนวน ≤ availableQty ของอุปกรณ์
 */

export const STATUSES = ['requested', 'borrowed', 'returned', 'overdue'];

export const MIN_NAME = 2;
export const MAX_NAME = 100;
export const MIN_PURPOSE = 10;
export const MAX_PURPOSE = 500;
export const MIN_QTY = 1;
export const MAX_QTY = 10;
export const MAX_DAYS = 14;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readText(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function daysBetween(fromISO, toISO) {
  const from = new Date(fromISO + 'T00:00:00');
  const to   = new Date(toISO   + 'T00:00:00');
  return Math.round((to - from) / 86_400_000);
}

/**
 * ตรวจ body ของ POST /api/loans
 *   @param input   — req.body
 *   @param context — { equipment: [...] } · ส่งเข้ามาเพื่อตรวจ availableQty
 */
export function validateLoanInput(input, context = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return ['ต้องส่งข้อมูลคำขอยืม'];
  }

  const errors = [];
  const name = readText(input.borrowerName);
  if (name.length < MIN_NAME || name.length > MAX_NAME) {
    errors.push(`ชื่อผู้ยืมต้องยาว ${MIN_NAME}–${MAX_NAME} ตัวอักษร`);
  }

  if (typeof input.equipmentId !== 'string' || !input.equipmentId) {
    errors.push('ต้องเลือกอุปกรณ์');
  } else if (context.equipment && !context.equipment.find(e => e.id === input.equipmentId)) {
    errors.push(`ไม่พบอุปกรณ์รหัส ${input.equipmentId}`);
  }

  const qty = Number(input.quantity);
  if (!Number.isInteger(qty) || qty < MIN_QTY || qty > MAX_QTY) {
    errors.push(`จำนวนต้องเป็นจำนวนเต็ม ${MIN_QTY}–${MAX_QTY}`);
  } else if (context.equipment) {
    const eq = context.equipment.find(e => e.id === input.equipmentId);
    if (eq && qty > eq.availableQty) {
      errors.push(`จำนวนเกินคงเหลือ (เหลือ ${eq.availableQty} ชิ้น)`);
    }
  }

  if (!DATE_RE.test(input.borrowDate)) {
    errors.push('รูปแบบวันยืมต้องเป็น YYYY-MM-DD');
  }
  if (!DATE_RE.test(input.returnDate)) {
    errors.push('รูปแบบวันคืนต้องเป็น YYYY-MM-DD');
  }
  if (DATE_RE.test(input.borrowDate) && DATE_RE.test(input.returnDate)) {
    const d = daysBetween(input.borrowDate, input.returnDate);
    if (d <= 0)              errors.push('วันคืนต้องหลังวันยืม');
    else if (d > MAX_DAYS)   errors.push(`วันคืนต้องไม่เกิน ${MAX_DAYS} วันจากวันยืม`);
  }

  const purpose = readText(input.purpose);
  if (purpose.length < MIN_PURPOSE || purpose.length > MAX_PURPOSE) {
    errors.push(`วัตถุประสงค์ต้องยาว ${MIN_PURPOSE}–${MAX_PURPOSE} ตัวอักษร`);
  }
  return errors;
}

/** alias เพื่อ compat กับ middleware/validateRequest.js เดิม */
export const validateRequestInput = validateLoanInput;

export function isValidStatus(status) {
  return STATUSES.includes(status);
}

/** Login validator — คงจาก LAB 13 */
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

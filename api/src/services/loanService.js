import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(HERE, '../..');
const DB_FILE = process.env.DB_FILE ?? path.join(API_ROOT, 'data', 'loans.db');
const SCHEMA_FILE = path.join(API_ROOT, 'data', 'schema.sql');

let db;
let driver = 'sqlite';

async function openDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    const { default: Database } = await import('libsql');
    driver = 'turso';
    return new Database(url, { authToken: process.env.TURSO_AUTH_TOKEN });
  }
  driver = 'sqlite';
  return new DatabaseSync(DB_FILE);
}

/**
 * SELECT หลัก — JOIN equipment และ users ให้ frontend ได้ชื่ออุปกรณ์ · ชื่อผู้ยืม สำเร็จ
 */
const SELECT_SHAPE = `
  SELECT l.id,
         u.name           AS borrowerName,
         l.equipment_id   AS equipmentId,
         e.name           AS equipmentName,
         e.location       AS equipmentLocation,
         l.quantity,
         l.borrow_date    AS borrowDate,
         l.return_date    AS returnDate,
         l.purpose,
         l.status,
         l.created_at     AS createdAt
  FROM loans l
  LEFT JOIN users     u ON u.id = l.borrower_id
  LEFT JOIN equipment e ON e.id = l.equipment_id`;

export async function loadSeed() {
  db = await openDatabase();
  db.exec('PRAGMA foreign_keys = ON');
  const ready = db.prepare(
    "SELECT COUNT(*) c FROM sqlite_master WHERE type='table' AND name='loans'"
  ).get().c;
  if (!ready && existsSync(SCHEMA_FILE)) {
    db.exec(readFileSync(SCHEMA_FILE, 'utf8'));
  }
}

export function getDbStatus() {
  try {
    if (!db) return { connected: false, reason: 'ยังไม่ได้เปิดฐานข้อมูล' };
    const n = db.prepare("SELECT COUNT(*) c FROM sqlite_master WHERE type='table'").get().c;
    return { connected: true, driver, tables: n };
  } catch (e) {
    return { connected: false, reason: e.message };
  }
}

export function findAll({ status, q } = {}) {
  const where = [];
  const params = [];
  if (status) { where.push('l.status = ?'); params.push(status); }
  if (q)      { where.push('(l.purpose LIKE ? OR e.name LIKE ? OR u.name LIKE ?)');
                const like = `%${q}%`; params.push(like, like, like); }
  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  return db.prepare(`${SELECT_SHAPE}${whereSql} ORDER BY l.id`).all(...params);
}

export function findById(id) {
  return db.prepare(`${SELECT_SHAPE} WHERE l.id = ?`).get(id) ?? null;
}

/** จำนวนคงเหลือของอุปกรณ์ชิ้นหนึ่ง — ไม่นับที่ status=returned */
export function availableQtyFor(equipmentId, excludeLoanId = null) {
  const eq = db.prepare('SELECT total_qty FROM equipment WHERE id = ?').get(equipmentId);
  if (!eq) return 0;
  const row = db.prepare(
    `SELECT COALESCE(SUM(quantity), 0) AS used
     FROM loans
     WHERE equipment_id = ?
       AND status IN ('requested','borrowed','overdue')
       AND (? IS NULL OR id <> ?)`
  ).get(equipmentId, excludeLoanId, excludeLoanId);
  return eq.total_qty - row.used;
}

/** สร้างรหัสถัดไป เช่น LN-006 */
function nextId() {
  const row = db.prepare(
    "SELECT id FROM loans WHERE id LIKE 'LN-%' ORDER BY id DESC LIMIT 1"
  ).get();
  const n = row ? Number(String(row.id).replace('LN-', '')) + 1 : 1;
  return `LN-${String(n).padStart(3, '0')}`;
}

/** หา id ของผู้ยืมจากชื่อ · ไม่มีให้สร้างใหม่ (role=borrower) */
function resolveBorrowerId(name) {
  const found = db.prepare('SELECT id FROM users WHERE name = ?').get(name);
  if (found) return found.id;
  const slug = Date.now().toString(36);
  return db.prepare(
    "INSERT INTO users (name, department, email) VALUES (?, 'ไม่ระบุ', ?)"
  ).run(name, `user-${slug}@rmutl.ac.th`).lastInsertRowid;
}

export function create(input) {
  const id = nextId();
  db.exec('BEGIN');
  try {
    const borrowerId = resolveBorrowerId(input.borrowerName.trim());
    db.prepare(
      `INSERT INTO loans
         (id, borrower_id, equipment_id, quantity, borrow_date, return_date, purpose)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, borrowerId, input.equipmentId, input.quantity,
          input.borrowDate, input.returnDate, input.purpose.trim());
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return findById(id);
}

export function updateStatus(id, status) {
  const result = db.prepare('UPDATE loans SET status = ? WHERE id = ?').run(status, id);
  return result.changes ? findById(id) : null;
}

export function remove(id) {
  const target = findById(id);
  if (!target) return null;
  db.prepare('DELETE FROM loans WHERE id = ?').run(id);
  return target;
}

// ─────────────── User / Auth helpers ───────────────

export function listUsers() {
  return db.prepare('SELECT id, name, department FROM users ORDER BY id').all();
}

/** คำขอยืมของผู้ใช้คนหนึ่ง — ใช้โดย userRoutes */
export function listLoansByUser(userId) {
  return db.prepare(
    `SELECT l.id, e.name AS equipmentName, l.status
     FROM loans l LEFT JOIN equipment e ON e.id = l.equipment_id
     WHERE l.borrower_id = ? ORDER BY l.id`
  ).all(userId);
}

export function findUserByEmail(email) {
  return db.prepare(
    'SELECT id, name, email, role, password_hash AS passwordHash FROM users WHERE email = ?'
  ).get(String(email).trim().toLowerCase()) ?? null;
}

export function upsertStaff({ email, name, passwordHash }) {
  const normalized = String(email).trim().toLowerCase();
  if (findUserByEmail(normalized)) {
    db.prepare("UPDATE users SET role = 'staff', password_hash = ? WHERE email = ?")
      .run(passwordHash, normalized);
    return 'updated';
  }
  db.prepare(
    "INSERT INTO users (name, department, email, role, password_hash) VALUES (?, 'เจ้าหน้าที่', ?, 'staff', ?)"
  ).run(name, normalized, passwordHash);
  return 'created';
}

export function _getDb() { return db; }

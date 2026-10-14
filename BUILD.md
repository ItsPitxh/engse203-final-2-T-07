# BUILD — คู่มือลงมือจริง · T07 ยืม-คืนอุปกรณ์ชมรม

> โค้ดในไฟล์นี้พร้อม copy-paste · pattern ตรงกับ LAB 13 ของพิชฌ์
> ใช้คู่กับ [STEPS.md](STEPS.md) (checklist) และ [PLAN.md](PLAN.md) (ภาพรวม)
>
> ⚠ **ก่อน copy-paste** อ่านคอมเมนต์ของทุกไฟล์ให้เข้าใจ · ตอนสัมภาษณ์ **ต้องอธิบายทุกบรรทัด** — ไม่งั้นได้ 0

---

# M1 · คัดลอก + rename → `v0.1.0`

## M1-C1 · คำสั่งคัดลอก

```bash
cd ~/engse203-final-2-T-07

# ① เอาโค้ด LAB 13 มา (ไม่เอา node_modules · *.db · .env)
rsync -a --exclude node_modules --exclude '*.db' --exclude .env \
  ~/class/port/labs/week-13/source/ ./

# ② วาง kit (ไม่ทับ TEAM.md)
cp -rn ~/class/engse203-lab/labs/final-term-project/kit/. ./

# ⚠ -n ไม่ทับ .github/workflows/check.yml ของ LAB 13 (ชื่อ "Week 12 Tests")
#   บังคับใช้ของ kit แทน (ชื่อ "CI" · มี build สำหรับทีม 3 คน)
cp -f ~/class/engse203-lab/labs/final-term-project/kit/.github/workflows/check.yml \
      .github/workflows/check.yml

# ③ ลบไฟล์ LAB เดิมที่ไม่ใช้แล้ว
rm -f BUG_REPORTS.md DEMO.md DATABASE_CHOICES.md TEST_CASES.md check-week1*.mjs
rm -rf api/scripts/check-project.mjs api/data/initialRequests.json \
       frontend/public/data frontend/src/services/requestStorage.js

# ④ ไฟล์ .env ของเครื่องตัวเอง
cp api/.env.example api/.env
echo "JWT_SECRET=$(openssl rand -hex 32)" >> api/.env

# ⑤ แทน README
cp PROJECT_README_TEMPLATE.md README.md

# ⑥ กรอก config
cp project.config.example.json project.config.json
```

## M1-C2 · แก้ `package.json` ที่ root

หา key `"check"` แล้วเปลี่ยนเป็น:

```json
"check": "node --disable-warning=ExperimentalWarning check-project.mjs"
```

## M1-C3 · `api/data/schema.sql` ใหม่ทั้งไฟล์

ลบของเดิมทิ้ง แล้วแทนด้วยไฟล์นี้:

```sql
-- ═══════════════════════════════════════════════════════════
-- T07 ยืม-คืนอุปกรณ์ชมรม — โครงสร้างฐานข้อมูล
-- ENGSE203 Final Term Project · Section 2 · ทีม T-07
-- ═══════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'borrower'
                CHECK (role IN ('borrower', 'staff')),
  password_hash TEXT
);

CREATE TABLE equipment (
  id         TEXT PRIMARY KEY,                     -- EQ-001
  name       TEXT NOT NULL,
  total_qty  INTEGER NOT NULL CHECK (total_qty > 0),
  location   TEXT NOT NULL,
  category   TEXT
);

CREATE TABLE loans (
  id            TEXT PRIMARY KEY,                  -- LN-001
  borrower_id   INTEGER NOT NULL,
  equipment_id  TEXT NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
  borrow_date   TEXT NOT NULL,
  return_date   TEXT NOT NULL,
  purpose       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'requested'
                CHECK (status IN ('requested','borrowed','returned','overdue')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime')),

  FOREIGN KEY (borrower_id)  REFERENCES users(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

INSERT INTO users (name, department, email) VALUES
  ('สมชาย ใจดี',       'ชมรมถ่ายภาพ',  'somchai@rmutl.ac.th'),
  ('สุภาวดี รักเรียน', 'ชมรมดนตรี',    'supawadee@rmutl.ac.th'),
  ('ธนกฤต ตั้งใจ',     'ชมรมกีฬา',     'thanakrit@rmutl.ac.th'),
  ('ปรียา ขยันยิ่ง',   'ชมรมถ่ายภาพ',  'preeya@rmutl.ac.th');

-- บัญชี staff dev — รหัส staff1234 · production ตั้งใหม่ด้วย STAFF_EMAIL + STAFF_PASSWORD env
INSERT INTO users (name, department, email, role, password_hash) VALUES
  ('เจ้าหน้าที่ชมรม', 'งานกิจการนักศึกษา', 'staff@rmutl.ac.th', 'staff',
   'scrypt$5e1f0c3a9b7d2e4f6a8c0b1d3e5f7a9c$2f81bcd58254b475f16ddaf1e278338fa0990ed132f8b206d0a88cb4108b6b4f90df05c0d97166e2a108ab36bf3d81f7884165fff13d4ec42a67cfa36771bc38');

INSERT INTO equipment (id, name, total_qty, location, category) VALUES
  ('EQ-001', 'กล้อง DSLR Canon 90D',   2, 'ห้องชมรมถ่ายภาพ · ตู้ A', 'กล้อง'),
  ('EQ-002', 'ขาตั้งกล้อง Manfrotto',   5, 'ห้องชมรมถ่ายภาพ · ตู้ A', 'กล้อง'),
  ('EQ-003', 'กีตาร์โปร่ง Yamaha F310', 3, 'ห้องชมรมดนตรี',           'ดนตรี'),
  ('EQ-004', 'ไมโครโฟน Shure SM58',     4, 'ห้องชมรมดนตรี',           'ดนตรี'),
  ('EQ-005', 'ไม้แบดมินตัน Yonex',      8, 'ห้องชมรมกีฬา',           'กีฬา'),
  ('EQ-006', 'โปรเจกเตอร์ Epson',       1, 'ห้องชมรมถ่ายภาพ · ตู้ B', 'อื่นๆ');

INSERT INTO loans (id, borrower_id, equipment_id, quantity, borrow_date, return_date, purpose, status) VALUES
  ('LN-001', 1, 'EQ-001', 1, '2026-10-10', '2026-10-20', 'ถ่ายภาพกิจกรรมปฐมนิเทศ',    'borrowed'),
  ('LN-002', 2, 'EQ-003', 1, '2026-10-12', '2026-10-18', 'ซ้อมแสดงงานกีฬาสีคณะ',       'requested'),
  ('LN-003', 3, 'EQ-005', 2, '2026-10-05', '2026-10-15', 'แข่งแบดมินตันระหว่างคณะ',    'returned'),
  ('LN-004', 4, 'EQ-002', 2, '2026-09-28', '2026-10-10', 'ถ่ายงานรับน้องชมรมถ่ายภาพ', 'overdue'),
  ('LN-005', 1, 'EQ-006', 1, '2026-10-14', '2026-10-21', 'นำเสนอโครงงานชมรม',           'requested');

CREATE INDEX IF NOT EXISTS idx_loans_status    ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_borrower  ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_equipment ON loans(equipment_id);
```

## M1-C4 · Rename ไฟล์

```bash
cd ~/engse203-final-2-T-07/api/src

git mv services/requestService.js       services/loanService.js
git mv controllers/requestController.js controllers/loanController.js
git mv routes/requestRoutes.js          routes/loanRoutes.js
git mv validators/requestValidator.js   validators/loanValidator.js
```

## M1-C5 · `api/src/config.js`

เปลี่ยนบรรทัด `dbFile`:

```js
dbFile: process.env.DB_FILE ?? path.join(API_ROOT, 'data', 'loans.db'),
```

และใน `api/.env.example` + `api/.env`:

```
DB_FILE=./data/loans.db
```

## M1-C6 · `api/src/services/loanService.js` — เขียนใหม่ทั้งไฟล์

```js
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
 * SELECT หลัก — JOIN equipment และ users
 * frontend ได้ equipmentName · borrowerName สำเร็จ · ไม่ต้องยิงหลายรอบ
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
  // ⚠ ชื่อตารางต้องเป็น 'loans' ไม่ใช่ 'requests'
  //    ไม่งั้น schema (ที่มี DROP) ถูกรันทุก start → ข้อมูลหายทุก restart
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

/** จำนวนคงเหลือของอุปกรณ์ · ใช้โดย equipmentService และ validator */
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

// ─────────────── User / Auth helpers (คงจาก LAB 13) ───────────────

export function listUsers() {
  return db.prepare('SELECT id, name, department FROM users ORDER BY id').all();
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

// สำหรับ equipmentService ใช้ (export db instance)
export function _getDb() { return db; }
```

## M1-C7 · `api/src/services/equipmentService.js` — ไฟล์ใหม่

```js
import { _getDb, availableQtyFor } from './loanService.js';

/** รายการอุปกรณ์ทั้งหมด · มี availableQty สำเร็จ (frontend ใช้ตอน dropdown) */
export function listEquipment() {
  const db = _getDb();
  const rows = db.prepare(
    'SELECT id, name, total_qty AS totalQty, location, category FROM equipment ORDER BY id'
  ).all();
  return rows.map(r => ({ ...r, availableQty: availableQtyFor(r.id) }));
}

export function findEquipment(id) {
  const db = _getDb();
  const row = db.prepare(
    'SELECT id, name, total_qty AS totalQty, location, category FROM equipment WHERE id = ?'
  ).get(id);
  if (!row) return null;
  return { ...row, availableQty: availableQtyFor(row.id) };
}
```

## M1-C8 · `api/src/validators/loanValidator.js` — เขียนใหม่

```js
/**
 * loanValidator.js — pure functions (test ได้ง่าย)
 *
 * กฎเฉพาะของ T07
 *   ① วันคืน > วันยืม และ ≤ วันยืม + 14 วัน
 *   ② จำนวน ≤ availableQty
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
 *   @param input    — body
 *   @param context  — { equipment } ส่งเข้ามาเพื่อตรวจ availableQty
 *                     pure function จึงรับ context เป็น parameter · ไม่ไปหยิบ db เอง
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

export function isValidStatus(status) {
  return STATUSES.includes(status);
}

/** คงจาก LAB 13 — ใช้โดย authRoutes */
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
```

## M1-C9 · `api/src/controllers/loanController.js`

```js
import * as service from '../services/loanService.js';
import * as equipService from '../services/equipmentService.js';
import { validateLoanInput, isValidStatus } from '../validators/loanValidator.js';

export function listLoans(req, res) {
  const { status, q } = req.query;
  res.status(200).json(service.findAll({ status, q }));
}

export function getLoan(req, res) {
  const found = service.findById(req.params.id);
  if (!found) {
    return res.status(404).json({ error: `ไม่พบคำขอยืมรหัส ${req.params.id}` });
  }
  res.status(200).json(found);
}

export function createLoan(req, res) {
  // ดึง equipment ส่งให้ validator — pure function รับทาง parameter
  const equipment = equipService.listEquipment();
  const errors = validateLoanInput(req.body, { equipment });
  if (errors.length > 0) {
    return res.status(400).json({ error: 'ข้อมูลคำขอยืมไม่ถูกต้อง', details: errors });
  }
  const created = service.create(req.body);
  res.status(201).json(created);
}

export function updateLoanStatus(req, res) {
  const { status } = req.body ?? {};
  if (!isValidStatus(status)) {
    return res.status(400).json({
      error: 'สถานะต้องเป็น requested, borrowed, returned หรือ overdue'
    });
  }
  const updated = service.updateStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: `ไม่พบคำขอยืมรหัส ${req.params.id}` });
  }
  console.log(`[status] ${updated.id} → ${updated.status}`);
  res.status(200).json(updated);
}

export function deleteLoan(req, res) {
  const removed = service.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: `ไม่พบคำขอยืมรหัส ${req.params.id}` });
  }
  res.status(204).end();
}
```

## M1-C10 · `api/src/routes/loanRoutes.js`

```js
import { Router } from 'express';
import * as controller from '../controllers/loanController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/',    controller.listLoans);
router.post('/',   controller.createLoan);
router.get('/:id', controller.getLoan);

// เฉพาะเจ้าหน้าที่
router.put('/:id',    authenticate, requireRole('staff'), controller.updateLoanStatus);
router.delete('/:id', authenticate, requireRole('staff'), controller.deleteLoan);

export default router;
```

## M1-C11 · `api/src/routes/equipmentRoutes.js` — ไฟล์ใหม่

```js
import { Router } from 'express';
import * as service from '../services/equipmentService.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json(service.listEquipment());
});

router.get('/:id', (req, res) => {
  const eq = service.findEquipment(req.params.id);
  if (!eq) return res.status(404).json({ error: `ไม่พบอุปกรณ์รหัส ${req.params.id}` });
  res.status(200).json(eq);
});

export default router;
```

## M1-C12 · `api/src/app.js` — เปลี่ยน import + mount

หา 2 บรรทัดนี้แล้วเปลี่ยน:

```js
// ของเดิม
import requestRoutes from './routes/requestRoutes.js';
app.use('/api/requests', requestRoutes);
```

เป็น:

```js
import loanRoutes from './routes/loanRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
// ...
app.use('/api/loans', loanRoutes);
app.use('/api/equipment', equipmentRoutes);
```

## M1-C13 · `api/src/server.js` — เพิ่ม upsertStaff

เขียนทั้งไฟล์ใหม่:

```js
import { config } from './config.js';
import { createApp } from './app.js';
import { loadSeed, upsertStaff } from './services/loanService.js';
import { hashPassword } from './utils/password.js';

await loadSeed();

// production: ตั้งรหัส staff จาก env · บัญชี seed ใช้ไม่ได้บน production
if (process.env.STAFF_EMAIL && process.env.STAFF_PASSWORD) {
  upsertStaff({
    email: process.env.STAFF_EMAIL,
    name: 'เจ้าหน้าที่',
    passwordHash: hashPassword(process.env.STAFF_PASSWORD),
  });
  console.log('[staff] production staff account updated from env');
}

const app = createApp();

app.listen((config.port ?? 3001), (err) => {
  if (err) throw err;
  console.log(`T07 ยืม-คืนอุปกรณ์ชมรม พร้อมที่ http://localhost:${config.port ?? 3001}`);
});
```

## M1-C14 · `api/src/services/authService.js` — แก้ import

เปลี่ยน:
```js
import { findUserByEmail } from './requestService.js';
```
เป็น:
```js
import { findUserByEmail } from './loanService.js';
```

## M1-C15 · `api/scripts/setup-db.mjs`

เปิดไฟล์ · หา `'requests'` ทุกจุด · เปลี่ยนเป็น `'loans'` · แก้ข้อความ log

## M1-C16 · ตรวจ import ทั้งหมด

```bash
grep -rn "requestService\|requestValidator\|requestController" api/src
# ทุกบรรทัดที่เจอ ต้องแก้
```

## M1-C17 · `project.config.json`

```json
{
  "team": "T-07",
  "section": 2,
  "topic": "T07",
  "members": [
    { "name": "วรสิทธิ์ บุญยปรีดี", "studentId": "68543210017-8", "github": "ThunderXD",  "role": "fe" },
    { "name": "พิชฌ์ สินธรสวัสดิ์",  "studentId": "67543210061-7", "github": "ItsPitxh",   "role": "be+devops" }
  ],
  "api": {
    "resource": "/api/loans",
    "existingId": "LN-001",
    "statusField": "status",
    "statusFilter": "requested",
    "statusUpdate": { "status": "borrowed" },
    "validSample": {
      "borrowerName": "ทดสอบ ระบบ",
      "equipmentId": "EQ-002",
      "quantity": 1,
      "borrowDate": "{{today}}",
      "returnDate": "{{today+7}}",
      "purpose": "ทดสอบระบบยืมคืนอุปกรณ์"
    },
    "invalidSample": {
      "borrowerName": "ทดสอบ ระบบ",
      "equipmentId": "EQ-002",
      "quantity": 1,
      "borrowDate": "{{today}}",
      "returnDate": "{{today+30}}",
      "purpose": "ทดสอบ"
    },
    "ruleSamples": [
      {
        "rule": "ยืมเกิน 14 วัน",
        "body": {
          "borrowerName": "ทดสอบ ระบบ",
          "equipmentId": "EQ-002",
          "quantity": 1,
          "borrowDate": "{{today}}",
          "returnDate": "{{today+20}}",
          "purpose": "ทดสอบระบบ"
        }
      },
      {
        "rule": "จำนวนเกินที่มี",
        "body": {
          "borrowerName": "ทดสอบ ระบบ",
          "equipmentId": "EQ-002",
          "quantity": 999,
          "borrowDate": "{{today}}",
          "returnDate": "{{today+7}}",
          "purpose": "ทดสอบระบบยืมคืน"
        }
      }
    ]
  },
  "devStaff": { "email": "staff@rmutl.ac.th", "password": "staff1234" },
  "deployUrl": "https://engse203-final-2-t07.onrender.com"
}
```

> `deployUrl` ใส่ค่าจริงหลัง M2-D1 · `{{today+7}}` ฯลฯ ถูก checker แทนเป็นวันที่จริงตามเวลาไทย

## M1-C18 · รัน + ทดสอบ

```bash
npm install --prefix api
npm install --prefix frontend
npm run db:setup --prefix api

npm run dev --prefix api
```

terminal อื่น:
```bash
curl http://localhost:3001/api/health | jq
curl http://localhost:3001/api/loans | jq '.[0]'
curl http://localhost:3001/api/equipment | jq '.[0]'
curl http://localhost:3001/api/loans/LN-001 | jq
```

ควรเห็น `borrowerName` · `equipmentName` · `availableQty` ครบ

## M1-C19 · Commit + tag `v0.1.0`

```bash
rm -rf api/node_modules frontend/node_modules api/data/*.db
git ls-files | grep -E "\.env$|\.db$|node_modules" && echo "⚠ ยังมี!" || echo "✓ สะอาด"

git add -A
git commit -m "M1: migrate LAB 13 to T07 loans + equipment schema"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

---

# M2 · Frontend + Deploy → `v0.5.0`

## M2-F1 · `frontend/src/services/apiClient.js` — ตรวจ

LAB 13 มีให้แล้ว · ใช้ `VITE_API_BASE_URL` และมี `auth.setToken/getToken/clearToken` · ข้ามข้อนี้

## M2-F2 · `frontend/src/services/loanService.js` — ไฟล์ใหม่

```js
import { apiFetch } from './apiClient.js';

export function listLoans({ status, q } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  const qs = params.toString();
  return apiFetch(`/api/loans${qs ? '?' + qs : ''}`);
}

export function getLoan(id) {
  return apiFetch(`/api/loans/${id}`);
}

export function createLoan(input) {
  return apiFetch('/api/loans', { method: 'POST', body: JSON.stringify(input) });
}

export function updateLoanStatus(id, status) {
  return apiFetch(`/api/loans/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
}

export function deleteLoan(id) {
  return apiFetch(`/api/loans/${id}`, { method: 'DELETE' });
}

export function listEquipment() {
  return apiFetch('/api/equipment');
}

export function login(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
```

## M2-F3 · `frontend/src/pages/LoginPage.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/loanService.js';
import { auth } from '../services/apiClient.js';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await login(email, password);
      auth.setToken(result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      nav('/');
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>เข้าสู่ระบบเจ้าหน้าที่</h1>
      <form onSubmit={onSubmit}>
        <label>อีเมล<input type="email" value={email}
          onChange={e => setEmail(e.target.value)} required /></label>
        <label>รหัสผ่าน<input type="password" value={password}
          onChange={e => setPassword(e.target.value)} required /></label>
        {error && <p role="alert" className="error">{error}</p>}
        <button disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button>
      </form>
    </main>
  );
}
```

## M2-F4 · `frontend/src/hooks/useAuth.js`

```js
import { auth } from '../services/apiClient.js';

export function useAuth() {
  const token = auth.getToken();
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { /* ignore */ }
  const isStaff = token && user?.role === 'staff';
  function logout() {
    auth.clearToken();
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return { token, user, isStaff, logout };
}
```

## M2-F5 · `frontend/src/pages/LoansListPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listLoans } from '../services/loanService.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const STATUSES = ['', 'requested', 'borrowed', 'returned', 'overdue'];

export default function LoansListPage() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    listLoans({ status: status || undefined })
      .then(setLoans).catch(setError).finally(() => setLoading(false));
  }, [status]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <main>
      <h1>รายการคำขอยืมอุปกรณ์</h1>
      <label>กรองสถานะ:
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'ทั้งหมด'}</option>)}
        </select>
      </label>
      {loans.length === 0 ? <p>ไม่มีคำขอยืมในสถานะนี้</p> : (
        <ul className="loans-list">
          {loans.map(l => (
            <li key={l.id}>
              <Link to={`/loans/${l.id}`}>
                <strong>{l.id}</strong> · {l.equipmentName} × {l.quantity}
                <span className={`badge badge-${l.status}`}>{l.status}</span>
                <br />ผู้ยืม: {l.borrowerName} · ยืม {l.borrowDate} · คืน {l.returnDate}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

## M2-F6 · `frontend/src/pages/LoanDetailPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLoan, updateLoanStatus, deleteLoan } from '../services/loanService.js';
import { useAuth } from '../hooks/useAuth.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const NEXT_STATUS = ['requested', 'borrowed', 'returned', 'overdue'];

export default function LoanDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isStaff } = useAuth();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLoan(id).then(setLoan).catch(setError).finally(() => setLoading(false));
  }, [id]);

  async function onStatusChange(newStatus) {
    try {
      const updated = await updateLoanStatus(id, newStatus);
      setLoan(updated);
    } catch (err) { alert(err.message); }
  }

  async function onDelete() {
    if (!confirm(`ลบคำขอยืม ${id}?`)) return;
    try { await deleteLoan(id); nav('/'); }
    catch (err) { alert(err.message); }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!loan) return <p>ไม่พบคำขอยืม</p>;

  return (
    <main>
      <h1>คำขอยืม {loan.id}</h1>
      <dl>
        <dt>ผู้ยืม</dt><dd>{loan.borrowerName}</dd>
        <dt>อุปกรณ์</dt><dd>{loan.equipmentName} ({loan.equipmentLocation})</dd>
        <dt>จำนวน</dt><dd>{loan.quantity}</dd>
        <dt>วันยืม</dt><dd>{loan.borrowDate}</dd>
        <dt>วันกำหนดคืน</dt><dd>{loan.returnDate}</dd>
        <dt>วัตถุประสงค์</dt><dd>{loan.purpose}</dd>
        <dt>สถานะ</dt><dd>{loan.status}</dd>
      </dl>

      {isStaff && (
        <section className="staff-actions">
          <h2>การจัดการ (เจ้าหน้าที่)</h2>
          {NEXT_STATUS.filter(s => s !== loan.status).map(s => (
            <button key={s} onClick={() => onStatusChange(s)}>เปลี่ยนเป็น {s}</button>
          ))}
          <button onClick={onDelete} className="danger">ลบคำขอยืม</button>
        </section>
      )}
    </main>
  );
}
```

## M2-F7 · `frontend/src/pages/NewLoanPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listEquipment, createLoan } from '../services/loanService.js';

export default function NewLoanPage() {
  const nav = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({
    borrowerName: '', equipmentId: '', quantity: 1,
    borrowDate: '', returnDate: '', purpose: '',
  });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { listEquipment().then(setEquipment); }, []);

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setErrors([]); setSubmitting(true);
    try {
      const created = await createLoan({ ...form, quantity: Number(form.quantity) });
      nav(`/loans/${created.id}`);
    } catch (err) {
      setErrors(err.details ?? [err.message]);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEq = equipment.find(e => e.id === form.equipmentId);

  return (
    <main>
      <h1>ขอยืมอุปกรณ์</h1>
      <form onSubmit={onSubmit}>
        <label>ชื่อผู้ยืม
          <input value={form.borrowerName}
            onChange={e => set('borrowerName', e.target.value)} required />
        </label>
        <label>อุปกรณ์
          <select value={form.equipmentId}
            onChange={e => set('equipmentId', e.target.value)} required>
            <option value="">-- เลือก --</option>
            {equipment.map(eq => (
              <option key={eq.id} value={eq.id} disabled={eq.availableQty <= 0}>
                {eq.name} (เหลือ {eq.availableQty}/{eq.totalQty})
              </option>
            ))}
          </select>
        </label>
        <label>จำนวน
          <input type="number" min="1" max={selectedEq?.availableQty ?? 10}
            value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
        </label>
        <label>วันยืม
          <input type="date" value={form.borrowDate}
            onChange={e => set('borrowDate', e.target.value)} required />
        </label>
        <label>วันคืน
          <input type="date" value={form.returnDate}
            onChange={e => set('returnDate', e.target.value)} required />
        </label>
        <label>วัตถุประสงค์
          <textarea value={form.purpose} rows="3"
            onChange={e => set('purpose', e.target.value)} required />
        </label>
        {errors.length > 0 && (
          <ul role="alert" className="errors">
            {errors.map((er, i) => <li key={i}>{er}</li>)}
          </ul>
        )}
        <button disabled={submitting}>{submitting ? 'กำลังส่ง…' : 'ส่งคำขอยืม'}</button>
      </form>
    </main>
  );
}
```

## M2-F8 · `frontend/src/App.jsx` — ตั้ง routes

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoansListPage from './pages/LoansListPage.jsx';
import LoanDetailPage from './pages/LoanDetailPage.jsx';
import NewLoanPage from './pages/NewLoanPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { useAuth } from './hooks/useAuth.js';

function Nav() {
  const { isStaff, user, logout } = useAuth();
  return (
    <nav>
      <Link to="/">รายการ</Link>
      <Link to="/new">ยืมใหม่</Link>
      <Link to="/dashboard">สรุป</Link>
      {isStaff ? (
        <>
          <span>· {user.name}</span>
          <button onClick={logout}>ออกจากระบบ</button>
        </>
      ) : <Link to="/login">เข้าสู่ระบบ</Link>}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<LoansListPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />
        <Route path="/new" element={<NewLoanPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## M2-F9 · `frontend/src/pages/DashboardPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import { listLoans } from '../services/loanService.js';
import { summarizeByStatus } from '../utils/loanSummary.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    listLoans().then(loans => setSummary(summarizeByStatus(loans)));
  }, []);
  if (!summary) return <p>กำลังโหลด…</p>;
  return (
    <main>
      <h1>สรุปภาพรวม</h1>
      <div className="cards">
        {Object.entries(summary).map(([status, count]) => (
          <div key={status} className={`card status-${status}`}>
            <h2>{status}</h2><p className="count">{count}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
```

## M2-F10 · `frontend/src/utils/loanSummary.js`

```js
export function summarizeByStatus(loans) {
  const init = { requested: 0, borrowed: 0, returned: 0, overdue: 0 };
  return loans.reduce((acc, l) => {
    if (acc[l.status] !== undefined) acc[l.status]++;
    return acc;
  }, init);
}
```

## M2-F11 · ลบไฟล์ LAB เดิม

```bash
cd ~/engse203-final-2-T-07/frontend/src
rm -f pages/NewRequestPage.jsx pages/RequestDetailPage.jsx pages/AboutPage.jsx
rm -f components/RequestCard.jsx components/RequestForm.jsx components/RequestList.jsx
rm -f services/requestService.js utils/requestSummary.js utils/requestSummary.test.js
# เก็บ LoadingState · ErrorState · FilterBar · SummaryPanel ไว้ reuse
```

## M2-F12 · `frontend/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { outDir: 'dist', emptyOutDir: true },
});
```

## M2-F13 · `frontend/.env.production`

```
VITE_API_BASE_URL=https://<render-service-name>.onrender.com
```

> 💡 ถ้า Express serve `frontend/dist` บน URL เดียวกันกับ API (เป็นแบบนั้นใน LAB 13 ด้วย `config.staticDir`) ให้เว้นไฟล์นี้ไปเลย · `apiClient` จะ fallback เป็น relative URL แล้วเรียก `/api/*` ของ origin เดียวกัน ใช้ได้ทันทีไม่ต้องกังวลเรื่อง CORS

## M2-D1 · ตั้ง Render

1. `render.yaml` → ลบบรรทัด `rootDir:` ถ้ามี
2. Push ขึ้น GitHub → Render Dashboard → New → Blueprint → ชี้ที่ repo
3. Environment variables:
   - `STAFF_EMAIL=staff@rmutl.ac.th` (ตรงกับ seed)
   - `STAFF_PASSWORD=<รหัสยาว ≥ 12 ตัว>` ← **เก็บไว้ · ไม่ commit**
   - `JWT_SECRET` → ปล่อย `render.yaml` generate
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://<render-url>.onrender.com`

## M2-D2 · ทดสอบ production

```bash
curl https://<url>.onrender.com/api/health
curl https://<url>.onrender.com/api/loans | head -c 500

curl -X POST https://<url>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@rmutl.ac.th","password":"<PROD_PASSWORD>"}'

# ลองด้วย staff1234 → ต้อง 401
curl -X POST https://<url>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@rmutl.ac.th","password":"staff1234"}'
```

## M2-X · Tag `v0.5.0`

```bash
git add -A
git commit -m "M2: loans API + FE pages + login + first Render deploy"
git tag v0.5.0 && git push && git push origin v0.5.0
```

---

# M2.5 · Tests + Debug Log

## M2.5-T1 · `api/tests/unit/loanValidator.test.js`

```js
import { describe, it, expect } from 'vitest';
import { validateLoanInput } from '../../src/validators/loanValidator.js';

const equipment = [
  { id: 'EQ-001', name: 'กล้อง', availableQty: 2, totalQty: 2 },
  { id: 'EQ-002', name: 'ขาตั้ง', availableQty: 0, totalQty: 5 },
];

const base = {
  borrowerName: 'ทดสอบ ระบบ',
  equipmentId: 'EQ-001',
  quantity: 1,
  borrowDate: '2026-10-15',
  returnDate: '2026-10-20',
  purpose: 'ทดสอบระบบยืมคืนอุปกรณ์',
};

describe('validateLoanInput', () => {
  it('ข้อมูลถูกครบ → ไม่มี error', () => {
    expect(validateLoanInput(base, { equipment })).toEqual([]);
  });

  it('ชื่อสั้นเกิน', () => {
    const errs = validateLoanInput({ ...base, borrowerName: 'ก' }, { equipment });
    expect(errs.some(e => e.includes('ชื่อ'))).toBe(true);
  });

  it('equipmentId ไม่มีในระบบ', () => {
    const errs = validateLoanInput({ ...base, equipmentId: 'EQ-999' }, { equipment });
    expect(errs.some(e => e.includes('อุปกรณ์'))).toBe(true);
  });

  it('ค่าขอบ: quantity = 0', () => {
    const errs = validateLoanInput({ ...base, quantity: 0 }, { equipment });
    expect(errs.length).toBeGreaterThan(0);
  });

  it('ค่าขอบ: quantity = 10 (ขอบบน · ผ่าน)', () => {
    const errs = validateLoanInput(
      { ...base, equipmentId: 'EQ-001', quantity: 10 },
      { equipment: [{ ...equipment[0], availableQty: 10 }] }
    );
    expect(errs).toEqual([]);
  });

  it('ค่าขอบ: quantity = 11 (เกิน)', () => {
    const errs = validateLoanInput({ ...base, quantity: 11 }, { equipment });
    expect(errs.length).toBeGreaterThan(0);
  });

  it('⭐ กฎเฉพาะ: ยืมเกิน availableQty', () => {
    const errs = validateLoanInput(
      { ...base, equipmentId: 'EQ-002', quantity: 1 }, { equipment }
    );
    expect(errs.some(e => e.includes('เกินคงเหลือ'))).toBe(true);
  });

  it('⭐ กฎเฉพาะ ค่าขอบ: วันคืน = วันยืม + 14 (ผ่าน)', () => {
    const errs = validateLoanInput(
      { ...base, borrowDate: '2026-10-15', returnDate: '2026-10-29' },
      { equipment }
    );
    expect(errs).toEqual([]);
  });

  it('⭐ กฎเฉพาะ ค่าขอบ: วันคืน = วันยืม + 15 (เกิน)', () => {
    const errs = validateLoanInput(
      { ...base, borrowDate: '2026-10-15', returnDate: '2026-10-30' },
      { equipment }
    );
    expect(errs.some(e => e.includes('14 วัน'))).toBe(true);
  });

  it('⭐ กฎเฉพาะ: วันคืน = วันยืม (ไม่ผ่าน)', () => {
    const errs = validateLoanInput(
      { ...base, borrowDate: '2026-10-15', returnDate: '2026-10-15' },
      { equipment }
    );
    expect(errs.some(e => e.includes('หลังวันยืม'))).toBe(true);
  });

  it('purpose สั้นเกิน', () => {
    const errs = validateLoanInput({ ...base, purpose: 'สั้น' }, { equipment });
    expect(errs.some(e => e.includes('วัตถุประสงค์'))).toBe(true);
  });

  it('ส่ง null → error', () => {
    expect(validateLoanInput(null)).toHaveLength(1);
  });
});
```

ครบ 12 ข้อ · ค่าขอบของ 2 กฎเฉพาะ

## M2.5-T2 · `api/tests/integration/loans.test.js`

```js
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { loadSeed } from '../../src/services/loanService.js';

let app, staffToken;

beforeAll(async () => {
  process.env.DB_FILE = ':memory:';
  await loadSeed();
  app = createApp();

  const res = await request(app).post('/api/auth/login')
    .send({ email: 'staff@rmutl.ac.th', password: 'staff1234' });
  staffToken = res.body.token;
});

describe('GET /api/loans', () => {
  it('200 + array', async () => {
    const res = await request(app).get('/api/loans');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('มี equipmentName จาก JOIN', async () => {
    const res = await request(app).get('/api/loans');
    expect(res.body[0]).toHaveProperty('equipmentName');
  });

  it('กรองสถานะด้วย ?status=', async () => {
    const res = await request(app).get('/api/loans?status=returned');
    expect(res.body.every(l => l.status === 'returned')).toBe(true);
  });
});

describe('GET /api/loans/:id', () => {
  it('ไม่พบ → 404', async () => {
    const res = await request(app).get('/api/loans/LN-999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/loans', () => {
  it('body ถูก → 201', async () => {
    const res = await request(app).post('/api/loans').send({
      borrowerName: 'ทดสอบ สมบูรณ์',
      equipmentId: 'EQ-005',
      quantity: 1,
      borrowDate: '2026-10-15',
      returnDate: '2026-10-20',
      purpose: 'ทดสอบระบบ integration',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^LN-\d{3}$/);
  });

  it('body ผิด → 400 + details', async () => {
    const res = await request(app).post('/api/loans').send({ borrowerName: 'ก' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('ยืมเกิน 14 วัน → 400', async () => {
    const res = await request(app).post('/api/loans').send({
      borrowerName: 'ทดสอบ กฎ',
      equipmentId: 'EQ-005',
      quantity: 1,
      borrowDate: '2026-10-15',
      returnDate: '2026-11-15',
      purpose: 'ทดสอบกฎ 14 วัน',
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/loans/:id — auth', () => {
  it('ไม่มี token → 401', async () => {
    const res = await request(app).put('/api/loans/LN-001').send({ status: 'borrowed' });
    expect(res.status).toBe(401);
  });

  it('มี token staff → 200', async () => {
    const res = await request(app).put('/api/loans/LN-001')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'returned' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('returned');
  });
});

describe('DELETE /api/loans/:id', () => {
  it('ไม่มี token → 401', async () => {
    const res = await request(app).delete('/api/loans/LN-002');
    expect(res.status).toBe(401);
  });

  it('มี token staff → 204', async () => {
    const res = await request(app).delete('/api/loans/LN-002')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(204);
  });
});

// 403 — เซ็น token ด้วย role อื่น แล้วลอง PUT
import jwt from 'jsonwebtoken';
import { config } from '../../src/config.js';

describe('403 role check', () => {
  it('borrower → 403', async () => {
    const borrowerToken = jwt.sign(
      { sub: '999', name: 'fake', role: 'borrower' },
      config.jwtSecret
    );
    const res = await request(app).put('/api/loans/LN-001')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ status: 'borrowed' });
    expect(res.status).toBe(403);
  });
});
```

ครบ 13 ข้อ · 401 · 403 · staff ทำได้

## M2.5-T3 · `DEBUG_LOG.md` ตัวอย่าง 2 bug

```markdown
# DEBUG_LOG · T07 ยืม-คืนอุปกรณ์ชมรม

## Bug #1 — availableQty ติดลบ

**เมื่อไหร่:** 2026-10-15 ตอนทดสอบ POST ซ้ำบน EQ-001
**อาการ:** `GET /api/equipment` คืน `availableQty: -1`
**คาดว่า:** ไม่ต่ำกว่า 0
**ตามรอย:** ลบ loan ที่ status=returned แล้ว availableQty เพิ่ม → แสดงว่านับ returned ด้วย
**แก้:** ใน `availableQtyFor()` เปลี่ยน `status IN ('requested','borrowed','returned','overdue')` → `('requested','borrowed','overdue')`
**กันกลับ:** test ใน `tests/unit/equipmentService.test.js` ที่ตรวจว่า status=returned ไม่หัก availableQty

## Bug #2 — ข้อมูลหายทุก restart

**เมื่อไหร่:** 2026-10-14 ตั้ง schema ครั้งแรก
**อาการ:** restart API แล้ว loan ที่สร้างด้วย POST หายหมด
**คาดว่า:** ข้อมูลคงอยู่ระหว่าง restart ใน dev
**ตามรอย:** `loadSeed` ตรวจ `name='requests'` → ไม่พบ (ตาราง loans) → รัน schema ที่มี DROP ทุกครั้ง
**แก้:** เปลี่ยน `name='requests'` → `name='loans'` ใน `loadSeed()` · ตรวจทุกไฟล์ด้วย `grep -rn "requests" api/src`
**กันกลับ:** integration test ที่ loadSeed ซ้ำ แล้วเช็คว่า loan ที่สร้างยังอยู่
```

---

# M3 · Release → `v1.0.0`

## M3-R1 · README.md ติ๊กทุกส่วน

- หัว: ชื่อระบบ · URL · เวอร์ชัน
- สมาชิก (ตารางครบ)
- ความสามารถของระบบ (คนทั่วไป / staff)
- ภาพหน้าจอ (desktop + มือถือ · ≥ 2 ภาพ)
- ข้อมูล (ตาราง + ความสัมพันธ์)
- ติดตั้ง · รัน · test
- Deploy (URL · ลิงก์ไป DEPLOY.md)
- บัญชีทดสอบ dev (production ไม่เขียน)
- **การใช้ AI** — เขียนตรงๆ:
  ```markdown
  ## การใช้ AI
  - ใช้ Claude (claude.ai) ช่วยเขียน PLAN · STEPS · BUILD guide จากเอกสาร course
  - review schema design · validator rules
  - อธิบายโค้ดทุกบรรทัดได้ด้วยตัวเอง
  ```

## M3-R2 · `API_CONTRACT.md`

ทุก endpoint · ตัวอย่าง request/response จริง (copy จาก curl) · ข้อความ error

## M3-R3 · ติ๊ก `RELEASE_CHECKLIST.md`

ทีละข้อ · ใส่หลักฐาน (จำนวน test · ลิงก์ CI run · URL · ภาพ)

## M3-R4 · check-project.mjs

```bash
node --disable-warning=ExperimentalWarning check-project.mjs
node --disable-warning=ExperimentalWarning check-project.mjs --online
```

ไม่มี FAIL แดง

## M3-R5 · ตรวจ security

```bash
git ls-files | grep -E '\.env$' | grep -v example   # ว่าง
git ls-files | grep node_modules                     # ว่าง
git ls-files | grep '\.db$'                          # ว่าง
npm audit --prefix api
npm audit --prefix frontend
```

## M3-R6 · Tag `v1.0.0`

```bash
git status                              # clean
git log --oneline -5

git tag v1.0.0
git push origin main
git push origin v1.0.0
```

## M3-R7 · ส่ง LMS

- ลิงก์ repo + URL deploy ก่อนเวลาสอบ 22 ต.ค.
- **หยุด commit** หลังจากนี้

---

# ลำดับ copy-paste

ค้นหา section ด้วย Ctrl+F:

| ขั้น | section |
|---|---|
| M1 (19 ข้อ) | M1-C1 → M1-C19 |
| M2 FE (10 ข้อ) | M2-F1 → M2-F13 |
| M2 Deploy (3 ข้อ) | M2-D1 · M2-D2 · M2-X |
| M2.5 Tests (3 ข้อ) | M2.5-T1 · M2.5-T2 · M2.5-T3 |
| M3 Release (7 ข้อ) | M3-R1 → M3-R7 |

**โค้ดที่พร้อม copy:**
- SQL: `schema.sql`
- Backend: `loanService.js` · `equipmentService.js` · `loanValidator.js` · `loanController.js` · `loanRoutes.js` · `equipmentRoutes.js` · `server.js`
- Frontend: `loanService.js` · `LoginPage` · `LoansListPage` · `LoanDetailPage` · `NewLoanPage` · `DashboardPage` · `App` · `useAuth` · `loanSummary`
- Tests: `loanValidator.test.js` (12 ข้อ) · `loans.test.js` (13 ข้อ) · `loanSummary.test.js` (3 ข้อ)
- Config: `project.config.json`
- Debug: `DEBUG_LOG.md` 2 bug

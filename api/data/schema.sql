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

# BUILD2 — เส้นทางเดียว · zsh · Mac sendnudes

> ใช้ไฟล์นี้แทน BUILD.md ถ้ากำลังงง · ทำไล่ลงมาทีละขั้น · ห้ามข้าม
> ⚠ ใช้ **zsh** (default ของ macOS) · ไม่ใช่ bash
> ⚠ ไม่มี `shopt` · ไม่มี `rmdir` (ใช้ `rm -rf` แทน · ไม่พลาดเพราะโฟลเดอร์ไม่ว่าง)

---

## STEP 0 · ยืนยันสถานะปัจจุบัน

```zsh
cd ~/engse203-final-2-T-07
pwd                         # ต้องเป็น /Users/sendnudes/engse203-final-2-T-07
git status                  # ควร clean (ถ้า dirty — commit หรือ stash ก่อน)
ls starter 2>/dev/null && echo "✓ มี starter" || echo "✗ ไม่มี starter"
```

เอาต์พุต **ต้อง** เห็น `✓ มี starter` · ถ้าไม่เห็น หยุด แล้วบอกผม

---

## STEP 1 · ย้ายทุกอย่างจาก `starter/` ขึ้น root

```zsh
cd ~/engse203-final-2-T-07

# zsh glob (D) = include dotfiles
mv starter/*(D) ./

# ตรวจว่าหมดจริง · แล้วลบด้วย rm -rf (กันโฟลเดอร์ไม่ว่าง)
ls -la starter
rm -rf starter

# ยืนยัน
ls -la | head -20
ls starter 2>/dev/null && echo "⚠ ยังอยู่" || echo "✓ ลบแล้ว"
```

**คาดหวัง:** root มี `api/` · `frontend/` · `.github/` · `.gitignore` · `.node-version` · `check-week13.mjs` · ฯลฯ

---

## STEP 2 · ลบไฟล์ LAB เดิมที่ไม่ใช้

```zsh
cd ~/engse203-final-2-T-07

rm -f BUG_REPORTS.md DEMO.md DATABASE_CHOICES.md TEST_CASES.md
rm -f check-week11.mjs check-week12.mjs check-week13.mjs
rm -rf api/scripts/check-project.mjs
rm -rf api/data/initialRequests.json
rm -rf frontend/public/data
rm -rf frontend/src/services/requestStorage.js

# ตรวจว่าหมด
ls | grep -E "BUG_REPORTS|DEMO|DATABASE_CHOICES|TEST_CASES|check-week"
# ต้องว่าง (ไม่มีเอาต์พุต)
```

---

## STEP 3 · ไฟล์ .env + README + project.config.json

```zsh
cd ~/engse203-final-2-T-07

# .env ของ api
cp api/.env.example api/.env 2>/dev/null || touch api/.env
echo "JWT_SECRET=$(openssl rand -hex 32)" >> api/.env

# README — backup ของ LAB 13 ก่อนทับ
[ -f README.md ] && mv README.md README.md.lab13-backup
cp PROJECT_README_TEMPLATE.md README.md

# project.config.json
cp project.config.example.json project.config.json

# ตรวจ
ls api/.env README.md project.config.json
```

---

## STEP 4 · root `package.json` (CI ต้องใช้)

สร้างใหม่ที่ root (ยังไม่มีอยู่):

```zsh
cd ~/engse203-final-2-T-07

cat > package.json << 'PKG'
{
  "name": "engse203-final-2-t07",
  "private": true,
  "scripts": {
    "build": "npm install --include=dev --prefix frontend && npm run build --prefix frontend && npm install --prefix api",
    "start": "npm start --prefix api",
    "test": "npm test --prefix api && npm test --prefix frontend",
    "coverage": "npm run coverage --prefix api",
    "check": "node --disable-warning=ExperimentalWarning check-project.mjs"
  },
  "engines": { "node": ">=22.13.0" },
  "devDependencies": { "supertest": "^7.2.2" }
}
PKG

# ตรวจ
cat package.json | head -5
```

---

## STEP 5 · ติดตั้ง dependencies + รัน test ของ LAB 13 ครั้งแรก

```zsh
cd ~/engse203-final-2-T-07

npm install --prefix api
npm install --prefix frontend
npm install

# test ของ LAB 13 (Campus Service) ยังอยู่ · ควรผ่านทุกข้อ
npm test --prefix api
```

**คาดหวัง:** ทุก test ผ่าน (56 passed · 0 failed) · ถ้ามี fail — หยุดแล้วบอกผม

---

## STEP 6 · เขียน schema.sql ใหม่สำหรับ T07

เปิดไฟล์ `api/data/schema.sql` ด้วย VS Code แล้ว **ลบของเดิมทิ้ง** · วางตามด้านล่าง:

```sql
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
                CHECK (role IN ('borrower','staff')),
  password_hash TEXT
);

CREATE TABLE equipment (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  total_qty  INTEGER NOT NULL CHECK (total_qty > 0),
  location   TEXT NOT NULL,
  category   TEXT
);

CREATE TABLE loans (
  id            TEXT PRIMARY KEY,
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

Save ไฟล์ · แล้วลบ db เก่าเพื่อ regenerate:

```zsh
rm -f api/data/*.db
npm run db:setup --prefix api
```

**คาดหวัง:** ไฟล์ `api/data/loans.db` (หรือชื่อ db ตาม config.js) ถูกสร้างใหม่

---

## STEP 7 · Rename ไฟล์ 4 ชุด (ใช้ `git mv` เพื่อเก็บ history)

```zsh
cd ~/engse203-final-2-T-07/api/src

git mv services/requestService.js       services/loanService.js
git mv controllers/requestController.js controllers/loanController.js
git mv routes/requestRoutes.js          routes/loanRoutes.js
git mv validators/requestValidator.js   validators/loanValidator.js

cd ~/engse203-final-2-T-07
git status
```

---

## STEP 8 · แก้โค้ด 7 ไฟล์ (เปิดใน VS Code · ทำทีละไฟล์)

ไฟล์โค้ดเต็มอยู่ใน **BUILD.md** · ค้นหา section ด้วย Ctrl+F:

| ลำดับ | section ใน BUILD.md | ไฟล์ที่แก้ |
|---|---|---|
| 8.1 | M1-C5 | `api/src/config.js` — เปลี่ยน `campus.db` → `loans.db` |
| 8.2 | M1-C6 | `api/src/services/loanService.js` — **เขียนทั้งไฟล์ใหม่** |
| 8.3 | M1-C7 | `api/src/services/equipmentService.js` — **ไฟล์ใหม่** (สร้างเอง) |
| 8.4 | M1-C8 | `api/src/validators/loanValidator.js` — **เขียนทั้งไฟล์ใหม่** |
| 8.5 | M1-C9 | `api/src/controllers/loanController.js` — **เขียนทั้งไฟล์ใหม่** |
| 8.6 | M1-C10 | `api/src/routes/loanRoutes.js` — **เขียนทั้งไฟล์ใหม่** |
| 8.7 | M1-C11 | `api/src/routes/equipmentRoutes.js` — **ไฟล์ใหม่** |
| 8.8 | M1-C12 | `api/src/app.js` — เปลี่ยน `requestRoutes` เป็น `loanRoutes` + `equipmentRoutes` |
| 8.9 | M1-C13 | `api/src/server.js` — เพิ่ม `upsertStaff` |
| 8.10 | M1-C14 | `api/src/services/authService.js` — แก้ `import` |
| 8.11 | M1-C15 | `api/scripts/setup-db.mjs` — เปลี่ยน `requests` → `loans` |

หลังแก้ทุกไฟล์ · ตรวจว่าไม่มี `requests` ค้าง:

```zsh
cd ~/engse203-final-2-T-07
grep -rn "requestService\|requestValidator\|requestController\|'REQ-" api/src
# ต้องว่าง
grep -rn "FROM requests\|name='requests'" api/src
# ต้องว่าง
```

---

## STEP 9 · กรอก `project.config.json`

เปิด `project.config.json` ใน VS Code · ลบของเดิมทิ้ง · วางตามด้านล่าง:

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
      "borrowDate": "{{today+7}}",
      "returnDate": "{{today+10}}",
      "purpose": "ทดสอบระบบยืมคืนอุปกรณ์"
    },
    "invalidSample": {
      "borrowerName": "ทดสอบ ระบบ",
      "equipmentId": "EQ-002",
      "quantity": 1,
      "borrowDate": "{{today+7}}",
      "returnDate": "{{today+30}}",
      "purpose": "ทด"
    },
    "ruleSamples": [
      { "rule": "วันคืนต้องหลังวันยืม", "body": { "borrowerName": "ทดสอบ ระบบ", "equipmentId": "EQ-002", "quantity": 1, "borrowDate": "{{today+7}}", "returnDate": "{{today+6}}", "purpose": "ทดสอบระบบยืมคืน" } },
      { "rule": "ยืมเกิน 14 วัน",       "body": { "borrowerName": "ทดสอบ ระบบ", "equipmentId": "EQ-002", "quantity": 1, "borrowDate": "{{today+7}}", "returnDate": "{{today+22}}", "purpose": "ทดสอบระบบยืมคืน" } },
      { "rule": "จำนวนเกินที่มี",         "body": { "borrowerName": "ทดสอบ ระบบ", "equipmentId": "EQ-002", "quantity": 99, "borrowDate": "{{today+7}}", "returnDate": "{{today+10}}", "purpose": "ทดสอบระบบยืมคืน" } }
    ]
  },
  "devStaff": { "email": "staff@rmutl.ac.th", "password": "staff1234" },
  "deployUrl": "https://engse203-final-2-t07.onrender.com"
}
```

---

## STEP 10 · รัน API + ยิง curl ทดสอบ

```zsh
cd ~/engse203-final-2-T-07
npm run dev --prefix api
```

เปิด terminal อีกช่อง:

```zsh
curl http://localhost:3001/api/health | python3 -m json.tool
curl http://localhost:3001/api/loans | python3 -m json.tool
curl http://localhost:3001/api/equipment | python3 -m json.tool
curl http://localhost:3001/api/loans/LN-001 | python3 -m json.tool
```

**คาดหวัง:**
- `/api/health` → `{"ok": true, ...}`
- `/api/loans` → array 5 รายการ · มี `equipmentName`, `borrowerName`
- `/api/equipment` → array 6 รายการ · มี `availableQty`
- `/api/loans/LN-001` → 200 + object

ถ้าทุกอย่าง ok · กด `Ctrl+C` หยุด API

---

## STEP 11 · Commit + Tag `v0.1.0` 🏷

```zsh
cd ~/engse203-final-2-T-07

# ตรวจไม่มี secret / node_modules ติดไป
git ls-files | grep -E "node_modules|\.env$|\.db$"
# ต้องว่าง

git add -A
git status | head -40

git commit -m "feat(M1): migrate LAB 13 to T07 loans + equipment schema"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

**เสร็จ M1 ✅**

---

## สรุป

| STEP | เรื่อง | เสร็จแล้ว? |
|---|---|---|
| 0 | ยืนยันสถานะ | [ ] |
| 1 | ย้าย starter/ → root | [ ] |
| 2 | ลบไฟล์ LAB เดิม | [ ] |
| 3 | .env + README + config | [ ] |
| 4 | root package.json | [ ] |
| 5 | npm install + test LAB 13 | [ ] |
| 6 | schema.sql ใหม่ของ T07 | [ ] |
| 7 | git mv 4 ไฟล์ | [ ] |
| 8 | แก้โค้ด 11 ไฟล์ (ดู BUILD.md M1-C5 ถึง M1-C15) | [ ] |
| 9 | project.config.json | [ ] |
| 10 | รัน API + curl ทดสอบ | [ ] |
| 11 | commit + tag v0.1.0 | [ ] |

**ติดตรงไหน:** บอกเลข STEP + copy-paste error ให้ผม

> ขั้น M2 (frontend + deploy) + M3 (release) อยู่ใน `BUILD.md` section M2-F* และ M3-R*

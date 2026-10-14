# แผนงาน Final Project — T07 ยืม-คืนอุปกรณ์ชมรม

> ENGSE203 · Section 2 · ทีม T-07 (คู่) · repo: `engse203-final-2-T-07`
> จัดทำ: 2026-10-14 — ใช้เป็นแผนร่วมของทั้งทีม · แก้ไขได้ผ่าน PR

---

## 1. สถานะและเวลาที่เหลือ

| milestone | กำหนด (Sec 2) | สถานะ |
|---|---|---|
| M0 TEAM.md | 8 ต.ค. 23:59 | ✅ ส่งแล้ว |
| **M1** ตั้งต้นจาก LAB 13 + schema 2 ตาราง + `v0.1.0` | **11 ต.ค. 23:59** | ❌ **เลยกำหนด 3 วัน** |
| **M2** API ของ loans + login + deploy ครั้งแรก + `v0.5.0` | **16 ต.ค. 23:59** | ⏳ เหลือ 2 วัน |
| หยุดเพิ่มฟีเจอร์ แก้ bug | 20 ต.ค. | — |
| **M3** `v1.0.0` + URL · ส่งใน LMS | **22 ต.ค. ก่อนเวลาสอบ** | 8 วัน |

**กลยุทธ์เวลา:** ไล่ M1 + M2 ให้ทันภายในวันที่ 16 ต.ค. (รวมเป็นงานก้อนเดียว) · 17–20 ต.ค. ทำ test ให้ครบ + เอกสาร + ⭐ · 21 ต.ค. Release Checklist + tag `v1.0.0`

---

## 2. โจทย์ T07 — ยืม-คืนอุปกรณ์ชมรม

ระบบให้สมาชิกชมรม**ขอยืม**อุปกรณ์ของชมรม (กล้อง · ไม้แบด · เครื่องดนตรี · โปรเจกเตอร์ ฯลฯ) · เจ้าหน้าที่ชมรม**อนุมัติ · ติดตาม · รับคืน · ทำเครื่องหมายเกินกำหนด**

### บทบาทผู้ใช้

| ใคร | ทำอะไรได้ |
|---|---|
| คนทั่วไป (ไม่ login) | ดูรายการคำขอยืม · กรองตามสถานะ · ดูรายละเอียด · ส่งคำขอยืมใหม่ · ดู dashboard |
| เจ้าหน้าที่ชมรม (login) | ทุกอย่างข้างบน + เปลี่ยนสถานะ (requested → borrowed → returned/overdue) + ลบรายการ |

### สถานะของคำขอ

```
requested ──อนุมัติให้ยืม──▶ borrowed ──คืนแล้ว──▶ returned
                              │
                              └──เลยกำหนด──▶ overdue
```

### กฎเฉพาะของ T07 (ต้องมี test ยืนยัน)

1. **วันคืนต้องหลังวันยืม และไม่เกิน 14 วัน** จากวันยืม
2. **จำนวนที่ขอยืมต้องไม่เกินจำนวนคงเหลือ** = `equipment.total_qty − SUM(quantity)` ของ loans ที่สถานะ `requested` / `borrowed` / `overdue` สำหรับ equipment ตัวนั้น

### การตีความที่ทีมเลือก (เขียนไว้ใน README)

- `return_date` คือ**วันกำหนดคืน** (due date) — ไม่เก็บวันคืนจริง · สถานะ `returned` บอกว่าคืนแล้ว
- `overdue` **เจ้าหน้าที่กดเปลี่ยนเอง** ด้วย PUT (ไม่มี cron job)

---

## 3. จุดเริ่มต้น — ไม่เริ่มจากศูนย์

เริ่มจาก `~/class/port/labs/week-13/source/` ของพิชฌ์ (LAB 13 Quality & Security · ผ่าน 23/23) ซึ่งมีครบแล้ว:

- โครง React + Vite + Express + SQLite + JWT
- `requests` resource ของ Campus Service (ต้องแปลงเป็น `loans`)
- auth middleware · scrypt + salt · `authenticate` · `requireRole`
- CI workflow · validator pure function · test infrastructure (vitest · supertest)

**งานของ M1** คือคัดลอกเข้ามา + วางไฟล์ kit + สร้าง schema 2 ตารางของ T07 + ตั้งค่า config

### คำสั่งคัดลอก (ตามคู่มือ)

```bash
cd ~/engse203-final-2-T-07 && git pull

# ① คัดลอกโค้ด LAB 13 (ไม่เอา node_modules · .db · .env)
rsync -a --exclude node_modules --exclude '*.db' --exclude .env \
  ~/class/port/labs/week-13/source/ ./

# ② วาง kit (-n = ไม่ทับ TEAM.md ที่กรอกแล้ว)
cp -rn ~/class/engse203-lab/labs/final-term-project/kit/. ./

# ③ ลบไฟล์ของ LAB เดิมที่ไม่ใช้
rm -f BUG_REPORTS.md DEMO.md DATABASE_CHOICES.md TEST_CASES.md check-week1*.mjs
rm -rf api/scripts/check-project.mjs api/data/initialRequests.json \
       frontend/public/data frontend/src/services/requestStorage.js

# ④ ไฟล์ลับของเครื่องตัวเอง
cp api/.env.example api/.env

# ⑤ แทน README ที่ GitHub ให้
cp PROJECT_README_TEMPLATE.md README.md

# ⑥ แก้ package.json (root) · บรรทัด "check"
#    → "node --disable-warning=ExperimentalWarning check-project.mjs"

# ⑦ project.config.json และ TEAM_CONTRACT.md — กรอกจาก TEAM.md
```

---

## 4. สถาปัตยกรรม

### 4.1 ตาราง (`api/data/schema.sql`)

```sql
-- users (คงจาก LAB 13 — เก็บ staff + ผู้ยืมทั่วไป)
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('member','staff')),
  password_hash TEXT NOT NULL,
  salt          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- equipment — อุปกรณ์ของชมรม
CREATE TABLE equipment (
  id         TEXT PRIMARY KEY,              -- EQ-001
  name       TEXT NOT NULL,
  total_qty  INTEGER NOT NULL CHECK (total_qty > 0),
  location   TEXT NOT NULL,                 -- ที่เก็บ
  category   TEXT,                          -- (เลือกใส่) กล้อง / กีฬา / ดนตรี
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- loans — คำขอยืม (ตารางหลัก — ต้องมี ≥ 6 ฟิลด์ รวม status)
CREATE TABLE loans (
  id             TEXT PRIMARY KEY,          -- LN-001
  borrower_name  TEXT NOT NULL,             -- ชื่อผู้ยืม
  equipment_id   TEXT NOT NULL,
  quantity       INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
  borrow_date    TEXT NOT NULL,             -- วันยืม (YYYY-MM-DD)
  return_date    TEXT NOT NULL,             -- วันกำหนดคืน
  purpose        TEXT NOT NULL,             -- วัตถุประสงค์ 10–500 ตัวอักษร
  status         TEXT NOT NULL DEFAULT 'requested'
                   CHECK (status IN ('requested','borrowed','returned','overdue')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);
```

### 4.2 Seed (`schema.sql` ต่อท้าย)

- `users`: 1 staff (ใช้ตั้ง `STAFF_EMAIL` บน Render ต่อ) — รหัส seed ไว้ dev เท่านั้น
- `equipment`: ≥ 3 รายการ (เช่น กล้อง · ไม้แบด · โปรเจกเตอร์)
- `loans`: ≥ 5 รายการ **ครอบคลุม 4 สถานะ** (requested · borrowed · returned · overdue)

### 4.3 API endpoints

| method | path | ใครเรียก | ผลลัพธ์ |
|---|---|---|---|
| GET  | `/api/health` | ทุกคน | 200 + `{ok, driver, db}` |
| GET  | `/api/loans` | ทุกคน | 200 · รองรับ `?status=` · **JOIN equipment** ให้ได้ `equipmentName` · `?q=` (⭐) |
| GET  | `/api/loans/:id` | ทุกคน | 200 · ไม่พบ → 404 |
| POST | `/api/loans` | ทุกคน | 201 · body ผิด → 400 + รายการ error · จำนวนเกินคงเหลือ → 400 |
| PUT  | `/api/loans/:id` | staff | 200 · 401/403 ตามปกติ · ส่วนใหญ่เปลี่ยน `status` |
| DELETE | `/api/loans/:id` | staff | 204 · 401/403 |
| GET  | `/api/equipment` | ทุกคน | 200 · ส่งคงเหลือ (`availableQty`) มาด้วย · ใช้ป้อน dropdown ฟอร์มยืม |
| POST | `/api/auth/login` | ทุกคน | 200 + token · ผิด → 401 (ข้อความเดียวกันทั้ง 2 กรณี) |

### 4.4 Validator (pure functions · `api/src/validators/loanValidator.js`)

- `borrower_name` 2–100 ตัวอักษร
- `equipment_id` ต้องมีในตาราง
- `quantity` จำนวนเต็ม 1–10 · และ **≤ availableQty** ของอุปกรณ์ตอนตรวจ
- `borrow_date` รูปแบบ `YYYY-MM-DD`
- `return_date` รูปแบบ `YYYY-MM-DD` · **> borrow_date** และ **≤ borrow_date + 14 วัน**
- `purpose` 10–500 ตัวอักษร
- `status` (เฉพาะ PUT) อยู่ใน enum 4 สถานะ

### 4.5 หน้าเว็บ (React · `frontend/src/pages/`)

| หน้า | path | ใครเห็น | สิ่งที่แสดง |
|---|---|---|---|
| LoansList | `/` | ทุกคน | ตาราง/การ์ด loans · ตัวกรองสถานะ · ลิงก์ไปรายละเอียด |
| LoanDetail | `/loans/:id` | ทุกคน | ข้อมูลคำขอ + ชื่ออุปกรณ์ · ปุ่มเปลี่ยนสถานะ/ลบ **เฉพาะ staff** |
| NewLoan | `/new` | ทุกคน | ฟอร์มยืม · dropdown equipment จาก API · ตรวจกฎเดียวกับ API · แสดง error จาก API |
| Dashboard | `/dashboard` | ทุกคน | นับจำนวนแยกสถานะ |
| Login | `/login` | ทุกคน | ฟอร์ม login · 401 → แสดง error เดียวกันทั้ง 2 กรณี |

### 4.6 ความปลอดภัย (จาก LAB 13 — คงไว้)

- scrypt + salt (`utils/password.js`) · JWT หมดอายุ (เช่น 2 ชั่วโมง)
- `authenticate` middleware ตรวจ Bearer token · `requireRole('staff')`
- `JWT_SECRET` จาก env · ไม่มี → fail fast
- production ไม่ส่ง stack trace
- บน Render ตั้ง `STAFF_EMAIL` + `STAFF_PASSWORD` → `upsertStaff` ตอน start (D3)

### 4.7 โครงโฟลเดอร์เป้าหมาย

```
engse203-final-2-T-07/
├── README.md                        (จาก PROJECT_README_TEMPLATE)
├── TEAM.md                          ✅ มีแล้ว
├── PLAN.md                          ← ไฟล์นี้
├── TEAM_CONTRACT.md                 (จาก kit · กรอกเอง)
├── API_CONTRACT.md                  (เขียนร่วมกับวรสิทธิ์ใน M1)
├── DEBUG_LOG.md                     (จาก kit · เติม bug จริง ≥ 2)
├── DEPLOY.md                        (คู่ = เลือกทำ · 3 คน = บังคับ)
├── RELEASE_CHECKLIST.md             (จาก kit · ติ๊กก่อน v1.0.0)
├── check-project.mjs                (จาก kit)
├── project.config.json              (กรอกจาก example)
├── render.yaml                      (ลบ rootDir · JWT_SECRET generateValue)
├── .github/workflows/check.yml      (CI)
├── api/
│   ├── .env.example
│   ├── package.json
│   ├── data/schema.sql              (เขียนใหม่ตามข้อ 4.1)
│   ├── src/
│   │   ├── server.js                (เพิ่ม upsertStaff · route /api/equipment)
│   │   ├── config.js                (เปลี่ยนชื่อ db เป็น loans.db)
│   │   ├── routes/
│   │   │   ├── loansRoutes.js       (เปลี่ยนชื่อจาก requests)
│   │   │   ├── equipmentRoutes.js   (ใหม่)
│   │   │   └── authRoutes.js
│   │   ├── controllers/loansController.js
│   │   ├── services/
│   │   │   ├── loanService.js       (เปลี่ยนชื่อ · JOIN equipment · nextId 'LN-')
│   │   │   ├── equipmentService.js  (ใหม่ · คำนวณ availableQty)
│   │   │   └── userService.js       (upsertStaff อยู่ที่นี่ได้)
│   │   ├── validators/loanValidator.js
│   │   └── middleware/auth.js
│   └── tests/
│       ├── unit/ (≥ 10)
│       └── integration/ (≥ 12 · 401 · 403)
└── frontend/
    ├── vite.config.js               (base: "/" · ไม่ใช่ /engse203-student-labs...)
    ├── package.json
    └── src/
        ├── App.jsx
        ├── services/
        │   ├── apiClient.js         (แนบ Authorization ที่เดียว · 401 → logout)
        │   └── authStore.js         (token · hooks)
        ├── pages/ (ตามข้อ 4.5)
        ├── components/
        └── utils/*.test.js          (≥ 3)
```

---

## 5. งานในแต่ละ session ต่อจากนี้

### Session ถัดไป (14–15 ต.ค.) — ปิด M1 + เริ่ม M2

เป้าหมาย: tag `v0.1.0` + schema ของ T07 คอมไพล์ผ่าน

- [ ] คัดลอก LAB 13 เข้า repo + วาง kit (คำสั่งข้อ 3)
- [ ] กรอก `project.config.json` (resource = `loans` · existingId = `LN-001` · validSample · invalidSample · ruleSamples)
- [ ] กรอก `TEAM_CONTRACT.md`
- [ ] เขียน `schema.sql` ใหม่ตามข้อ 4.1 + seed + ลบตาราง `requests`
- [ ] แก้ `requestService.js` → `loanService.js` (เปลี่ยน `LIKE 'REQ-%'`, prefix `LN-`, ชื่อตารางใน `loadSeed`)
- [ ] แก้ `config.js` ชื่อฐานข้อมูลเป็น `loans.db`
- [ ] `npm run db:setup --prefix api` ผ่าน · `/api/health` ตอบ 200
- [ ] เริ่มเขียน `API_CONTRACT.md` ร่วมกับวรสิทธิ์
- [ ] commit · push · tag `v0.1.0`

### Session ที่ 2 (15–16 ต.ค.) — ปิด M2

เป้าหมาย: tag `v0.5.0` + deploy ครั้งแรก

พิชฌ์ (BE):
- [ ] controllers · routes · validators ของ loans ครบ R2 · R3
- [ ] route `/api/equipment` คืน `availableQty`
- [ ] unit test ≥ 6 (ยังไม่ต้องครบ 10) · integration ≥ 6 (รวม 401 · 403)
- [ ] ตั้ง Render service · `render.yaml` · `STAFF_EMAIL` · `STAFF_PASSWORD` · deploy ได้
- [ ] tag `v0.5.0`

วรสิทธิ์ (FE) ทำขนาน:
- [ ] `apiClient` + `authStore`
- [ ] หน้า LoansList · LoanDetail · NewLoan · Login
- [ ] ปุ่มเปลี่ยนสถานะ/ลบ ซ่อนให้คนทั่วไป

### Session ที่ 3 (17–20 ต.ค.) — เสริมคุณภาพ

- [ ] unit test ครบ 10 (รวมค่าขอบของกฎ 14 วัน · availableQty)
- [ ] integration test ครบ 12
- [ ] frontend test ≥ 3
- [ ] Dashboard
- [ ] `DEBUG_LOG.md` ≥ 2 bug จริง + regression test
- [ ] CI ผ่าน · เพิ่มป้าย CI ใน README
- [ ] ⭐ เลือก 1–2 ข้อ: ค้นหา · ประวัติสถานะ · จำกัดการเดารหัส · PWA

### Peer Review (ส่งนอก repo)

- **ครั้งที่ 1 — 17 ต.ค.** (ไม่คิดคะแนน · เตือนกันเอง) · ส่งผ่านฟอร์มที่อาจารย์ประกาศ
- **ครั้งที่ 2 — 22 ต.ค. หลังสัมภาษณ์** (คิดคะแนน I3) · 4 ข้อ + หลักฐาน 1 ตัวอย่างต่อเพื่อน + ประเมินตัวเอง 3 ข้อ

### Session ที่ 4 (21 ต.ค.) — ปิด M3

- [ ] กรอก `README.md` ครบตามแม่แบบ (สมาชิก · ความสามารถ · ภาพหน้าจอ · บัญชีทดสอบ · การใช้ AI)
- [ ] `RELEASE_CHECKLIST.md` ติ๊กครบพร้อมหลักฐาน
- [ ] `check-project.mjs --online` ผ่าน
- [ ] ลบ bug วันสุดท้าย · ห้ามเพิ่มฟีเจอร์
- [ ] tag `v1.0.0` + push · ส่งลิงก์ใน LMS **ก่อนเวลาสอบ 22 ต.ค.**

---

## 6. จุดระวังที่คนเจอบ่อย (จากเอกสารจริง)

ตอนเปลี่ยนชื่อ `requests` → `loans` มี **4 จุดที่พังแบบเงียบ** ถ้าลืม:

| ไฟล์ | ผูกไว้กับ | ถ้าไม่เปลี่ยน |
|---|---|---|
| `api/src/services/loanService.js` → `loadSeed()` | `sqlite_master … name='requests'` | `schema.sql` ถูก DROP ทุก restart → ข้อมูลหายทุกครั้ง |
| `loanService.js` → `nextId()` | `LIKE 'REQ-%'` + prefix `REQ-` | POST แรกได้ 500 หรือรหัสซ้ำ |
| `api/scripts/setup-db.mjs` | ข้อความ + FK ของ `requests` | `db:setup` รายงานผิดตาราง |
| `api/src/config.js` · `.env.example` | ไฟล์ `campus.db` | ยังรันได้ แต่ควรเปลี่ยนเป็น `loans.db` |

**ข้ออื่น:**

- ไม่ commit `node_modules` · `*.db` · `.env` (ตรวจด้วย `git ls-files | grep -E '\.(env|db)$|node_modules'`)
- `JWT_SECRET` บน Render ใช้ `generateValue: true` ใน `render.yaml`
- บน production รหัส staff seed (`staff1234`) **ต้องใช้ไม่ได้** — ตั้งจาก env แทน (ROLES D3)
- Render free tier: SQLite รีเซ็ตทุก redeploy → ยอมรับได้สำหรับทีมคู่ **ต้องเขียนไว้ใน README**

---

## 7. การแบ่งงาน

| งาน | พิชฌ์ (BE+DevOps) | วรสิทธิ์ (FE+DevOps) |
|---|---|---|
| schema · service · validator · auth · test ฝั่ง API | ✅ | — |
| หน้าเว็บทั้งหมด · apiClient · login · test ฝั่ง FE | — | ✅ |
| CI · render.yaml · deploy · README · RELEASE_CHECKLIST · DEBUG_LOG | ✅ | — |
| `API_CONTRACT.md` | ร่วมกัน | ร่วมกัน |
| PR · review · commit ≥ 10 คน | ≥ 2 PR + review 1 | ≥ 2 PR + review 1 |

**กฎ:** ทุกงานผ่าน PR + review · commit กระจาย ≥ 5 วัน (ไม่ commit ทั้งหมดคืนสุดท้าย) · ใช้ branch `feature/be-<เรื่อง>` และ `feature/fe-<เรื่อง>`

---

## 8. ⭐ คะแนนเพิ่ม — เลือกได้สูงสุด 2 ข้อ

ที่น่าทำ (ให้ผลคุ้มกับเวลา):

1. **ค้นหา** (`?q=` + ช่องค้นหา) — เพิ่ม WHERE ใน service · เพิ่ม input ใน LoansList · ง่าย คุ้ม
2. **จำกัดการเดารหัส** (ผิด 5 ครั้ง / 15 นาที → 429) — in-memory Map · ไม่ต้องใช้ library · 1–2 ชั่วโมง

ที่ควรเลี่ยงถ้าเวลาน้อย: Turso (เป็นงานของทีม 3 คน) · PWA (service worker) · coverage ≥ 85% (ต้องเขียน test เยอะมาก)

---

## 9. บัญชีทดสอบ (ตั้งใจไว้)

| ที่ไหน | อีเมล | รหัส | หมายเหตุ |
|---|---|---|---|
| dev (จาก seed) | `staff@rmutl.ac.th` | `staff1234` | ใช้แค่ local |
| production | <ตั้งใหม่ · อีเมลเดียวกับ seed ก็ได้> | ≥ 12 ตัว · **ไม่อยู่ใน git** | ตั้งผ่าน Render env + แจ้งผู้สอนทางช่องทางใน LMS |

---

## 10. ลิงก์เอกสารต้นฉบับ

- `~/class/engse203-lab/labs/final-term-project/README.md` — ข้อกำหนด MVP (R1–R8)
- `~/class/engse203-lab/labs/final-term-project/TOPICS.md` — ตาราง T07 + ตัวอย่างแปลง Campus Service
- `~/class/engse203-lab/labs/final-term-project/ROLES.md` — งานละเอียดต่อบทบาท (F1–F9 · B1–B8 · D1–D6)
- `~/class/engse203-lab/labs/final-term-project/RUBRIC.md` — เกณฑ์คะแนน
- `~/class/engse203-lab/labs/final-term-project/kit/` — แม่แบบไฟล์
- `~/class/port/labs/week-13/source/` — จุดเริ่มต้นของโค้ด (ของพิชฌ์)

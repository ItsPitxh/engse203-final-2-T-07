# STEPS2 — รายการที่ยังเหลือ (16 ต.ค. 15:43)

> อัปเดตจากสถานะปัจจุบันของ repo · ติ๊ก `[x]` เมื่อทำเสร็จ · เรียงลำดับความเร่งด่วน

## ⏰ เวลาคอขวด

- **M2 เส้นตาย: วันนี้ 16 ต.ค. 23:59** (~8 ชั่วโมง)
- **M3 (v1.0.0) เส้นตาย: 22 ต.ค. ก่อนเวลาสอบ**

## 📍 สถานะวันนี้

ล่าสุดบน `main`:
```
b6d5078 feat(M1.4): addedstarter kit            ← kit ลงที่ root แล้ว
e7744fe fix(tests):CP 51 - staff token          ← test fix PR merge แล้ว
2c63bc3 feat(M1.2): added starter code          ← LAB 13 อยู่ใน starter/
```

| สถานะ | เรื่อง |
|---|---|
| ✅ | LAB 13 code (filled) อยู่ใน `starter/api/` + `starter/frontend/` |
| ✅ | Kit files (`DEBUG_LOG.md` · `DEPLOY.md` · `RELEASE_CHECKLIST.md` · `TEAM_CONTRACT.md` · `check-project.mjs` · `render.yaml` · `project.config.example.json`) ลงที่ root |
| ✅ | CI workflow `.github/workflows/check.yml` ตั้งแล้ว |
| ✅ | CP51 test (staff token) แก้แล้ว · PR merge แล้ว |
| ❌ | **ยังไม่มี root `package.json`** — CI รัน `npm test` ที่ root จะ fail |
| ❌ | **`starter/api/src.unfilled-backup/`** ถูก commit — มี TODO throws · ไม่ควรอยู่ใน repo |
| ❌ | **Root `api/`** มีแค่ `package-lock.json` เปล่า — ลูกค้างจาก mv/cp เก่า |
| ❌ | **ยังเป็น Campus Service** — ไม่ได้ migrate เป็น T07 (loans/equipment) |
| ❌ | **ยังไม่มี `project.config.json`** — มีแค่ `.example` |
| ❌ | **ยังไม่ได้ deploy** |

---

# 🚨 S1 · Cleanup ด่วน (10 นาที)

## S1.1 · ลบ `starter/api/src.unfilled-backup/`

```bash
cd ~/engse203-final-2-T-07
rm -rf starter/api/src.unfilled-backup
```

- [ ] ✅ เสร็จ · ไม่มี TODO throws ค้างใน repo

## S1.2 · ลบ root `api/` ที่เปล่า (ชี้ลูก lock file เก่า)

```bash
rm -rf api   # ที่ root · ไม่ใช่ starter/api
ls           # ไม่ควรเห็น api/ ที่ root แล้ว
```

- [ ] ✅ ไม่สับสนว่า test รัน test ที่ไหน

## S1.3 · ตัดสินใจโครง repo

ตอนนี้โค้ดอยู่ใน `starter/api/`, `starter/frontend/` · CI รัน `npm test` ที่ root — จะไม่เจอ test  
สองทาง:

**A. เลื่อน starter/ ขึ้น root (ตามคู่มือ · แนะนำ)**
```bash
# เอาของใน starter/ ขึ้นมา (รวม dotfiles)
shopt -s dotglob
mv starter/* ./  2>/dev/null
rmdir starter

# ลบไฟล์ LAB เดิมที่ไม่ใช้
rm -f BUG_REPORTS.md DEMO.md DATABASE_CHOICES.md TEST_CASES.md check-week1*.mjs
rm -rf api/scripts/check-project.mjs api/data/initialRequests.json \
       frontend/public/data frontend/src/services/requestStorage.js

# README ของ LAB 13 → แทนด้วยแม่แบบ project
mv README.md README.md.lab13-backup
cp PROJECT_README_TEMPLATE.md README.md
```

**B. แก้ CI ให้วิ่งใน starter/**
```yaml
# .github/workflows/check.yml
jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: starter
    steps:
      ...
```

- [ ] เลือก A หรือ B · แนะนำ A

---

# 🔧 S2 · M1 เสร็จจริง — T07 migration (3–4 ชั่วโมง)

> อ่าน `BUILD.md` sections M1-C3 ถึง M1-C19 สำหรับโค้ดเต็ม

## S2.1 · ใส่ `.env` ที่ api/ (ถ้ายังไม่มี)
```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > api/.env
grep JWT_SECRET api/.env.example || echo "JWT_SECRET=" >> api/.env.example
```
- [ ] `api/.env` มี · `api/.env.example` มีบรรทัดว่าง `JWT_SECRET=`

## S2.2 · `project.config.json` (ตามแม่แบบ T07)

```bash
cp project.config.example.json project.config.json
# แล้วเปิดแก้: team · section · topic · members · api (resource = /api/loans, …) · devStaff · deployUrl
```
- [ ] ไม่มี `<...>` ค้าง · `resource: /api/loans` · `existingId: LN-001`
- [ ] ดูรูปแบบใน [BUILD.md M1-C17](BUILD.md)

## S2.3 · เขียน `api/data/schema.sql` ใหม่ของ T07

ลบ requests table · เพิ่ม users (ปรับ role) + equipment + loans · seed ≥ 5 รายการครบ 4 สถานะ  
→ โค้ดเต็มใน [BUILD.md M1-C3](BUILD.md)

- [ ] `grep "CREATE TABLE requests" api/data/schema.sql` ไม่พบ
- [ ] `grep -c "INSERT INTO loans" api/data/schema.sql` ≥ 5

## S2.4 · Rename ไฟล์ 4 ชุด

```bash
cd api/src
git mv services/requestService.js       services/loanService.js
git mv controllers/requestController.js controllers/loanController.js
git mv routes/requestRoutes.js          routes/loanRoutes.js
git mv validators/requestValidator.js   validators/loanValidator.js
cd ../..
```
- [ ] 4 ไฟล์ชื่อใหม่

## S2.5 · ⚠ แก้ 4 จุดพังเงียบใน `loanService.js`

(ดู [BUILD.md M1-C6](BUILD.md) สำหรับโค้ดเต็ม 180 บรรทัด)

| จุด | เปลี่ยนจาก | เป็น |
|---|---|---|
| `loadSeed()` | `name='requests'` | `name='loans'` |
| `nextId()` | `LIKE 'REQ-%'` + prefix `REQ-` | `LIKE 'LN-%'` + prefix `LN-` |
| `SELECT_SHAPE` | FROM requests | FROM loans + JOIN equipment + JOIN users |
| function names | getRequests ฯลฯ | findAll/findById/create/updateStatus/remove |

- [ ] `grep -n "requests\|REQ-" api/src/services/loanService.js` ไม่มีผล

## S2.6 · ไฟล์ใหม่ · `equipmentService.js`

→ โค้ดใน [BUILD.md M1-C7](BUILD.md)

- [ ] `GET /api/equipment` คืน `availableQty`

## S2.7 · เขียน `loanValidator.js` ใหม่

T07 rules: วันคืน > วันยืม ≤ 14 วัน · จำนวน ≤ availableQty  
→ โค้ดใน [BUILD.md M1-C8](BUILD.md)

- [ ] pure function · ค่าขอบ 14 วันถูก

## S2.8 · `loanController.js` + `loanRoutes.js` + `equipmentRoutes.js`

→ โค้ดใน [BUILD.md M1-C9, M1-C10, M1-C11]

- [ ] 3 ไฟล์ · POST ทำ validate ก่อน · PUT/DELETE มี `authenticate` + `requireRole('staff')`

## S2.9 · `app.js` · เปลี่ยน mount

```js
// เอาออก
import requestRoutes from './routes/requestRoutes.js';
app.use('/api/requests', requestRoutes);

// ใส่
import loanRoutes from './routes/loanRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
app.use('/api/loans', loanRoutes);
app.use('/api/equipment', equipmentRoutes);
```

- [ ] `curl /api/loans` ตอบ 200 ได้

## S2.10 · `server.js` เพิ่ม `upsertStaff` จาก env

→ โค้ดใน [BUILD.md M1-C13]

- [ ] production ตั้ง STAFF_EMAIL/STAFF_PASSWORD ได้

## S2.11 · แก้ import ของ `authService.js` · `setup-db.mjs` · `config.js` · `.env.example`

- [ ] `grep -rn "requestService\|requestValidator\|requestController" api/src` ว่าง
- [ ] `grep "campus.db\|campus.sqlite" api/` ว่าง (เปลี่ยนเป็น `loans.db`)
- [ ] `setup-db.mjs` ตรวจตาราง `loans` ไม่ใช่ `requests`

## S2.12 · test ของ requests → แปลงเป็น loans

เปลี่ยนชื่อ test file และ import · ใช้ชื่อ loans

```bash
cd api/tests
git mv integration/requests.api.test.js integration/loans.api.test.js
cd ../..
# แก้เนื้อใน loans.api.test.js: path /api/loans, data T07
```

- [ ] test ผ่าน (เริ่มจาก copy test ของ Campus · ปรับ field name)

## S2.13 · รัน + ตรวจ

```bash
npm install --prefix api
npm install --prefix frontend
npm run db:setup --prefix api
npm test --prefix api
```

- [ ] db:setup สร้าง loans.db
- [ ] test ผ่านทุกข้อ

## S2.14 · Commit + tag `v0.1.0` 🏷

```bash
git add -A
git commit -m "feat(M1-complete): migrate LAB 13 to T07 loans + equipment"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

- [ ] tag `v0.1.0` ขึ้น GitHub แล้ว

---

# 🚀 S3 · M2 — Deploy + Login → `v0.5.0` (2–3 ชั่วโมง)

## S3.1 · root `package.json` (CI ต้องใช้)

สร้างที่ root — reference ของ LAB 13 (จาก `starter/package.json` เดิม):

```json
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
```

- [ ] CI ผ่านด้วย `npm test` ที่ root

## S3.2 · Render Blueprint

1. Render Dashboard → New → Blueprint → เลือก repo
2. Environment vars:
   - `STAFF_EMAIL` = `staff@rmutl.ac.th`
   - `STAFF_PASSWORD` = `<≥12 ตัว · เก็บเอง>`
   - `JWT_SECRET` → `render.yaml` generate ให้
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://<url>.onrender.com`
3. Deploy

- [ ] `/api/health` บน URL จริงตอบ 200
- [ ] Login ด้วย STAFF_PASSWORD ของ production ได้ · ด้วย staff1234 → 401

## S3.3 · Frontend แปลงเป็น T07 (วรสิทธิ์)

- [ ] `apiClient.js` (คงเดิม · reuse)
- [ ] `useAuth.js` hook
- [ ] `loanService.js` (fetcher) → BUILD.md M2-F2
- [ ] 5 หน้า: Login · LoansList · LoanDetail · NewLoan · Dashboard → BUILD.md M2-F3–F9
- [ ] `App.jsx` routes → BUILD.md M2-F8
- [ ] `.env.production` (เว้นว่างได้ ถ้า serve same origin)

## S3.4 · ทดสอบ end-to-end + Commit + tag `v0.5.0` 🏷

```bash
git tag v0.5.0 && git push && git push origin v0.5.0
```

- [ ] คนทั่วไปส่งคำขอยืมได้ · staff เปลี่ยนสถานะ/ลบได้ · user ธรรมดา → 401/403

---

# ✅ S4 · M2.5 Quality (17–20 ต.ค.)

## S4.1 · tests ครบจำนวน

- [ ] `tests/unit/` ≥ 10 (รวม ค่าขอบ 14 วัน · availableQty)
- [ ] `tests/integration/` ≥ 12 (รวม 401 · 403 · staff OK)
- [ ] `frontend/src/**/*.test.js` ≥ 3

## S4.2 · `DEBUG_LOG.md` ≥ 2 bug จริง

ตัวอย่าง bug ที่น่าเจอ (BUILD.md M2.5-T3):
- availableQty ติดลบ (นับ returned ด้วย)
- ข้อมูลหายทุก restart (ลืมเปลี่ยน loadSeed table name)

- [ ] 2 bug · 6 ช่อง · regression test

## S4.3 · ⭐ Extra (เลือก 1-2 ข้อ)

- [ ] 429 rate limit (มีอยู่ใน LAB 13 แล้ว · แค่ test + สาธิต)
- [ ] `?q=` search (ง่าย · 1 ชม.)

## S4.4 · CI badge · README · เอกสาร

- [ ] CI badge ใน README (link `/actions/workflows/check.yml/badge.svg`)
- [ ] `API_CONTRACT.md` ปรับเป็น T07 (ตรงกับโค้ด)

---

# 🏁 S5 · M3 Release → `v1.0.0` (21–22 ต.ค.)

## S5.1 · README.md ครบ

- [ ] สมาชิก · URL · บัญชีทดสอบ · ภาพหน้าจอ desktop + มือถือ · การใช้ AI

## S5.2 · RELEASE_CHECKLIST.md ติ๊กครบพร้อมหลักฐาน

- [ ] ทุกข้อติ๊ก · มีลิงก์ CI run · จำนวน test · ภาพ

## S5.3 · check-project.mjs

```bash
node --disable-warning=ExperimentalWarning check-project.mjs
node --disable-warning=ExperimentalWarning check-project.mjs --online
```

- [ ] ไม่มี FAIL แดง

## S5.4 · Security scan

```bash
git ls-files | grep -E "\.env$" | grep -v example   # ว่าง
git ls-files | grep node_modules                     # ว่าง
git ls-files | grep "\.db$"                          # ว่าง
npm audit --prefix api
npm audit --prefix frontend
```

- [ ] ไม่มี high/critical

## S5.5 · แจ้งรหัส production ให้อาจารย์ (ทาง LMS · ไม่ใช่ใน repo)

- [ ] ส่งแล้ว

## S5.6 · Tag `v1.0.0` 🏷 + ส่ง LMS

```bash
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

- [ ] tag ขึ้นแล้ว · ส่งลิงก์ใน LMS **ก่อนเวลาสอบ 22 ต.ค.**
- [ ] **หยุด commit หลังจากนี้** — commit หลัง v1.0.0 ไม่คิดคะแนน

## S5.7 · ซ้อม demo 3 นาที

เปิด URL → ส่งคำขอ (ไม่ login) → login staff → เปลี่ยนสถานะ → ลองลบด้วย user ธรรมดาแล้ว 401/403 → เปิด CI tab

- [ ] ซ้อม 1-2 รอบก่อนวันสอบ

---

# 📝 Peer Review (ส่งนอก repo)

- [ ] **17 ต.ค.** ครั้งที่ 1 (ไม่คิดคะแนน · เตือนกัน)
- [ ] **22 ต.ค. หลังสัมภาษณ์** ครั้งที่ 2 (คิดคะแนน I3) — 4 ข้อ + หลักฐาน 1 ตัวอย่างต่อเพื่อน

---

# สรุปจำนวน

| ขั้น | จำนวน sub-tasks | เวลาที่คาดใช้ |
|---|---:|---|
| S1 Cleanup | 3 | 10 นาที |
| S2 M1 complete (T07 migration) | 14 | 3–4 ชม. |
| S3 M2 Deploy | 4 | 2–3 ชม. |
| S4 M2.5 Quality | 4 | 4–6 ชม. |
| S5 M3 Release | 7 | 2 ชม. |
| **รวม** | **32** | **~15 ชม.** |

เริ่มที่ S1 → S2 ตอนนี้เลย · ให้จบ S3 ก่อนเที่ยงคืน (ไม่งั้นเลยกำหนด M2)

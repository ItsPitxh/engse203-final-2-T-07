# STEPS — คู่มือทำตามข้อ · T07 ยืม-คืนอุปกรณ์ชมรม

> ติ๊ก `[x]` เมื่อทำเสร็จ · ทุกข้อมี **คำสั่งที่ต้องรัน** + **วิธีตรวจว่าผ่าน** · อ่าน [PLAN.md](PLAN.md) ก่อนถ้ายังไม่เข้าใจภาพรวม

**ตัวย่อ:** `BE` = พิชฌ์ · `FE` = วรสิทธิ์ · `BOTH` = ทำร่วมกัน
**เครื่องหมาย:** ⚠ = จุดระวังพังเงียบ · 🏷 = ต้อง tag

---

# M1 · ตั้งต้นจาก LAB 13 → `v0.1.0`

> เป้าหมาย: โค้ด LAB 13 ของ BE อยู่ใน repo ทีม · schema เป็นของ T07 แล้ว · `/api/health` ตอบ 200
> เลยกำหนด 3 วันแล้ว — ควรจบภายในวันนี้ (14 ต.ค.)

## M1.1 · ตรวจ repo ก่อนเริ่ม `BE`

```bash
cd ~/engse203-final-2-T-07
git pull origin main                 # เอางานของวรสิทธิ์มา (ถ้ามี)
git status                           # ต้อง clean
ls                                   # ตอนนี้เห็นแค่ TEAM.md + PLAN.md + STEPS.md
```

- [ ] ✅ ผ่านเมื่อ: `git status` บอก `nothing to commit`

## M1.2 · ตรวจ LAB 13 ว่าผ่าน 23/23 `BE`

```bash
cd ~/class/port/labs/week-13/source
node --disable-warning=ExperimentalWarning check-week13.mjs --inclass
```

- [ ] ✅ ผ่านเมื่อ: ขึ้น `23/23` · ไม่งั้นต้องแก้ให้ครบก่อน (เป็นคะแนน A5 อยู่แล้ว)

## M1.3 · คัดลอกโค้ด LAB 13 เข้า repo ทีม `BE`

```bash
cd ~/engse203-final-2-T-07
rsync -a --exclude node_modules --exclude '*.db' --exclude .env \
  ~/class/port/labs/week-13/source/ ./
```

- [ ] ✅ ผ่านเมื่อ: `ls` เห็น `api/` `frontend/` `package.json` `render.yaml` · **ไม่เห็น** `node_modules/` หรือ `*.db`

## M1.4 · วาง kit (ไม่ทับ TEAM.md) `BE`

```bash
cp -rn ~/class/engse203-lab/labs/final-term-project/kit/. ./
ls
```

- [ ] ✅ ผ่านเมื่อ: เห็น `check-project.mjs` · `project.config.example.json` · `DEBUG_LOG.md` · `DEPLOY.md` · `RELEASE_CHECKLIST.md` · `TEAM_CONTRACT.md` · `PROJECT_README_TEMPLATE.md`
- [ ] TEAM.md ไม่ถูกทับ (`cat TEAM.md | head -5` ยังเห็นชื่อทีม)

## M1.5 · ลบไฟล์ LAB เดิมที่ไม่ใช้ `BE`

```bash
rm -f BUG_REPORTS.md DEMO.md DATABASE_CHOICES.md TEST_CASES.md check-week1*.mjs
rm -rf api/scripts/check-project.mjs api/data/initialRequests.json \
       frontend/public/data frontend/src/services/requestStorage.js
```

- [ ] ✅ ผ่านเมื่อ: `ls` ไม่เห็นไฟล์ 7 ตัวข้างบน

## M1.6 · สร้าง `.env` ของเครื่องตัวเอง `BE`

```bash
cp api/.env.example api/.env
# แก้ api/.env ให้ JWT_SECRET เป็นค่ายาวๆ สุ่ม (เช่น openssl rand -hex 32)
# ไม่ commit — อยู่ใน .gitignore แล้ว
```

- [ ] ✅ ผ่านเมื่อ: `cat api/.env | grep JWT_SECRET` เห็นค่า (ไม่ว่าง)
- [ ] `git status` ไม่เห็น `api/.env` อยู่ในรายการ untracked

## M1.7 · แทน README `BE`

```bash
cp PROJECT_README_TEMPLATE.md README.md
# ลบคอมเมนต์ <!-- ... --> และกรอกชื่อระบบตั้งต้น (เติมภายหลังก็ได้)
```

- [ ] ✅ ผ่านเมื่อ: `head README.md` ขึ้น `# ยืม-คืนอุปกรณ์ชมรม — ชมรม...` (หรือตามที่กรอก)

## M1.8 · แก้ `package.json` ที่ root `BE`

เปิด `package.json` ที่ root · หา key `"check"` แล้วเปลี่ยนเป็น:

```json
"check": "node --disable-warning=ExperimentalWarning check-project.mjs"
```

- [ ] ✅ ผ่านเมื่อ: `cat package.json | grep '"check"'` แสดงบรรทัดนี้

## M1.9 · กรอก `project.config.json` `BE`

```bash
cp project.config.example.json project.config.json
```

เปิดแก้: `resource = "/api/loans"` · `existingId = "LN-001"` · `statusField = "status"` · `statusFilter = "requested"` · `statusUpdate = {status: "borrowed"}` · `validSample`/`invalidSample`/`ruleSamples` ตามจริง (ดูที่ M1.12)

- [ ] ✅ ผ่านเมื่อ: ไฟล์ไม่มีคำว่า `requests` หรือ `REQ-` อยู่เลย

## M1.10 · กรอก `TEAM_CONTRACT.md` `BOTH`

เปิดกรอก: สมาชิก · บทบาท · กฎการ merge · ช่องทางคุยกัน · เวลาส่งงานประจำวัน

- [ ] ✅ ผ่านเมื่อ: ไม่มีช่องว่าง `<...>` ค้างในไฟล์

## M1.11 · เขียน `api/data/schema.sql` ใหม่ `BE`

ลบตาราง `requests` ทั้งหมด · สร้าง 3 ตาราง:
`users` (คงเดิม) · `equipment` (ใหม่) · `loans` (ใหม่ มี FK ไป equipment)

ดูเนื้อหา SQL เต็มใน [PLAN.md §4.1](PLAN.md)

- [ ] seed อย่างน้อย 1 staff + 3 equipment + 5 loans (ครบ 4 สถานะ)
- [ ] ✅ ผ่านเมื่อ: `grep -c 'INSERT INTO loans' api/data/schema.sql` ≥ 5
- [ ] `grep 'CREATE TABLE requests' api/data/schema.sql` ไม่พบ (ลบแล้ว)

## M1.12 · ⚠ แก้ `loanService.js` 4 จุดพังเงียบ `BE`

เปลี่ยนชื่อไฟล์ก่อน:
```bash
git mv api/src/services/requestService.js api/src/services/loanService.js
```

จุดที่ **ต้อง** เปลี่ยน (ไม่งั้นข้อมูลหายทุก restart):

| จุด | ของเดิม | ของใหม่ |
|---|---|---|
| 1. `loadSeed()` | `WHERE name='requests'` | `WHERE name='loans'` |
| 2. `nextId()` | `LIKE 'REQ-%'` | `LIKE 'LN-%'` |
| 2. `nextId()` | prefix `REQ-` | prefix `LN-` |
| 3. ชื่อ export function | `getRequests` · `getRequest` · `createRequest` · `updateRequest` · `deleteRequest` | `getLoans` · `getLoan` · `createLoan` · `updateLoan` · `deleteLoan` |
| 4. SELECT ภายใน | `FROM requests` | `FROM loans l LEFT JOIN equipment e ON l.equipment_id=e.id` |

- [ ] ✅ ผ่านเมื่อ: `grep -n "requests\|REQ-" api/src/services/loanService.js` ไม่มีผล

## M1.13 · ⚠ แก้ import ที่อื่นให้ตรงชื่อใหม่ `BE`

```bash
grep -rln "requestService\|getRequests\|createRequest\|updateRequest" api/src
# ทุกไฟล์ที่เจอ ต้องแก้ import และชื่อ function
```

ไฟล์ที่น่าจะต้องแก้: `routes/requestsRoutes.js` → `loansRoutes.js` · `controllers/requestsController.js` → `loansController.js` · `server.js` (route path)

- [ ] ✅ ผ่านเมื่อ: `grep -rn "requestService" api/src` ไม่พบ

## M1.14 · ⚠ แก้ `setup-db.mjs` `BE`

```bash
grep -n "requests" api/scripts/setup-db.mjs
# แก้ข้อความและชื่อตารางเป็น loans
```

- [ ] ✅ ผ่านเมื่อ: `grep "requests" api/scripts/setup-db.mjs` ไม่พบ (หรือเจอแค่ในคอมเมนต์)

## M1.15 · ⚠ แก้ `config.js` + `.env.example` ชื่อ db `BE`

เปลี่ยน `campus.db` → `loans.db` ใน:
- `api/src/config.js`
- `api/.env.example`
- `api/.env` (ของเครื่องตัวเอง)
- `.gitignore` (ถ้าระบุชื่อไฟล์ตรง)

- [ ] ✅ ผ่านเมื่อ: `grep -rn "campus.db\|campus.sqlite" api/` ไม่พบ

## M1.16 · ติดตั้ง + รัน db:setup `BE`

```bash
npm install --prefix api
npm install --prefix frontend
npm run db:setup --prefix api
```

- [ ] ✅ ผ่านเมื่อ: `ls api/data/*.db` เห็น `loans.db`
- [ ] ✅ `sqlite3 api/data/loans.db "SELECT COUNT(*) FROM loans;"` ≥ 5

## M1.17 · เปิด API ทดสอบ `BE`

```bash
npm run dev --prefix api &
sleep 2
curl http://localhost:3001/api/health
curl http://localhost:3001/api/loans
curl http://localhost:3001/api/loans/LN-001
```

- [ ] ✅ `/api/health` ตอบ `{"ok":true,...}`
- [ ] ✅ `/api/loans` ตอบ array ≥ 5 รายการ **พร้อม equipmentName** (JOIN ทำงาน)
- [ ] ✅ `/api/loans/LN-001` ตอบ 200
- [ ] ปิด server: `kill %1`

## M1.18 · เริ่ม `API_CONTRACT.md` `BOTH`

สร้างไฟล์ `API_CONTRACT.md` เขียนทุก endpoint ใน PLAN §4.3 · ตัวอย่าง request/response · status code · ข้อความ error

> วรสิทธิ์เริ่มทำ FE ด้วย mock data ตาม contract นี้ได้ ไม่ต้องรอ BE เสร็จ

- [ ] ✅ ผ่านเมื่อ: ครบ 8 endpoints ใน PLAN §4.3

## M1.19 · Commit + tag `v0.1.0` 🏷 `BE`

```bash
git add -A
git commit -m "M1: migrate LAB 13 to T07 loans + equipment schema"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

- [ ] ✅ ผ่านเมื่อ: `git tag` เห็น `v0.1.0` · บน GitHub เห็น tag แล้ว

---

# M2 · API + Login + Deploy ครั้งแรก → `v0.5.0`

> เป้าหมาย: ครบ R2 ใน API + หน้า login ใช้ได้ใน local + deploy Render ครั้งแรก
> **กำหนด: 16 ต.ค. 23:59**

## ส่วนของ BE

### M2.B1 · `equipmentService.js` + route `BE`

สร้างไฟล์ `api/src/services/equipmentService.js` · function `listEquipment()` ที่ SELECT equipment + คำนวณ `availableQty = total_qty - SUM(quantity ของ loans ที่ status IN ('requested','borrowed','overdue'))`

```sql
SELECT e.*,
  e.total_qty - COALESCE((
    SELECT SUM(quantity) FROM loans
    WHERE equipment_id = e.id AND status IN ('requested','borrowed','overdue')
  ), 0) AS availableQty
FROM equipment e
```

สร้าง route + controller: `GET /api/equipment`

- [ ] ✅ `curl localhost:3001/api/equipment` คืน array ที่มี `availableQty` ทุกตัว
- [ ] ✅ `availableQty` ไม่ติดลบ

### M2.B2 · `loanValidator.js` `BE`

สร้าง pure function `validateLoan(body, {equipment})`:

- `borrower_name` 2–100 ตัวอักษร
- `equipment_id` ต้องมีใน equipment ที่ส่งมา
- `quantity` 1–10 + **≤ availableQty**
- `borrow_date` รูปแบบ `YYYY-MM-DD`
- `return_date` รูปแบบ `YYYY-MM-DD` + `> borrow_date` + `≤ borrow_date + 14 วัน`
- `purpose` 10–500 ตัวอักษร

คืน `{valid: boolean, errors: [{field, message}]}`

- [ ] ✅ pure function (ไม่มี side effect · ไม่เรียก db โดยตรง)

### M2.B3 · เรียก validator ใน controller `BE`

ใน `createLoan` controller: ดึง equipment จาก service → ส่งเข้า `validateLoan` → ถ้า invalid ตอบ 400 + list errors

- [ ] ✅ `curl -X POST -d '{"quantity":999,...}'` ตอบ 400 + ข้อความ "quantity exceeds available"

### M2.B4 · POST ของจริง `BE`

```bash
curl -X POST http://localhost:3001/api/loans \
  -H "Content-Type: application/json" \
  -d '{"borrowerName":"ทดสอบ ระบบ","equipmentId":"EQ-001","quantity":1,"borrowDate":"2026-10-15","returnDate":"2026-10-20","purpose":"ทดสอบระบบยืมคืน"}'
```

- [ ] ✅ ตอบ 201 + object มี `id = LN-00X`
- [ ] ✅ ลอง POST ซ้ำ · id เพิ่มขึ้น

### M2.B5 · auth ยังทำงาน `BE`

```bash
# login (รหัสจาก seed)
TOKEN=$(curl -s -X POST localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@...","password":"staff1234"}' | jq -r .token)

# ลองลบโดยไม่มี token → 401
curl -X DELETE localhost:3001/api/loans/LN-001

# ลองลบด้วย token → 204
curl -X DELETE -H "Authorization: Bearer $TOKEN" localhost:3001/api/loans/LN-001
```

- [ ] ✅ ไม่มี token = 401 · มี token staff = 204
- [ ] ✅ ลอง login ด้วย role `member` แล้วลบ → 403

### M2.B6 · เพิ่ม `upsertStaff` ใน `server.js` `BE`

ใน `api/src/server.js` ต่อจาก `await loadSeed();`:

```js
import { upsertStaff } from './services/loanService.js';   // หรือไฟล์ที่มี function นี้
import { hashPassword } from './utils/password.js';

if (process.env.STAFF_EMAIL && process.env.STAFF_PASSWORD) {
  upsertStaff({
    email: process.env.STAFF_EMAIL,
    name: 'เจ้าหน้าที่',
    passwordHash: hashPassword(process.env.STAFF_PASSWORD)
  });
}
```

- [ ] ✅ ทดสอบ local: `STAFF_EMAIL=... STAFF_PASSWORD=... npm run dev --prefix api` → login ด้วยรหัสใหม่ได้

### M2.B7 · unit tests ≥ 6 `BE`

สร้าง `api/tests/unit/loanValidator.test.js` ที่ทดสอบค่าขอบ:

- quantity = 0, 1, 10, 11 (ขอบล่าง-บน)
- return_date = วันเดียวกับ borrow_date (ไม่ผ่าน)
- return_date = borrow + 14 (ผ่าน) · borrow + 15 (ไม่ผ่าน) ← **ค่าขอบของกฎเฉพาะ**
- quantity > availableQty (ไม่ผ่าน) ← **ค่าขอบของกฎเฉพาะ**
- purpose สั้นกว่า 10 ตัว / ยาวกว่า 500 ตัว

- [ ] ✅ `npm test --prefix api -- unit` ผ่าน ≥ 6 ข้อ

### M2.B8 · integration tests ≥ 6 `BE`

สร้าง `api/tests/integration/loans.test.js`:

- GET /api/loans → 200 + array
- GET /api/loans/XX-not-exist → 404
- POST /api/loans ด้วย body ถูก → 201
- POST ด้วย body ผิด → 400 + errors
- DELETE โดยไม่มี token → **401**
- DELETE ด้วย token member → **403**
- DELETE ด้วย token staff → **204**

- [ ] ✅ `npm test --prefix api -- integration` ผ่าน ≥ 6 ข้อ

### M2.B9 · ตั้ง Render service `BE/DevOps`

1. [ ] ไปที่ Render Dashboard → New → Blueprint → ชี้ที่ repo
2. [ ] ตั้ง Environment variables:
   - `JWT_SECRET` → `render.yaml` ตั้ง `generateValue: true` อยู่แล้ว · ไม่ต้องกรอก
   - `STAFF_EMAIL` → อีเมลเดียวกับใน seed (เช่น `staff@rmutl.ac.th`)
   - `STAFF_PASSWORD` → รหัสยาว ≥ 12 ตัว · **เก็บไว้แจ้งอาจารย์**
   - `NODE_ENV=production`
3. [ ] ลบบรรทัด `rootDir` จาก `render.yaml` ถ้ายังมี
4. [ ] Deploy

- [ ] ✅ ผ่านเมื่อ: ได้ URL (`https://xxx.onrender.com`) · `/api/health` ตอบ 200

### M2.B10 · ทดสอบ production login `BE/DevOps`

```bash
# ต้อง login ด้วย STAFF_PASSWORD ของ production (ไม่ใช่ staff1234)
curl -X POST https://<url>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@...","password":"<PROD PASSWORD>"}'

# ลอง login ด้วย staff1234 → ต้อง 401 (ไม่ผ่าน)
curl -X POST https://<url>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@...","password":"staff1234"}'
```

- [ ] ✅ รหัส production ผ่าน · รหัส seed ไม่ผ่าน

## ส่วนของ FE (ทำขนาน)

### M2.F1 · `apiClient` + `authStore` `FE`

- `frontend/src/services/apiClient.js` — ห่อ fetch · แนบ `Authorization: Bearer <token>` **ที่เดียว** · ถ้าได้ 401 → ล้าง token → `window.location = '/login'`
- `frontend/src/services/authStore.js` — เก็บ token · export `getToken()` · `setToken()` · `clearToken()` · `getUser()`

- [ ] ✅ `apiClient` เป็น central point เดียว (grep ไม่เจอ `Authorization: Bearer` ที่อื่น)

### M2.F2 · หน้า Login `FE`

- `/login` form email + password
- call `POST /api/auth/login` ผ่าน apiClient
- สำเร็จ → เก็บ token → redirect `/`
- ล้มเหลว → แสดงข้อความเดียวกันทั้งอีเมลผิด/รหัสผิด (ตามที่ API ส่งมา)
- ปุ่ม Logout ที่ nav → `clearToken()` + redirect

- [ ] ✅ login + logout ใช้ได้ใน local

### M2.F3 · หน้า Loans List `FE`

- `/` fetch `GET /api/loans` → แสดงตาราง/การ์ด
- แสดง `equipmentName` จาก JOIN (ไม่ต้อง fetch equipment ซ้ำ)
- Dropdown filter สถานะ → เพิ่ม `?status=` ใน query
- loading / error / empty state

- [ ] ✅ กรองสถานะได้ · ลิงก์ไป `/loans/:id` ได้

### M2.F4 · หน้า Loan Detail `FE`

- `/loans/:id` fetch `GET /api/loans/:id`
- 404 → แสดง "ไม่พบรายการ"
- ปุ่ม "เปลี่ยนสถานะ" + "ลบ" **แสดงเฉพาะเมื่อ `getUser()?.role === 'staff'`**
- ปุ่มเปลี่ยนสถานะ → modal เลือกสถานะใหม่ → `PUT /api/loans/:id`

- [ ] ✅ user ธรรมดาเปิดดูได้ แต่ไม่เห็นปุ่ม

### M2.F5 · หน้า New Loan `FE`

- `/new` form กรอก borrower_name · เลือก equipment จาก `GET /api/equipment` (แสดง `availableQty`) · quantity · borrow_date · return_date · purpose
- client-side validation ตามกฎเดียวกับ API
- POST สำเร็จ → redirect `/loans/:newId`
- POST 400 → แสดง errors จาก API ใต้แต่ละ field

- [ ] ✅ ส่งคำขอได้ · เห็น error ชัดเจน

### M2.F6 · ตั้งค่า Vite สำหรับ production `FE`

แก้ `frontend/vite.config.js`:
```js
export default defineConfig({
  base: "/",                        // ไม่ใช่ /engse203-student-labs...
  build: { outDir: "dist", emptyOutDir: true },
});
```

สร้าง `frontend/.env.production`:
```
VITE_API_BASE=https://<render-url>/api
```

- [ ] ✅ `npm run build --prefix frontend` ได้ `dist/` + `index.html`

## รวมท้าย M2

### M2.X1 · ทดสอบ end-to-end ทั้งคู่ `BOTH`

- [ ] local: FE ยิง API local ได้ · login · ส่งคำขอ · เปลี่ยนสถานะ · ลบ
- [ ] production: เปิด URL จริง · ทำเหมือนกัน

### M2.X2 · Commit + tag `v0.5.0` 🏷 `BE`

```bash
git add -A
git commit -m "M2: loans API + validator + login + first deploy"
git tag v0.5.0
git push && git push origin v0.5.0
```

- [ ] ✅ ผ่านเมื่อ: tag `v0.5.0` อยู่บน GitHub

---

# M2.5 · เสริมคุณภาพ (17–20 ต.ค.)

> ไม่มี tag · แต่เป็นงานหนักของคะแนน A5

## M2.5.1 · unit tests ครบ 10 `BE`

เพิ่มจาก M2.B7 ให้ครบ 10 · ต้องมี **ค่าขอบของกฎ 14 วัน** และ **availableQty**

- [ ] ✅ `npm test --prefix api -- unit` รายงาน ≥ 10

## M2.5.2 · integration tests ครบ 12 `BE`

เพิ่มจาก M2.B8 ให้ครบ 12 · ต้องมี 401 · 403 · เจ้าหน้าที่ทำได้สำเร็จ

- [ ] ✅ `npm test --prefix api -- integration` รายงาน ≥ 12

## M2.5.3 · frontend tests ≥ 3 `FE`

ทดสอบ pure function เช่น:
- `summarizeLoansByStatus(loans)` → นับจำนวนแต่ละสถานะ
- `validateLoanForm(values)` → คืน errors
- `getToken()` อ่าน localStorage ถูก

- [ ] ✅ `npm test --prefix frontend` รายงาน ≥ 3

## M2.5.4 · Dashboard page `FE`

- `/dashboard` fetch `GET /api/loans` · นับแยกสถานะ · แสดงเป็น card 4 ใบ

- [ ] ✅ ตัวเลขตรงกับใน `/` ที่กรองแต่ละสถานะ

## M2.5.5 · `DEBUG_LOG.md` ≥ 2 bug จริง `BE`

เขียน bug ที่**เจอจริง**ระหว่างทำโปรเจกต์ · 6 ช่องแบบ LAB 12 · มี regression test

ตัวอย่าง bug ที่น่าจะเจอ:
- availableQty ติดลบเพราะไม่ได้นับ status `overdue`
- JOIN ไม่คืน equipmentName เพราะเขียน `JOIN` แทน `LEFT JOIN`
- validator ยอมรับ `return_date = borrow_date` เพราะใช้ `>=` แทน `>`

- [ ] ✅ ครบ 2 bug · มี regression test ใน `tests/`

## M2.5.6 · CI badge ใน README `BE/DevOps`

เพิ่มบรรทัดใน README (ใต้ชื่อระบบ):

```md
![CI](https://github.com/ItsPitxh/engse203-final-2-T-07/actions/workflows/check.yml/badge.svg)
```

- [ ] ✅ เห็นป้ายสีเขียวบน GitHub

## M2.5.7 · ⭐ เลือก 1–2 ข้อ `BOTH`

แนะนำ: **ค้นหา** (`?q=`) · **จำกัดการเดารหัส** (429)

- [ ] ✅ ทำ + มี test + สาธิตได้ตอนสัมภาษณ์

---

# M3 · ปิดงาน → `v1.0.0`

> **กำหนด: 22 ต.ค. ก่อนเวลาสอบ**

## M3.1 · กรอก README ครบ `BE/DevOps`

เปิด `README.md` · กรอกทุกส่วนตามแม่แบบ:
- สมาชิก (ตารางครบ)
- ความสามารถของระบบ (ตารางคนทั่วไป / staff)
- ภาพหน้าจอ desktop + มือถือ (upload เป็น png ใน `/docs/` หรือ GitHub attachments)
- ข้อมูล (schema diagram หรือ list ตาราง + ความสัมพันธ์)
- วิธีติดตั้ง · รัน · test · deploy
- URL + บัญชีทดสอบ (dev เท่านั้น · production ไม่เขียนใน repo)
- **การใช้ AI** — บอกว่าใช้ Claude ช่วยทำอะไร (เขียน PLAN · ให้คู่มือ · review schema ฯลฯ) · และยืนยันว่าอธิบายทุกบรรทัดได้

- [ ] ✅ ครบทุกหัวข้อ · ไม่มี `<...>` ค้าง

## M3.2 · `API_CONTRACT.md` ตรงกับโค้ด `BOTH`

เปิดเทียบทีละ endpoint:
- method · path · request body · response body · status code · error messages
- ตรงกับที่ API จริงคืน (ยิง curl เทียบ)

- [ ] ✅ ไม่มี field ที่ contract บอกแต่ API ไม่คืน (หรือกลับกัน)

## M3.3 · ติ๊ก `RELEASE_CHECKLIST.md` ครบ `BE/DevOps`

เปิดทุกข้อ · ติ๊กพร้อม**หลักฐาน** (จำนวน test · ลิงก์ CI · URL · ภาพ)

ข้อที่ทำไม่ได้ → ติ๊กแล้วเขียน `ยกเว้น: <เหตุผล>` (เช่น Turso สำหรับทีมคู่)

- [ ] ✅ ทุกข้อติ๊กหมด

## M3.4 · ทดสอบด้วย `check-project.mjs` `BE`

```bash
node --disable-warning=ExperimentalWarning check-project.mjs
node --disable-warning=ExperimentalWarning check-project.mjs --online
```

- [ ] ✅ ไม่มี FAIL แดง (ข้ามข้อ `--skip-build` ได้)
- [ ] ถ้าเจอ FAIL → แก้แล้วรันซ้ำจนผ่าน

## M3.5 · ตรวจเรื่อง security รอบสุดท้าย `BE/DevOps`

```bash
# ไม่มี secret
git ls-files | grep -E '\.env$' | grep -v example
# ควรว่าง (ไม่มี .env จริง)

# ไม่มี node_modules
git ls-files | grep node_modules
# ควรว่าง

# ไม่มี .db
git ls-files | grep '\.db$'
# ควรว่าง

# audit
npm audit --prefix api
npm audit --prefix frontend
```

- [ ] ✅ ผ่านทั้ง 4 เช็ค · ไม่มี high/critical ค้างใน audit

## M3.6 · แจ้งรหัส production ให้อาจารย์ `BE/DevOps`

- [ ] ส่ง `STAFF_EMAIL` + `STAFF_PASSWORD` ของ Render ให้อาจารย์ตามช่องทางที่ประกาศใน LMS (ไม่ใช่ใน repo · ไม่ใช่ใน PR)

## M3.7 · Tag `v1.0.0` 🏷 `BE`

```bash
# ต้องแน่ใจว่าทุกอย่าง commit แล้ว
git status                       # clean
git log --oneline -5             # commit ล่าสุดคือเวอร์ชันที่จะส่ง

git tag v1.0.0
git push origin main
git push origin v1.0.0
```

- [ ] ✅ tag `v1.0.0` อยู่บน GitHub
- [ ] ✅ URL ที่ deploy อยู่ที่ commit ของ tag นี้ (ไม่มี commit ใหม่หลัง tag)

## M3.8 · ส่งลิงก์ใน LMS `BOTH`

- [ ] ส่งลิงก์ repo + URL deploy ใน LMS
- [ ] ส่งก่อนเวลาสอบของ Section 2 (22 ต.ค.)
- [ ] **หลังจากนี้ห้าม commit — commit หลัง `v1.0.0` ไม่คิดคะแนน**

## M3.PR · ส่ง Peer Review `BOTH`

- [ ] **17 ต.ค.** ครั้งที่ 1 (ไม่คิดคะแนน · เตือนกันเอง) — ส่งผ่านฟอร์มที่อาจารย์ประกาศใน LMS
- [ ] **22 ต.ค. หลังสัมภาษณ์** ครั้งที่ 2 (คิดคะแนน I3) — ตอบ 4 ข้อ + หลักฐาน 1 ตัวอย่างต่อเพื่อน + ประเมินตัวเอง 3 ข้อ
- ⚠ ส่งเป็นรายบุคคล · **ไม่อยู่ใน repo** · เพื่อนไม่เห็นคะแนนที่คุณให้

## M3.9 · เตรียม demo 3 นาที `BOTH`

เตรียมเปิด:
1. URL deploy
2. ส่งคำขอยืมเป็นคนทั่วไป (ไม่ login)
3. Login เจ้าหน้าที่
4. เปลี่ยนสถานะคำขอ requested → borrowed
5. แสดงให้เห็นว่า user ธรรมดากด DELETE ไม่ได้ (401/403 ใน DevTools)
6. เปิด GitHub Actions tab แสดง CI ผ่าน

ซ้อม 1–2 รอบก่อนวันสอบ

- [ ] ✅ ซ้อมแล้วทำได้ใน ≤ 3 นาที

---

# สรุปจำนวน milestones

| ขั้น | จำนวน sub-steps |
|---|---:|
| M1 | 19 |
| M2 (BE) | 10 |
| M2 (FE) | 6 |
| M2.X | 2 |
| M2.5 | 7 |
| M3 | 9 |
| **รวม** | **53** |

ทำได้ 53 ข้อนี้ครบ = ได้คะแนนเต็มส่วนผลงาน + คะแนนรายบุคคลสูงด้วย

> 💡 เปิดไฟล์นี้ใน VS Code แล้วติ๊กไปทีละข้อ · commit ไฟล์นี้บ่อยๆ จะเห็นความก้าวหน้าใน git log

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
  console.log(`อนุญาตให้เรียกจาก: ${config.corsOrigin ?? "http://localhost:5173"}`);
});

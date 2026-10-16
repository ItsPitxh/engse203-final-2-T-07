import { Router } from 'express';
import * as service from '../services/loanService.js';

// ⭐ endpoint สำหรับดูผู้ใช้และคำร้องของแต่ละคน
// ใช้ฐานข้อมูลผ่าน service เหมือน route อื่น — ไม่เปิด connection เอง
// (เดิมเปิด DatabaseSync ตรงนี้ ทำให้ test ที่ใช้ฐานข้อมูลในหน่วยความจำไม่เห็นข้อมูลชุดเดียวกัน)
const router = Router();

router.get('/', (req, res) => {
  res.json(service.listUsers());
});

router.get('/:id/loans', (req, res) => {
  res.json(service.listLoansByUser(Number(req.params.id)));
});

export default router;

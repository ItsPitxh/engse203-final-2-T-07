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
  // ส่ง equipment context ให้ validator ตรวจ availableQty + equipmentId
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

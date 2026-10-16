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

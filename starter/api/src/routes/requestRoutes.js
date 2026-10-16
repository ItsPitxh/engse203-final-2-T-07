import { Router } from 'express';
import * as controller from '../controllers/requestController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// route เจาะจงต้องมาก่อน route ที่มี :id เสมอ
router.get('/', controller.listRequests);
router.post('/', validateRequest, controller.createRequest);
router.get('/:id', controller.getRequest);

// Week 13 · CP51 — เปลี่ยนสถานะและลบคำร้อง ได้เฉพาะเจ้าหน้าที่
router.put('/:id', authenticate, requireRole('staff'), controller.updateRequestStatus);
router.delete('/:id', authenticate, requireRole('staff'), controller.deleteRequest);

export default router;

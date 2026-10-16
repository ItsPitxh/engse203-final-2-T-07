import { Router } from 'express';
import * as controller from '../controllers/loanController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/',    controller.listLoans);
router.post('/',   controller.createLoan);
router.get('/:id', controller.getLoan);

// เฉพาะเจ้าหน้าที่
router.put('/:id',    authenticate, requireRole('staff'), controller.updateLoanStatus);
router.delete('/:id', authenticate, requireRole('staff'), controller.deleteLoan);

export default router;

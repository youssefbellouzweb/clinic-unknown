import express from 'express';
import * as billingController from '../controllers/billing.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, createBillSchema, updateBillSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

// Billing Routes (Reception, Admin, Owner)
router.post('/', authorize(['reception', 'admin', 'owner']), validate(createBillSchema), billingController.createBill);
router.get('/', authorize(['reception', 'admin', 'owner']), billingController.getBills);
router.put('/:id', authorize(['reception', 'admin', 'owner']), validate(updateBillSchema), billingController.updateBill);
router.delete('/:id', authorize(['reception', 'admin', 'owner']), billingController.deleteBill);

export default router;

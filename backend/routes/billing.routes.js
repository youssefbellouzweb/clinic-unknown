import express from 'express';
import billingController from '../controllers/billing.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

// Billing Routes (Reception, Admin, Owner)
router.post('/', authorize(['reception', 'admin', 'owner']), billingController.createInvoice);
router.get('/', authorize(['reception', 'admin', 'owner']), billingController.getInvoices);
router.get('/:id', authorize(['reception', 'admin', 'owner']), billingController.getInvoiceById);
router.put('/:id/status', authorize(['reception', 'admin', 'owner']), billingController.updateStatus);

export default router;

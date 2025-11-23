import express from 'express';
import * as auditLogController from '../controllers/auditLog.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['owner', 'admin']));

router.get('/', auditLogController.getClinicAuditLogs);

export default router;

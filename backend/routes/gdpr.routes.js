import express from 'express';
import * as gdprController from '../controllers/gdpr.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['owner', 'admin'])); // Restricted to admins

router.get('/patients/:id/export', auditMiddleware('GDPR_EXPORT'), gdprController.exportData);
router.delete('/patients/:id/gdpr-delete', auditMiddleware('GDPR_DELETE'), gdprController.deleteData);

export default router;

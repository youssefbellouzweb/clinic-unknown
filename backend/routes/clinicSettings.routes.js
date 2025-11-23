import express from 'express';
import * as clinicSettingsController from '../controllers/clinicSettings.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

router.use(authenticate);

// Only Owner and Admin can manage settings
router.use(authorize(['owner', 'admin']));

router.get('/', clinicSettingsController.getSettings);
router.put('/', auditMiddleware('UPDATE_CLINIC_SETTINGS'), clinicSettingsController.updateSettings);
router.post('/logo', auditMiddleware('UPDATE_CLINIC_LOGO'), clinicSettingsController.updateLogo);
router.get('/schema', clinicSettingsController.getSchema);

export default router;

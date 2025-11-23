import express from 'express';
import * as clinicController from '../controllers/clinic.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, updateClinicSchema } from '../utils/validators.js';
// import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

router.use(authenticate);

router.get('/my-clinic', authorize(['owner', 'admin']), clinicController.getMyClinic);
router.put('/my-clinic', authorize(['owner', 'admin']), validate(updateClinicSchema), clinicController.updateClinic);

export default router;

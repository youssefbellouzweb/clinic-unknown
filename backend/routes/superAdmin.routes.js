import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
// import { auditMiddleware } from '../middleware/audit.js';
import * as superAdminController from '../controllers/superAdmin.controller.js';

const router = express.Router();

// All super admin routes require authentication and super_admin role
router.use(authenticate);
router.use(authorize(['super_admin']));

// Clinic management
router.get('/clinics',
    superAdminController.getAllClinics
);

router.get('/clinics/:id',
    superAdminController.getClinicDetails
);

router.put('/clinics/:id/activate',
    superAdminController.activateClinic
);

router.put('/clinics/:id/deactivate',
    superAdminController.deactivateClinic
);

router.delete('/clinics/:id',
    superAdminController.deleteClinic
);

// Platform analytics
router.get('/analytics',
    superAdminController.getPlatformAnalytics
);

router.get('/metrics/users', superAdminController.getMetricsUsers);
router.get('/metrics/appointments', superAdminController.getMetricsAppointments);
router.get('/metrics/performance', superAdminController.getMetricsPerformance);

// Support Access
router.get('/clinics/:id/data', superAdminController.getClinicSupportData);

// Audit logs
router.get('/audit-logs',
    superAdminController.getAuditLogs
);

export default router;

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

// Dashboard analytics (all staff roles)
router.get('/dashboard',
    authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']),
    analyticsController.getDashboard
);

// Appointment statistics (owner, admin)
router.get('/appointments',
    authorize(['owner', 'admin']),
    analyticsController.getAppointmentStats
);

// Doctor performance (owner, admin)
router.get('/doctors',
    authorize(['owner', 'admin']),
    analyticsController.getDoctorPerformance
);

export default router;

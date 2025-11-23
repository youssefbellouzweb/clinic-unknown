import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, patientPortalRegisterSchema, patientPortalLoginSchema, createAppointmentSchema } from '../utils/validators.js';
import { authLimiter, appointmentLimiter } from '../middleware/rateLimiting.js';
import { auditMiddleware } from '../middleware/audit.js';
import * as patientPortalController from '../controllers/patientPortal.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register',
    authLimiter,
    validate(patientPortalRegisterSchema),
    auditMiddleware('PATIENT_PORTAL_REGISTER'),
    patientPortalController.register
);

router.post('/login',
    authLimiter,
    validate(patientPortalLoginSchema),
    patientPortalController.login
);

// Protected routes (require patient portal authentication)
router.use(authenticate);

// Profile management
router.get('/profile',
    patientPortalController.getProfile
);

router.put('/profile',
    auditMiddleware('UPDATE_PATIENT_PROFILE'),
    patientPortalController.updateProfile
);

// Appointment management
router.get('/appointments',
    patientPortalController.getAppointments
);

router.post('/appointments',
    appointmentLimiter,
    validate(createAppointmentSchema),
    auditMiddleware('REQUEST_APPOINTMENT'),
    patientPortalController.requestAppointment
);

router.delete('/appointments/:id',
    auditMiddleware('CANCEL_APPOINTMENT'),
    patientPortalController.cancelAppointment
);

// Billing and Prescriptions
router.get('/bills', patientPortalController.getBills);
router.get('/prescriptions', patientPortalController.getPrescriptions);

export default router;

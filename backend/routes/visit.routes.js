import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, createVisitSchema, updateVisitSchema } from '../utils/validators.js';
// import { auditMiddleware } from '../middleware/audit.js';
import * as visitController from '../controllers/visit.controller.js';

const router = express.Router();

// All visit routes require authentication
router.use(authenticate);

// Create visit (doctor, admin, owner)
router.post('/',
    authorize(['doctor', 'admin', 'owner']),
    validate(createVisitSchema),
    visitController.createVisit
);

// Get all visits (staff)
router.get('/',
    authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']),
    visitController.getVisits
);

// Get patient visits (staff)
router.get('/patient/:patientId',
    authorize(['owner', 'admin', 'doctor', 'nurse']),
    visitController.getPatientVisits
);

// Get doctor's own visits
router.get('/doctor',
    authorize(['doctor']),
    visitController.getDoctorVisits
);

// Get single visit (staff)
router.get('/:id',
    authorize(['owner', 'admin', 'doctor', 'nurse']),
    visitController.getVisit
);

// Update visit (doctor, admin, owner)
router.put('/:id',
    authorize(['doctor', 'admin', 'owner']),
    validate(updateVisitSchema),
    visitController.updateVisit
);

export default router;

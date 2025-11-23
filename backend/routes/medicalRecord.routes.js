import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, createMedicalRecordSchema, updateMedicalRecordSchema } from '../utils/validators.js';
// import { auditMiddleware } from '../middleware/audit.js';
import * as medicalRecordController from '../controllers/medicalRecord.controller.js';

const router = express.Router();

// All medical record routes require authentication
router.use(authenticate);

// Create medical record (doctor, admin, owner)
router.post('/',
    authorize(['doctor', 'admin', 'owner']),
    validate(createMedicalRecordSchema),
    medicalRecordController.createMedicalRecord
);

// Get all medical records (staff)
router.get('/',
    authorize(['owner', 'admin', 'doctor', 'nurse']),
    medicalRecordController.getMedicalRecords
);

// Get patient medical records (staff)
router.get('/patient/:patientId',
    authorize(['owner', 'admin', 'doctor', 'nurse']),
    medicalRecordController.getPatientMedicalRecords
);

// Get single medical record (staff)
router.get('/:id',
    authorize(['owner', 'admin', 'doctor', 'nurse']),
    medicalRecordController.getMedicalRecord
);

// Update medical record (doctor, admin, owner)
router.put('/:id',
    authorize(['doctor', 'admin', 'owner']),
    validate(updateMedicalRecordSchema),
    medicalRecordController.updateMedicalRecord
);

// Delete medical record (owner, admin)
router.delete('/:id',
    authorize(['owner', 'admin']),
    medicalRecordController.deleteMedicalRecord
);

export default router;

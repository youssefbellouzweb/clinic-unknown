import express from 'express';
import * as patientController from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, createPatientSchema, updatePatientSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), patientController.getPatients);
router.get('/:id', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), patientController.getPatient);
router.post('/', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), validate(createPatientSchema), patientController.createPatient);
router.put('/:id', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), validate(updatePatientSchema), patientController.updatePatient);
router.delete('/:id', authorize(['owner', 'admin', 'reception']), patientController.deletePatient);

export default router;

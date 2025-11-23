import express from 'express';
import * as doctorController from '../controllers/doctor.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, createMedicalNoteSchema, updateMedicalNoteSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

// Schedule
router.get('/schedule', authorize(['doctor', 'owner', 'admin']), doctorController.getSchedule);

// Medical Notes
router.post('/notes', authorize(['doctor']), validate(createMedicalNoteSchema), doctorController.createNote);
router.get('/notes/:patientId', authorize(['doctor', 'owner', 'admin', 'nurse']), doctorController.getNotes);
router.put('/notes/:id', authorize(['doctor']), validate(updateMedicalNoteSchema), doctorController.updateNote);
router.delete('/notes/:id', authorize(['doctor', 'owner', 'admin']), doctorController.deleteNote);

// Prescriptions (Post-MVP)
router.get('/prescriptions/:patientId', authorize(['doctor', 'owner', 'admin', 'nurse', 'pharmacist']), doctorController.getPrescriptions);

export default router;

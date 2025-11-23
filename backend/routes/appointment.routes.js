import express from 'express';
import * as appointmentController from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, createAppointmentSchema, updateAppointmentSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/calendar', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), appointmentController.getCalendar);
router.get('/', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), appointmentController.getAppointments);
router.get('/:id', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), appointmentController.getAppointment);
router.post('/', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), validate(createAppointmentSchema), appointmentController.createAppointment);
router.put('/:id', authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']), validate(updateAppointmentSchema), appointmentController.updateAppointment);
router.delete('/:id', authorize(['owner', 'admin', 'reception']), appointmentController.deleteAppointment);

export default router;

import express from 'express';
import * as visitorController from '../controllers/visitor.controller.js';
import { validate, publicAppointmentRequestSchema } from '../utils/validators.js';
import { apiLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

router.get('/clinics', visitorController.searchClinics);
router.get('/clinics/:slug', visitorController.getClinicProfile);
router.post('/appointment-request', apiLimiter, validate(publicAppointmentRequestSchema), visitorController.requestAppointment);
router.get('/cities', visitorController.getCities);
router.get('/specialties', visitorController.getSpecialties);

export default router;

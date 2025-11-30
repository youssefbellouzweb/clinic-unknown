import express from 'express';
import bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Get available doctors
router.get('/doctors', bookingController.getAvailableDoctors);

// Get available time slots
router.get('/slots', bookingController.getAvailableSlots);

// Book appointment
router.post('/book', bookingController.bookAppointment);

// Cancel appointment
router.put('/cancel/:id', bookingController.cancelAppointment);

// Reschedule appointment
router.put('/reschedule/:id', bookingController.rescheduleAppointment);

export default router;

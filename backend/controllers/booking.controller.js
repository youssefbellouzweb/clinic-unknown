import bookingService from '../services/booking.service.js';
import logger from '../utils/logger.js';

class BookingController {
    async getAvailableDoctors(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const doctors = bookingService.getAvailableDoctors(clinicId);
            res.json({ data: doctors });
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to get doctors');
            res.status(500).json({ error: 'Failed to get doctors' });
        }
    }

    async getAvailableSlots(req, res) {
        try {
            const { doctorId, date } = req.query;

            if (!doctorId || !date) {
                return res.status(400).json({ error: 'Doctor ID and date are required' });
            }

            const slots = bookingService.getAvailableSlots(doctorId, date);
            res.json({ data: slots });
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to get available slots');
            res.status(500).json({ error: 'Failed to get available slots' });
        }
    }

    async bookAppointment(req, res) {
        try {
            const { doctorId, datetime } = req.body;
            const patientId = req.user.id;
            const clinicId = req.user.clinic_id;

            if (!doctorId || !datetime) {
                return res.status(400).json({ error: 'Doctor ID and datetime are required' });
            }

            const result = bookingService.bookAppointment(patientId, doctorId, datetime, clinicId);
            res.status(201).json({ data: result, message: 'Appointment booked successfully' });
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to book appointment');
            res.status(500).json({ error: error.message || 'Failed to book appointment' });
        }
    }

    async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const patientId = req.user.id;

            const result = bookingService.cancelAppointment(id, patientId);
            res.json({ data: result, message: 'Appointment cancelled successfully' });
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to cancel appointment');
            res.status(500).json({ error: error.message || 'Failed to cancel appointment' });
        }
    }

    async rescheduleAppointment(req, res) {
        try {
            const { id } = req.params;
            const { datetime } = req.body;
            const patientId = req.user.id;

            if (!datetime) {
                return res.status(400).json({ error: 'New datetime is required' });
            }

            const result = bookingService.rescheduleAppointment(id, datetime, patientId);
            res.json({ data: result, message: 'Appointment rescheduled successfully' });
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to reschedule appointment');
            res.status(500).json({ error: error.message || 'Failed to reschedule appointment' });
        }
    }
}

export default new BookingController();

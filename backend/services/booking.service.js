import db from '../config/db.js';
import logger from '../utils/logger.js';

class BookingService {
    /**
     * Get available time slots for a doctor on a specific date
     */
    getAvailableSlots(doctorId, date) {
        try {
            // Get all appointments for the doctor on that date
            const appointments = db.prepare(`
                SELECT datetime FROM appointments
                WHERE doctor_id = ? AND date(datetime) = ?
            `).all(doctorId, date);

            // Generate time slots (8 AM to 6 PM, 30-minute intervals)
            const slots = [];
            const startHour = 8;
            const endHour = 18;

            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute of [0, 30]) {
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const datetime = `${date} ${timeStr}:00`;

                    // Check if slot is taken
                    const isTaken = appointments.some(apt =>
                        apt.datetime.includes(timeStr)
                    );

                    if (!isTaken) {
                        slots.push({
                            time: timeStr,
                            datetime: datetime,
                            available: true
                        });
                    }
                }
            }

            return slots;
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to get available slots');
            throw error;
        }
    }

    /**
     * Get all available doctors
     */
    getAvailableDoctors(clinicId) {
        try {
            return db.prepare(`
                SELECT id, name, specialization, email
                FROM users
                WHERE clinic_id = ? AND role = 'doctor'
                ORDER BY name ASC
            `).all(clinicId);
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to get doctors');
            throw error;
        }
    }

    /**
     * Book an appointment
     */
    bookAppointment(patientId, doctorId, datetime, clinicId) {
        try {
            // Check if slot is still available
            const existing = db.prepare(`
                SELECT id FROM appointments
                WHERE doctor_id = ? AND datetime = ?
            `).get(doctorId, datetime);

            if (existing) {
                throw new Error('This time slot is no longer available');
            }

            // Create appointment
            const result = db.prepare(`
                INSERT INTO appointments (patient_id, doctor_id, datetime, status, clinic_id)
                VALUES (?, ?, ?, 'pending', ?)
            `).run(patientId, doctorId, datetime, clinicId);

            return { id: result.lastInsertRowid };
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to book appointment');
            throw error;
        }
    }

    /**
     * Cancel appointment
     */
    cancelAppointment(appointmentId, patientId) {
        try {
            const result = db.prepare(`
                UPDATE appointments
                SET status = 'cancelled'
                WHERE id = ? AND patient_id = ?
            `).run(appointmentId, patientId);

            if (result.changes === 0) {
                throw new Error('Appointment not found or unauthorized');
            }

            return { success: true };
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to cancel appointment');
            throw error;
        }
    }

    /**
     * Reschedule appointment
     */
    rescheduleAppointment(appointmentId, newDatetime, patientId) {
        try {
            const result = db.prepare(`
                UPDATE appointments
                SET datetime = ?
                WHERE id = ? AND patient_id = ?
            `).run(newDatetime, appointmentId, patientId);

            if (result.changes === 0) {
                throw new Error('Appointment not found or unauthorized');
            }

            return { success: true };
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to reschedule appointment');
            throw error;
        }
    }
}

export default new BookingService();

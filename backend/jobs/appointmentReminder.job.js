import cron from 'node-cron';
import db from '../config/db.js';
import notificationService from '../services/notification.service.js';
import emailService from '../services/email.service.js';
import logger from '../utils/logger.js';

// Run every hour
cron.schedule('0 * * * *', async () => {
    try {
        // Get appointments in next 24 hours
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = db.prepare(`
            SELECT a.*, p.name as patient_name, p.email as patient_email,
                   u.name as doctor_name, c.name as clinic_name,
                   c.address as clinic_address, c.phone as clinic_phone
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users u ON a.doctor_id = u.id
            JOIN clinics c ON a.clinic_id = c.id
            WHERE a.datetime BETWEEN datetime('now') AND datetime('now', '+24 hours')
              AND a.status = 'confirmed'
        `).all();

        for (const apt of appointments) {
            // Check if reminder already sent
            const existing = db.prepare(`
                SELECT id FROM notifications
                WHERE category = 'appointment_reminder'
                  AND data LIKE '%"appointmentId":${apt.id}%'
            `).get();

            if (!existing) {
                // Send reminder
                await emailService.sendAppointmentReminder(
                    apt,
                    { name: apt.patient_name, email: apt.patient_email },
                    { name: apt.clinic_name, address: apt.clinic_address, phone: apt.clinic_phone }
                );

                // Create notification record
                notificationService.createNotification(
                    apt.clinic_id,
                    null,
                    'email',
                    'appointment_reminder',
                    'Appointment Reminder',
                    `Your appointment is tomorrow at ${new Date(apt.datetime).toLocaleString()}`,
                    { appointmentId: apt.id, email: apt.patient_email }
                );
            }
        }

        logger.info({ count: appointments.length }, 'Appointment reminders sent');
    } catch (error) {
        logger.error({ error: error.message }, 'Appointment reminder job failed');
    }
});

logger.info('Appointment reminder job scheduled');

import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

class EmailService {
    constructor() {
        this.from = {
            email: process.env.EMAIL_FROM || 'noreply@clinichub.com',
            name: process.env.EMAIL_FROM_NAME || 'ClinicHub'
        };
    }

    /**
     * Send email using template
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} templateName - Template file name
     * @param {object} data - Template data
     */
    async sendEmail(to, subject, templateName, data = {}) {
        try {
            const templatePath = path.join(__dirname, '../config/email-templates', `${templateName}.ejs`);
            const html = await ejs.renderFile(templatePath, data);

            const msg = {
                to,
                from: this.from,
                subject,
                html
            };

            await sgMail.send(msg);
            logger.info({ to, subject }, 'Email sent successfully');
            return true;
        } catch (error) {
            logger.error({ error: error.message, to, subject }, 'Email sending failed');
            throw error;
        }
    }

    /**
     * Send appointment reminder
     */
    async sendAppointmentReminder(appointment, patient, clinic) {
        const subject = `Appointment Reminder - ${clinic.name}`;
        const data = {
            patientName: patient.name,
            clinicName: clinic.name,
            appointmentDate: appointment.datetime,
            doctorName: appointment.doctor_name,
            clinicAddress: clinic.address,
            clinicPhone: clinic.phone
        };

        return this.sendEmail(patient.email || patient.phone, subject, 'appointment-reminder', data);
    }

    /**
     * Send appointment confirmation
     */
    async sendAppointmentConfirmation(appointment, patient, clinic) {
        const subject = `Appointment Confirmed - ${clinic.name}`;
        const data = {
            patientName: patient.name,
            clinicName: clinic.name,
            appointmentDate: appointment.datetime,
            doctorName: appointment.doctor_name,
            clinicAddress: clinic.address,
            clinicPhone: clinic.phone
        };

        return this.sendEmail(patient.email || patient.phone, subject, 'appointment-confirmation', data);
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(user, resetToken) {
        const subject = 'Password Reset Request';
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const data = {
            userName: user.name,
            resetUrl,
            expiryHours: 1
        };

        return this.sendEmail(user.email, subject, 'password-reset', data);
    }

    /**
     * Send user invitation
     */
    async sendUserInvitation(email, clinic, role, invitationToken) {
        const subject = `Invitation to join ${clinic.name}`;
        const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
        const data = {
            clinicName: clinic.name,
            role,
            invitationUrl,
            expiryDays: 7
        };

        return this.sendEmail(email, subject, 'user-invitation', data);
    }

    /**
     * Send lab result notification
     */
    async sendLabResultNotification(patient, labRequest, clinic) {
        const subject = `Lab Results Ready - ${clinic.name}`;
        const data = {
            patientName: patient.name,
            clinicName: clinic.name,
            testType: labRequest.test_type,
            portalUrl: `${process.env.FRONTEND_URL}/patient/lab-results`
        };

        return this.sendEmail(patient.email, subject, 'lab-result-ready', data);
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(user, clinic) {
        const subject = `Welcome to ${clinic.name}`;
        const data = {
            userName: user.name,
            clinicName: clinic.name,
            loginUrl: `${process.env.FRONTEND_URL}/login`,
            supportEmail: this.from.email
        };

        return this.sendEmail(user.email, subject, 'welcome', data);
    }

    /**
     * Send bulk emails
     */
    async sendBulkEmails(recipients, subject, templateName, data = {}) {
        const promises = recipients.map(recipient =>
            this.sendEmail(recipient, subject, templateName, data)
        );

        return Promise.allSettled(promises);
    }
}

export default new EmailService();

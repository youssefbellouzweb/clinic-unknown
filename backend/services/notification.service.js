import db from '../config/db.js';
import emailService from './email.service.js';
import logger from '../utils/logger.js';

class NotificationService {
    /**
     * Create notification
     * @param {number} clinicId - Clinic ID
     * @param {number} userId - User ID (optional)
     * @param {string} type - Notification type (email, sms, in_app)
     * @param {string} category - Category (appointment_reminder, password_reset, etc.)
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {object} data - Additional data
     */
    createNotification(clinicId, userId, type, category, title, message, data = {}) {
        const stmt = db.prepare(`
            INSERT INTO notifications (clinic_id, user_id, type, category, title, message, data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            clinicId,
            userId,
            type,
            category,
            title,
            message,
            JSON.stringify(data)
        );

        return result.lastInsertRowid;
    }

    /**
     * Send notification
     * @param {number} notificationId - Notification ID
     */
    async sendNotification(notificationId) {
        const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId);

        if (!notification) {
            throw new Error('Notification not found');
        }

        try {
            if (notification.type === 'email') {
                // Send email based on category
                await this.sendEmailNotification(notification);
            } else if (notification.type === 'sms') {
                // Send SMS (implement later)
                logger.info({ notificationId }, 'SMS sending not implemented yet');
            }

            // Mark as sent
            db.prepare('UPDATE notifications SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run('sent', notificationId);

            logger.info({ notificationId }, 'Notification sent successfully');
            return true;
        } catch (error) {
            db.prepare('UPDATE notifications SET status = ? WHERE id = ?')
                .run('failed', notificationId);

            logger.error({ error: error.message, notificationId }, 'Notification sending failed');
            throw error;
        }
    }

    /**
     * Send email notification
     */
    async sendEmailNotification(notification) {
        const data = JSON.parse(notification.data || '{}');

        // Get user email if user_id is provided
        let email = data.email;
        if (notification.user_id && !email) {
            const user = db.prepare('SELECT email FROM users WHERE id = ?').get(notification.user_id);
            email = user?.email;
        }

        if (!email) {
            throw new Error('No email address found');
        }

        // Send based on category
        switch (notification.category) {
            case 'appointment_reminder':
            case 'appointment_confirmation':
                await emailService.sendEmail(email, notification.title, notification.category, data);
                break;
            case 'password_reset':
                await emailService.sendPasswordReset(data.user, data.resetToken);
                break;
            case 'user_invitation':
                await emailService.sendUserInvitation(email, data.clinic, data.role, data.invitationToken);
                break;
            case 'lab_result_ready':
                await emailService.sendLabResultNotification(data.patient, data.labRequest, data.clinic);
                break;
            default:
                // Generic email
                await emailService.sendEmail(email, notification.title, 'generic', {
                    title: notification.title,
                    message: notification.message,
                    ...data
                });
        }
    }

    /**
     * Get user notifications
     * @param {number} userId - User ID
     * @param {boolean} unreadOnly - Get only unread notifications
     */
    getUserNotifications(userId, unreadOnly = false) {
        let query = 'SELECT * FROM notifications WHERE user_id = ?';
        if (unreadOnly) {
            query += ' AND read = 0';
        }
        query += ' ORDER BY created_at DESC LIMIT 50';

        return db.prepare(query).all(userId);
    }

    /**
     * Mark notification as read
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID
     */
    markAsRead(notificationId, userId) {
        const stmt = db.prepare(`
            UPDATE notifications 
            SET read = 1 
            WHERE id = ? AND user_id = ?
        `);

        return stmt.run(notificationId, userId);
    }

    /**
     * Mark all as read
     * @param {number} userId - User ID
     */
    markAllAsRead(userId) {
        const stmt = db.prepare(`
            UPDATE notifications 
            SET read = 1 
            WHERE user_id = ? AND read = 0
        `);

        return stmt.run(userId);
    }

    /**
     * Get notification preferences
     * @param {number} userId - User ID
     */
    getPreferences(userId) {
        let prefs = db.prepare('SELECT * FROM notification_preferences WHERE user_id = ?').get(userId);

        // Create default preferences if not exists
        if (!prefs) {
            db.prepare(`
                INSERT INTO notification_preferences (user_id)
                VALUES (?)
            `).run(userId);

            prefs = db.prepare('SELECT * FROM notification_preferences WHERE user_id = ?').get(userId);
        }

        return prefs;
    }

    /**
     * Update notification preferences
     * @param {number} userId - User ID
     * @param {object} preferences - Preferences object
     */
    updatePreferences(userId, preferences) {
        const {
            email_enabled,
            sms_enabled,
            in_app_enabled,
            appointment_reminders
        } = preferences;

        const stmt = db.prepare(`
            UPDATE notification_preferences 
            SET email_enabled = ?,
                sms_enabled = ?,
                in_app_enabled = ?,
                appointment_reminders = ?
            WHERE user_id = ?
        `);

        return stmt.run(
            email_enabled !== undefined ? email_enabled : 1,
            sms_enabled !== undefined ? sms_enabled : 1,
            in_app_enabled !== undefined ? in_app_enabled : 1,
            appointment_reminders !== undefined ? appointment_reminders : 1,
            userId
        );
    }

    /**
     * Delete old notifications
     * @param {number} days - Delete notifications older than X days
     */
    deleteOldNotifications(days = 30) {
        const stmt = db.prepare(`
            DELETE FROM notifications 
            WHERE created_at < datetime('now', '-' || ? || ' days')
        `);

        const result = stmt.run(days);
        logger.info({ deleted: result.changes }, 'Old notifications deleted');
        return result.changes;
    }
}

export default new NotificationService();

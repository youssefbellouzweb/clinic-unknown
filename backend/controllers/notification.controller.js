import notificationService from '../services/notification.service.js';
import logger from '../utils/logger.js';

class NotificationController {
    async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { unreadOnly } = req.query;

            const notifications = notificationService.getUserNotifications(
                userId,
                unreadOnly === 'true'
            );

            res.json({ notifications });
        } catch (error) {
            logger.error({ error: error.message }, 'Get notifications failed');
            res.status(500).json({ error: 'Failed to retrieve notifications' });
        }
    }

    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            notificationService.markAsRead(parseInt(id), userId);

            res.json({ message: 'Notification marked as read' });
        } catch (error) {
            logger.error({ error: error.message }, 'Mark as read failed');
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    }

    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            notificationService.markAllAsRead(userId);

            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            logger.error({ error: error.message }, 'Mark all as read failed');
            res.status(500).json({ error: 'Failed to mark all as read' });
        }
    }

    async getPreferences(req, res) {
        try {
            const userId = req.user.id;
            const preferences = notificationService.getPreferences(userId);

            res.json({ preferences });
        } catch (error) {
            logger.error({ error: error.message }, 'Get preferences failed');
            res.status(500).json({ error: 'Failed to retrieve preferences' });
        }
    }

    async updatePreferences(req, res) {
        try {
            const userId = req.user.id;
            const preferences = req.body;

            notificationService.updatePreferences(userId, preferences);

            res.json({ message: 'Preferences updated successfully' });
        } catch (error) {
            logger.error({ error: error.message }, 'Update preferences failed');
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    }
}

export default new NotificationController();

import axios from 'axios';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000/api';

class NotificationService {
    async getNotifications(unreadOnly = false) {
        const response = await axios.get(
            `${API_URL}/notifications${unreadOnly ? '?unreadOnly=true' : ''}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data.notifications;
    }

    async markAsRead(id) {
        const response = await axios.put(
            `${API_URL}/notifications/${id}/read`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    }

    async markAllAsRead() {
        const response = await axios.put(
            `${API_URL}/notifications/read-all`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    }

    async getPreferences() {
        const response = await axios.get(
            `${API_URL}/notifications/preferences`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data.preferences;
    }

    async updatePreferences(preferences) {
        const response = await axios.put(
            `${API_URL}/notifications/preferences`,
            preferences,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    }
}

export default new NotificationService();

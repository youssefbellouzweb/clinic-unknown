import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import notificationService from '../../lib/notificationService';

const NotificationBell = ({ onOpen }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadUnreadCount();
        // Poll every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const notifications = await notificationService.getNotifications(true);
            setUnreadCount(notifications.length);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    return (
        <button
            onClick={onOpen}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
        >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationBell;

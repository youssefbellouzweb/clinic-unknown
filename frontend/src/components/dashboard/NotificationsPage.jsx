import React, { useState, useEffect } from 'react';
import { Bell, Settings, Trash2 } from 'lucide-react';
import notificationService from '../../lib/notificationService';
import Button from '../ui/Button';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [notifs, prefs] = await Promise.all([
                notificationService.getNotifications(),
                notificationService.getPreferences()
            ]);
            setNotifications(notifs);
            setPreferences(prefs);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: 1 } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handlePreferenceChange = async (key, value) => {
        try {
            const updated = { ...preferences, [key]: value };
            await notificationService.updatePreferences(updated);
            setPreferences(updated);
        } catch (error) {
            console.error('Failed to update preferences:', error);
        }
    };

    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notifications List */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveTab('unread')}
                                className={`px-4 py-2 rounded ${activeTab === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                            >
                                Unread ({notifications.filter(n => !n.read).length})
                            </button>
                        </div>
                        <Button onClick={handleMarkAllAsRead} variant="secondary" size="sm">
                            Mark All as Read
                        </Button>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            filteredNotifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                                {!notification.read && (
                                                    <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Preferences Panel */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <Settings className="w-5 h-5 mr-2 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
                    </div>

                    {preferences && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-700">Email Notifications</label>
                                <input
                                    type="checkbox"
                                    checked={preferences.email_enabled}
                                    onChange={(e) => handlePreferenceChange('email_enabled', e.target.checked)}
                                    className="rounded text-blue-600"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-700">In-App Notifications</label>
                                <input
                                    type="checkbox"
                                    checked={preferences.in_app_enabled}
                                    onChange={(e) => handlePreferenceChange('in_app_enabled', e.target.checked)}
                                    className="rounded text-blue-600"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-700">Appointment Reminders</label>
                                <input
                                    type="checkbox"
                                    checked={preferences.appointment_reminders}
                                    onChange={(e) => handlePreferenceChange('appointment_reminders', e.target.checked)}
                                    className="rounded text-blue-600"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;

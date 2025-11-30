import React, { useState, useEffect } from 'react';
import { Building, Clock, Bell, Shield, Save } from 'lucide-react';
import Button from '../ui/Button';
import axios from 'axios';

const SettingsPanel = () => {
    const [activeTab, setActiveTab] = useState('clinic');
    const [clinicSettings, setClinicSettings] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/dashboard/clinic/settings', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setClinicSettings(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put(
                'http://localhost:5000/api/dashboard/clinic/settings',
                clinicSettings,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'clinic', label: 'Clinic Info', icon: Building },
        { id: 'hours', label: 'Working Hours', icon: Clock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-4">
                    <nav className="space-y-2">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow p-6">
                    {activeTab === 'clinic' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold mb-4">Clinic Information</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clinic Name
                                </label>
                                <input
                                    type="text"
                                    value={clinicSettings.name}
                                    onChange={(e) => setClinicSettings({ ...clinicSettings, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={clinicSettings.address}
                                    onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={clinicSettings.phone}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={clinicSettings.email}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={clinicSettings.website}
                                    onChange={(e) => setClinicSettings({ ...clinicSettings, website: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'hours' && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Working Hours</h2>
                            <p className="text-gray-600">Configure your clinic's working hours for each day of the week.</p>
                            {/* Working hours configuration would go here */}
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
                            <p className="text-gray-600">Manage notification preferences for your clinic.</p>
                            {/* Notification settings would go here */}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                            <p className="text-gray-600">Configure security and access control settings.</p>
                            {/* Security settings would go here */}
                        </div>
                    )}

                    <div className="flex justify-end mt-6 pt-6 border-t">
                        <Button onClick={handleSave} disabled={loading}>
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;

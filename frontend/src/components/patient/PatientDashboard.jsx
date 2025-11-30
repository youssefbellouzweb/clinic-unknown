import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Activity, Clock } from 'lucide-react';
import axios from 'axios';

const PatientDashboard = () => {
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        totalRecords: 0,
        pendingResults: 0
    });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('patientToken');
            const headers = { Authorization: `Bearer ${token}` };

            const [appointmentsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/patient-portal/appointments', { headers })
            ]);

            const upcomingAppts = appointmentsRes.data.data.filter(apt =>
                new Date(apt.datetime) > new Date()
            );

            setAppointments(upcomingAppts.slice(0, 5));
            setStats({
                upcomingAppointments: upcomingAppts.length,
                totalRecords: 12, // Placeholder
                pendingResults: 2 // Placeholder
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Upcoming Appointments</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Medical Records</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <Activity className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Pending Lab Results</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingResults}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                </div>
                <div className="p-6">
                    {appointments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map(apt => (
                                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {new Date(apt.datetime).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(apt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/patient/appointments" className="bg-indigo-600 text-white rounded-lg p-6 hover:bg-indigo-700 transition-colors">
                    <h3 className="text-lg font-semibold mb-2">Book an Appointment</h3>
                    <p className="text-indigo-100">Schedule your next visit with us</p>
                </a>
                <a href="/patient/medical-records" className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition-colors">
                    <h3 className="text-lg font-semibold mb-2">View Medical Records</h3>
                    <p className="text-purple-100">Access your health history</p>
                </a>
            </div>
        </div>
    );
};

export default PatientDashboard;

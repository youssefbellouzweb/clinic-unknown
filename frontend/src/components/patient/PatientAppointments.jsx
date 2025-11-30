import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import axios from 'axios';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('patientToken');
            const response = await axios.get('http://localhost:5000/api/patient-portal/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.datetime);
        const now = new Date();

        if (filter === 'upcoming') return aptDate > now;
        if (filter === 'past') return aptDate <= now;
        return true;
    });

    if (loading) return <div className="p-8 text-center">Loading appointments...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg ${filter === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-lg ${filter === 'past' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Past
                    </button>
                </div>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No appointments found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAppointments.map(apt => (
                        <div key={apt.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center mb-3">
                                        <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                                        <span className="text-lg font-semibold text-gray-900">
                                            {new Date(apt.datetime).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="space-y-2 ml-7">
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span>{new Date(apt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        {apt.doctor_name && (
                                            <div className="flex items-center text-gray-600">
                                                <User className="w-4 h-4 mr-2" />
                                                <span>Dr. {apt.doctor_name}</span>
                                            </div>
                                        )}

                                        {apt.clinic_name && (
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                <span>{apt.clinic_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;

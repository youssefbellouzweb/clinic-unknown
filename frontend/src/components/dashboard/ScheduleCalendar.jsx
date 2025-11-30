import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';
import axios from 'axios';

const ScheduleCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [view, setView] = useState('week'); // week, day
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, [currentDate]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/appointments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInWeek = () => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay()); // Start from Sunday

        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getAppointmentsForDay = (date) => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.datetime);
            return aptDate.toDateString() === date.toDateString();
        });
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    const weekDays = getDaysInWeek();
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

    if (loading) return <div className="p-8 text-center">Loading schedule...</div>;

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigateWeek(-1)}
                        className="p-2 hover:bg-gray-100 rounded"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold">
                        {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                        onClick={() => navigateWeek(1)}
                        className="p-2 hover:bg-gray-100 rounded"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => setView('week')}
                        className={`px-4 py-2 rounded ${view === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setView('day')}
                        className={`px-4 py-2 rounded ${view === 'day' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    >
                        Day
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    {/* Day Headers */}
                    <div className="grid grid-cols-8 border-b border-gray-200">
                        <div className="p-3 text-sm font-medium text-gray-500">Time</div>
                        {weekDays.map((day, idx) => (
                            <div key={idx} className="p-3 text-center border-l border-gray-200">
                                <div className="text-sm font-medium text-gray-900">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className={`text-2xl font-bold mt-1 ${day.toDateString() === new Date().toDateString()
                                        ? 'text-indigo-600'
                                        : 'text-gray-900'
                                    }`}>
                                    {day.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="divide-y divide-gray-200">
                        {hours.map(hour => (
                            <div key={hour} className="grid grid-cols-8">
                                <div className="p-3 text-sm text-gray-500">
                                    {hour}:00 {hour < 12 ? 'AM' : 'PM'}
                                </div>
                                {weekDays.map((day, idx) => {
                                    const dayAppointments = getAppointmentsForDay(day).filter(apt => {
                                        const aptHour = new Date(apt.datetime).getHours();
                                        return aptHour === hour;
                                    });

                                    return (
                                        <div key={idx} className="p-2 border-l border-gray-200 min-h-[80px]">
                                            {dayAppointments.map(apt => (
                                                <div
                                                    key={apt.id}
                                                    className={`p-2 rounded mb-1 text-xs ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    <div className="font-medium flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {new Date(apt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <User className="w-3 h-3 mr-1" />
                                                        {apt.patient_name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleCalendar;

import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';

const AdvancedCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const calendarRef = useRef(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/appointments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const formattedEvents = response.data.data.map(apt => ({
                id: apt.id,
                title: apt.patient_name || 'Appointment',
                start: apt.datetime,
                end: new Date(new Date(apt.datetime).getTime() + 30 * 60000).toISOString(),
                backgroundColor: getStatusColor(apt.status),
                borderColor: getStatusColor(apt.status),
                extendedProps: {
                    patientId: apt.patient_id,
                    doctorId: apt.doctor_id,
                    status: apt.status,
                    patientName: apt.patient_name,
                    doctorName: apt.doctor_name
                }
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            case 'completed': return '#6366f1';
            default: return '#6b7280';
        }
    };

    const handleEventDrop = async (info) => {
        try {
            await axios.put(
                `http://localhost:5000/api/appointments/${info.event.id}`,
                { datetime: info.event.start.toISOString() },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert('Appointment rescheduled successfully');
        } catch (error) {
            console.error('Failed to reschedule:', error);
            info.revert();
            alert('Failed to reschedule appointment');
        }
    };

    const handleEventResize = async (info) => {
        try {
            await axios.put(
                `http://localhost:5000/api/appointments/${info.event.id}`,
                {
                    datetime: info.event.start.toISOString(),
                    duration: Math.round((info.event.end - info.event.start) / 60000)
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert('Appointment duration updated');
        } catch (error) {
            console.error('Failed to update duration:', error);
            info.revert();
            alert('Failed to update appointment duration');
        }
    };

    const handleDateClick = (info) => {
        const title = prompt('Enter appointment title:');
        if (title) {
            // Create new appointment
            createAppointment(info.dateStr, title);
        }
    };

    const handleEventClick = (info) => {
        const event = info.event;
        const details = `
Patient: ${event.extendedProps.patientName || 'N/A'}
Doctor: ${event.extendedProps.doctorName || 'N/A'}
Status: ${event.extendedProps.status}
Time: ${event.start.toLocaleString()}
        `;

        if (confirm(`${event.title}\n\n${details}\n\nDo you want to delete this appointment?`)) {
            deleteAppointment(event.id);
        }
    };

    const createAppointment = async (datetime, title) => {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/appointments',
                { datetime, title },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            fetchAppointments();
            alert('Appointment created successfully');
        } catch (error) {
            console.error('Failed to create appointment:', error);
            alert('Failed to create appointment');
        }
    };

    const deleteAppointment = async (id) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/appointments/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            fetchAppointments();
            alert('Appointment deleted successfully');
        } catch (error) {
            console.error('Failed to delete appointment:', error);
            alert('Failed to delete appointment');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading calendar...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Advanced Calendar</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => calendarRef.current?.getApi().today()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => calendarRef.current?.getApi().prev()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => calendarRef.current?.getApi().next()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
            </div>

            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                }}
                events={events}
                editable={true}
                droppable={true}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                nowIndicator={true}
                businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5, 6],
                    startTime: '08:00',
                    endTime: '18:00'
                }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
            />

            <div className="mt-4 flex space-x-4">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Confirmed</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Cancelled</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-indigo-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                </div>
            </div>
        </div>
    );
};

export default AdvancedCalendar;

import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

const AppointmentBooking = () => {
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/booking/doctors', {
                headers: { Authorization: `Bearer ${localStorage.getItem('patientToken')}` }
            });
            setDoctors(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
        }
    };

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/booking/slots?doctorId=${selectedDoctor.id}&date=${selectedDate}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('patientToken')}` } }
            );
            setAvailableSlots(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedSlot) return;

        setLoading(true);
        try {
            await axios.post(
                'http://localhost:5000/api/booking/book',
                {
                    doctorId: selectedDoctor.id,
                    datetime: selectedSlot.datetime
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('patientToken')}` } }
            );

            setStep(4);
        } catch (error) {
            console.error('Failed to book appointment:', error);
            alert('Failed to book appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {s}
                            </div>
                            {s < 4 && (
                                <div className={`w-24 h-1 ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">Select Doctor</span>
                    <span className="text-sm text-gray-600">Select Date</span>
                    <span className="text-sm text-gray-600">Select Time</span>
                    <span className="text-sm text-gray-600">Confirm</span>
                </div>
            </div>

            {/* Step 1: Select Doctor */}
            {step === 1 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Doctor</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {doctors.map(doctor => (
                            <div
                                key={doctor.id}
                                onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setStep(2);
                                }}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedDoctor?.id === doctor.id
                                        ? 'border-indigo-600 bg-indigo-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <User className="w-12 h-12 text-indigo-600 mr-4" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                                        <p className="text-sm text-gray-600">{doctor.specialization || 'General'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Select Date */}
            {step === 2 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Select Date</h2>
                    <div className="mb-4">
                        <p className="text-gray-600">Doctor: <span className="font-semibold">{selectedDoctor?.name}</span></p>
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setStep(3);
                        }}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={() => setStep(1)}
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Back
                    </button>
                </div>
            )}

            {/* Step 3: Select Time */}
            {step === 3 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Select Time</h2>
                    <div className="mb-4">
                        <p className="text-gray-600">
                            Doctor: <span className="font-semibold">{selectedDoctor?.name}</span>
                        </p>
                        <p className="text-gray-600">
                            Date: <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
                        </p>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-500">Loading available slots...</p>
                    ) : availableSlots.length === 0 ? (
                        <p className="text-center text-gray-500">No available slots for this date</p>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {availableSlots.map(slot => (
                                <button
                                    key={slot.time}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 border-2 rounded-lg transition-all ${selectedSlot?.time === slot.time
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Clock className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                                    <p className="text-sm font-medium">{slot.time}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 flex space-x-4">
                        <button
                            onClick={() => setStep(2)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleBookAppointment}
                            disabled={!selectedSlot || loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Booking...' : 'Book Appointment'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
                    <p className="text-gray-600 mb-4">Your appointment has been successfully booked.</p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-gray-700"><strong>Doctor:</strong> {selectedDoctor?.name}</p>
                        <p className="text-gray-700"><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                        <p className="text-gray-700"><strong>Time:</strong> {selectedSlot?.time}</p>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        A confirmation email has been sent to your registered email address.
                    </p>
                    <button
                        onClick={() => window.location.href = '/patient/appointments'}
                        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        View My Appointments
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentBooking;

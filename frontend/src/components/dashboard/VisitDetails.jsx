import React from 'react';
import { X, Calendar, User, Activity, Heart, Thermometer, Weight } from 'lucide-react';

const VisitDetails = ({ visit, onClose }) => {
    if (!visit) return null;

    const vitals = visit.vitals ? JSON.parse(visit.vitals) : {};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Visit Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                            <Activity className="w-8 h-8 text-green-600 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{visit.reason}</h3>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(visit.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                        {visit.doctor_name && (
                            <div className="flex items-center text-gray-700">
                                <User className="w-5 h-5 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Doctor</p>
                                    <p className="font-medium">Dr. {visit.doctor_name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Patient Info */}
                    {visit.patient_name && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Patient</h4>
                            <p className="text-gray-700">{visit.patient_name}</p>
                        </div>
                    )}

                    {/* Vitals */}
                    {Object.keys(vitals).length > 0 && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Vital Signs</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {vitals.blood_pressure && (
                                    <div className="flex items-center p-3 bg-red-50 rounded-lg">
                                        <Heart className="w-5 h-5 text-red-600 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600">Blood Pressure</p>
                                            <p className="font-semibold text-gray-900">{vitals.blood_pressure}</p>
                                        </div>
                                    </div>
                                )}
                                {vitals.temperature && (
                                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                                        <Thermometer className="w-5 h-5 text-orange-600 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600">Temperature</p>
                                            <p className="font-semibold text-gray-900">{vitals.temperature}°C</p>
                                        </div>
                                    </div>
                                )}
                                {vitals.heart_rate && (
                                    <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                                        <Activity className="w-5 h-5 text-pink-600 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600">Heart Rate</p>
                                            <p className="font-semibold text-gray-900">{vitals.heart_rate} bpm</p>
                                        </div>
                                    </div>
                                )}
                                {vitals.weight && (
                                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                        <Weight className="w-5 h-5 text-blue-600 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-600">Weight</p>
                                            <p className="font-semibold text-gray-900">{vitals.weight} kg</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reason for Visit */}
                    <div className="border-b pb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Reason for Visit</h4>
                        <p className="text-gray-700">{visit.reason}</p>
                    </div>

                    {/* Notes */}
                    {visit.notes && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Visit Notes</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
                        </div>
                    )}

                    {/* Status */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                visit.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {visit.status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisitDetails;

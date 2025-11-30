import React from 'react';
import { X, Calendar, User, FileText, Pill, AlertCircle } from 'lucide-react';

const MedicalRecordDetails = ({ record, onClose }) => {
    if (!record) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Medical Record Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                            <FileText className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{record.diagnosis}</h3>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(record.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                        {record.doctor_name && (
                            <div className="flex items-center text-gray-700">
                                <User className="w-5 h-5 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Doctor</p>
                                    <p className="font-medium">Dr. {record.doctor_name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Patient Info */}
                    {record.patient_name && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                            <p className="text-gray-700">{record.patient_name}</p>
                        </div>
                    )}

                    {/* Diagnosis */}
                    <div className="border-b pb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Diagnosis</h4>
                        <p className="text-gray-700">{record.diagnosis}</p>
                    </div>

                    {/* Treatment */}
                    {record.treatment && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Treatment Plan</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{record.treatment}</p>
                        </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                        <div className="border-b pb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Clinical Notes</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                        </div>
                    )}

                    {/* Allergies */}
                    {record.allergies && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start">
                                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-yellow-900 mb-1">Allergies</h4>
                                    <p className="text-yellow-800">{record.allergies}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Medications */}
                    {record.medications && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-start">
                                <Pill className="w-6 h-6 text-purple-600 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-purple-900 mb-1">Current Medications</h4>
                                    <p className="text-purple-800 whitespace-pre-wrap">{record.medications}</p>
                                </div>
                            </div>
                        </div>
                    )}
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

export default MedicalRecordDetails;

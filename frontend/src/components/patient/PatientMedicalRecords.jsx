import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Pill, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PatientMedicalRecords = () => {
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('records');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('patientToken');
            const headers = { Authorization: `Bearer ${token}` };

            const [recordsRes, prescriptionsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/patient-portal/medical-records', { headers }),
                axios.get('http://localhost:5000/api/patient-portal/prescriptions', { headers })
            ]);

            setRecords(recordsRes.data.data || []);
            setPrescriptions(prescriptionsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch medical data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading medical records...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('records')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'records' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Records
                    </button>
                    <button
                        onClick={() => setActiveTab('prescriptions')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'prescriptions' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Prescriptions
                    </button>
                </div>
            </div>

            {activeTab === 'records' && (
                <div className="space-y-4">
                    {records.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No medical records found</p>
                        </div>
                    ) : (
                        records.map(record => (
                            <div key={record.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-blue-100 rounded-full mr-4">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{record.diagnosis}</h3>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(record.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    {record.doctor_name && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <User className="w-4 h-4 mr-1" />
                                            Dr. {record.doctor_name}
                                        </div>
                                    )}
                                </div>

                                {record.treatment && (
                                    <div className="mb-3">
                                        <h4 className="font-medium text-gray-700 mb-1">Treatment:</h4>
                                        <p className="text-gray-600">{record.treatment}</p>
                                    </div>
                                )}

                                {record.notes && (
                                    <div className="mb-3">
                                        <h4 className="font-medium text-gray-700 mb-1">Notes:</h4>
                                        <p className="text-gray-600">{record.notes}</p>
                                    </div>
                                )}

                                {record.allergies && (
                                    <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-yellow-800">Allergies:</h4>
                                            <p className="text-yellow-700">{record.allergies}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                    {prescriptions.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No prescriptions found</p>
                        </div>
                    ) : (
                        prescriptions.map(prescription => (
                            <div key={prescription.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-purple-100 rounded-full mr-4">
                                            <Pill className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{prescription.medication}</h3>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(prescription.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Dosage:</h4>
                                        <p className="text-gray-900">{prescription.dosage}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Frequency:</h4>
                                        <p className="text-gray-900">{prescription.frequency}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">Duration:</h4>
                                        <p className="text-gray-900">{prescription.duration}</p>
                                    </div>
                                </div>

                                {prescription.instructions && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-800 mb-1">Instructions:</h4>
                                        <p className="text-blue-700">{prescription.instructions}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientMedicalRecords;

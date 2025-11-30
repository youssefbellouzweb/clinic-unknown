import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import axios from 'axios';

const LabRequestForm = ({ patientId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        test_type: '',
        priority: 'normal',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const testTypes = [
        'Complete Blood Count (CBC)',
        'Blood Glucose',
        'Lipid Panel',
        'Liver Function Test',
        'Kidney Function Test',
        'Thyroid Panel',
        'Urinalysis',
        'X-Ray',
        'CT Scan',
        'MRI',
        'Ultrasound',
        'ECG',
        'Other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(
                'http://localhost:5000/api/lab/requests',
                { ...formData, patient_id: patientId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create lab request:', error);
            alert('Failed to create lab request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">New Lab Request</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Test Type *
                        </label>
                        <select
                            required
                            value={formData.test_type}
                            onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a test</option>
                            {testTypes.map(test => (
                                <option key={test} value={test}>{test}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority *
                        </label>
                        <select
                            required
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                            <option value="stat">STAT</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional instructions or information..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabRequestForm;

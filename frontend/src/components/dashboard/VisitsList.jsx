import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, Activity } from 'lucide-react';
import Button from '../ui/Button';
import axios from 'axios';

const VisitsList = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/visits', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setVisits(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch visits:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVisits = visits.filter(visit =>
        visit.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading visits...</div>;

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search visits..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Visit
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vitals</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVisits.map((visit) => (
                            <tr key={visit.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{visit.patient_name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{visit.reason}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                            {new Date(visit.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {visit.time}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {visit.vitals ? (
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Activity className="w-4 h-4 mr-2 text-green-500" />
                                            Recorded
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Pending</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            visit.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {visit.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-4">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VisitsList;

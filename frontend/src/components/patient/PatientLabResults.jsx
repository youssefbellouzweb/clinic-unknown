import React, { useState, useEffect } from 'react';
import { FlaskConical, Calendar, Download, Eye, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const PatientLabResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, completed, pending

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem('patientToken');
            const response = await axios.get('http://localhost:5000/api/patient-portal/lab-results', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch lab results:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(result => {
        if (filter === 'completed') return result.status === 'completed';
        if (filter === 'pending') return result.status === 'pending' || result.status === 'processing';
        return true;
    });

    if (loading) return <div className="p-8 text-center">Loading lab results...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Pending
                    </button>
                </div>
            </div>

            {filteredResults.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FlaskConical className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No lab results found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredResults.map(result => (
                        <div key={result.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center flex-1">
                                    <div className={`p-3 rounded-full mr-4 ${result.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                                        }`}>
                                        <FlaskConical className={`w-6 h-6 ${result.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{result.test_type}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Requested: {new Date(result.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${result.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            result.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {result.status === 'completed' ? (
                                            <><CheckCircle className="w-4 h-4 mr-1" /> Completed</>
                                        ) : (
                                            <><Clock className="w-4 h-4 mr-1" /> {result.status}</>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {result.status === 'completed' && result.result_data && (
                                <div className="space-y-3">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-2">Results:</h4>
                                        <div className="text-gray-900 whitespace-pre-wrap">{result.result_data}</div>
                                    </div>

                                    {result.notes && (
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h4 className="font-medium text-blue-800 mb-1">Doctor's Notes:</h4>
                                            <p className="text-blue-700">{result.notes}</p>
                                        </div>
                                    )}

                                    <div className="flex space-x-3">
                                        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </button>
                                        <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            )}

                            {result.status !== 'completed' && (
                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-yellow-800">
                                        Your test is being processed. Results will be available soon.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientLabResults;

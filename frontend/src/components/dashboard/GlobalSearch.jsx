import React, { useState, useEffect } from 'react';
import { Search, X, User, Calendar, FileText, Activity } from 'lucide-react';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            // Escape to close
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults(null);
            return;
        }

        const timeoutId = setTimeout(() => {
            performSearch();
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setResults(data.data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'patient': return User;
            case 'appointment': return Calendar;
            case 'medical_record': return FileText;
            case 'visit': return Activity;
            default: return FileText;
        }
    };

    const getResultCount = () => {
        if (!results) return 0;
        return Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
                <Search className="w-4 h-4 mr-2" />
                Search... <kbd className="ml-2 px-2 py-0.5 text-xs bg-white rounded">⌘K</kbd>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                {/* Search Input */}
                <div className="flex items-center p-4 border-b border-gray-200">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search patients, appointments, records..."
                        className="flex-1 outline-none text-lg"
                        autoFocus
                    />
                    <button onClick={() => setIsOpen(false)} className="ml-3 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                    {loading && (
                        <div className="p-8 text-center text-gray-500">
                            Searching...
                        </div>
                    )}

                    {!loading && query.length >= 2 && results && getResultCount() === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No results found for "{query}"
                        </div>
                    )}

                    {!loading && results && getResultCount() > 0 && (
                        <div className="p-2">
                            {/* Patients */}
                            {results.patients && results.patients.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                        Patients ({results.patients.length})
                                    </h3>
                                    {results.patients.map(patient => {
                                        const Icon = getIcon('patient');
                                        return (
                                            <div
                                                key={patient.id}
                                                className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                                            >
                                                <div className="flex items-center">
                                                    <Icon className="w-4 h-4 text-blue-600 mr-3" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{patient.name}</p>
                                                        <p className="text-sm text-gray-500">{patient.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Appointments */}
                            {results.appointments && results.appointments.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                        Appointments ({results.appointments.length})
                                    </h3>
                                    {results.appointments.map(apt => {
                                        const Icon = getIcon('appointment');
                                        return (
                                            <div
                                                key={apt.id}
                                                className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                                            >
                                                <div className="flex items-center">
                                                    <Icon className="w-4 h-4 text-green-600 mr-3" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{apt.patient_name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(apt.datetime).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Medical Records */}
                            {results.medical_records && results.medical_records.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                        Medical Records ({results.medical_records.length})
                                    </h3>
                                    {results.medical_records.map(record => {
                                        const Icon = getIcon('medical_record');
                                        return (
                                            <div
                                                key={record.id}
                                                className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                                            >
                                                <div className="flex items-center">
                                                    <Icon className="w-4 h-4 text-purple-600 mr-3" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{record.diagnosis}</p>
                                                        <p className="text-sm text-gray-500">{record.patient_name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;

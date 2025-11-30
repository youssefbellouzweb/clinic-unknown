import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import Button from '../ui/Button';

const ReportsBuilder = () => {
    const [reportType, setReportType] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [format, setFormat] = useState('pdf');

    const reportTypes = [
        { id: 'appointments', name: 'Appointments Report', icon: Calendar, description: 'Summary of all appointments' },
        { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Financial summary and billing' },
        { id: 'patients', name: 'Patients Report', icon: Users, description: 'Patient statistics and demographics' },
        { id: 'performance', name: 'Performance Report', icon: TrendingUp, description: 'Clinic performance metrics' }
    ];

    const handleGenerate = async () => {
        if (!reportType || !dateRange.start || !dateRange.end) {
            alert('Please select report type and date range');
            return;
        }

        try {
            const params = new URLSearchParams({
                type: reportType,
                format: format,
                dateFrom: dateRange.start,
                dateTo: dateRange.end
            });

            const response = await fetch(`http://localhost:5000/api/reports/generate?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}_${dateRange.start}_${dateRange.end}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Report generated successfully!');
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to generate report. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTypes.map(type => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setReportType(type.id)}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${reportType === type.id
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start">
                                    <Icon className={`w-6 h-6 mr-3 ${reportType === type.id ? 'text-indigo-600' : 'text-gray-400'
                                        }`} />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{type.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Date Range */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Quick Date Ranges */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date(today);
                            lastWeek.setDate(today.getDate() - 7);
                            setDateRange({
                                start: lastWeek.toISOString().split('T')[0],
                                end: today.toISOString().split('T')[0]
                            });
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date(today);
                            lastMonth.setMonth(today.getMonth() - 1);
                            setDateRange({
                                start: lastMonth.toISOString().split('T')[0],
                                end: today.toISOString().split('T')[0]
                            });
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                        Last Month
                    </button>
                    <button
                        onClick={() => {
                            const today = new Date();
                            const lastYear = new Date(today);
                            lastYear.setFullYear(today.getFullYear() - 1);
                            setDateRange({
                                start: lastYear.toISOString().split('T')[0],
                                end: today.toISOString().split('T')[0]
                            });
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                        Last Year
                    </button>
                </div>
            </div>

            {/* Export Format */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setFormat('pdf')}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 ${format === 'pdf'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        PDF
                    </button>
                    <button
                        onClick={() => setFormat('excel')}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 ${format === 'excel'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        Excel
                    </button>
                </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
                <Button onClick={handleGenerate} size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Generate Report
                </Button>
            </div>
        </div>
    );
};

export default ReportsBuilder;

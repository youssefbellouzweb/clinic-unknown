import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, FileText, CreditCard, Download } from 'lucide-react';
import Button from '../ui/Button';
import axios from 'axios';

const BillingList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/billing', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setInvoices(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/billing/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchInvoices();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toString().includes(searchTerm)
    );

    if (loading) return <div className="p-8 text-center">Loading invoices...</div>;

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">#{inv.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{inv.patient_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">${inv.amount.toFixed(2)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            inv.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {inv.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {new Date(inv.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        {inv.status === 'pending' && (
                                            <button
                                                onClick={() => handleStatusUpdate(inv.id, 'paid')}
                                                className="text-green-600 hover:text-green-900"
                                                title="Mark as Paid"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button className="text-gray-600 hover:text-gray-900" title="Download PDF">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredInvoices.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No invoices found
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingList;

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsCharts = () => {
    const [overview, setOverview] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [appointmentStats, setAppointmentStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

            const [overviewRes, revenueRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/dashboard/analytics/overview', { headers }),
                axios.get('http://localhost:5000/api/dashboard/analytics/revenue', { headers }),
                axios.get('http://localhost:5000/api/dashboard/analytics/appointments', { headers })
            ]);

            setOverview(overviewRes.data.data);
            setRevenueData(revenueRes.data.data);
            setAppointmentStats(statsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Patients</p>
                        <p className="text-2xl font-bold">{overview?.totalPatients}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                    <div className="p-3 bg-green-100 rounded-full mr-4">
                        <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Appointments Today</p>
                        <p className="text-2xl font-bold">{overview?.appointmentsToday}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full mr-4">
                        <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Revenue (Month)</p>
                        <p className="text-2xl font-bold">${overview?.revenueMonth}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full mr-4">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Growth</p>
                        <p className="text-2xl font-bold">+12%</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#8884d8" name="Revenue ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Appointment Status</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={appointmentStats}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {appointmentStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;

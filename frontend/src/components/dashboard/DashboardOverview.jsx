import { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { patients, appointments, users } from '../../lib/services';
import Card from '../ui/Card';
import Table from '../ui/Table';
import Badge, { StatusBadge } from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import { format } from 'date-fns';

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        totalStaff: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsData, appointmentsData, usersData] = await Promise.allSettled([
                    patients.getAll(),
                    appointments.getAll(),
                    users.getAll() // This might fail for non-admins
                ]);

                const patientList = patientsData.status === 'fulfilled' ? patientsData.value.data : [];
                const appointmentList = appointmentsData.status === 'fulfilled' ? appointmentsData.value.data : [];
                const userList = usersData.status === 'fulfilled' ? usersData.value.data : [];

                const today = format(new Date(), 'yyyy-MM-dd');
                const todayApts = appointmentList.filter(apt => apt.date === today);
                const pendingApts = appointmentList.filter(apt => apt.status === 'pending');

                setStats({
                    totalPatients: patientList.length,
                    todayAppointments: todayApts.length,
                    pendingAppointments: pendingApts.length,
                    totalStaff: userList.length
                });

                setRecentAppointments(appointmentList.slice(0, 5));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <Card variant="elevated" className="p-6 hover-lift border-t-4" style={{ borderTopColor: `var(--${color}-500)` }}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    {isLoading ? (
                        <Skeleton width="60px" height="32px" />
                    ) : (
                        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="flex items-center text-sm">
                {trend > 0 ? (
                    <span className="text-green-600 flex items-center font-medium">
                        <ArrowUp size={14} className="mr-1" /> {trend}%
                    </span>
                ) : (
                    <span className="text-gray-400 flex items-center">
                        <span className="mr-1">vs last month</span>
                    </span>
                )}
            </div>
        </Card>
    );

    const columns = [
        {
            header: 'Patient',
            key: 'patient_name',
            render: (row) => (
                <div className="font-medium text-gray-900">{row.patient_name || 'N/A'}</div>
            )
        },
        {
            header: 'Doctor',
            key: 'doctor_name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {row.doctor_name?.charAt(0) || 'D'}
                    </div>
                    <span className="text-gray-600">{row.doctor_name || 'Unassigned'}</span>
                </div>
            )
        },
        {
            header: 'Date & Time',
            key: 'date',
            render: (row) => (
                <div className="text-gray-600">
                    <div>{row.date}</div>
                    <div className="text-xs text-gray-400">{row.time}</div>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="primary" dot pulse>Live Updates</Badge>
                    <span className="text-sm text-gray-400">{format(new Date(), 'MMM dd, yyyy')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    icon={Users}
                    color="blue"
                    trend={12}
                />
                <StatCard
                    title="Today's Appointments"
                    value={stats.todayAppointments}
                    icon={Calendar}
                    color="green"
                    trend={5}
                />
                <StatCard
                    title="Pending Requests"
                    value={stats.pendingAppointments}
                    icon={Clock}
                    color="yellow"
                    trend={0}
                />
                <StatCard
                    title="Active Staff"
                    value={stats.totalStaff}
                    icon={Activity}
                    color="purple"
                    trend={0}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent Appointments</h2>
                            <a href="/dashboard/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</a>
                        </div>
                        <Table
                            columns={columns}
                            data={recentAppointments}
                            isLoading={isLoading}
                            className="border-none shadow-none rounded-none"
                            hover
                        />
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="h-full p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
                            <p className="text-blue-100 mb-6 text-sm">
                                Get access to advanced analytics, unlimited staff accounts, and priority support.
                            </p>
                            <button className="w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-lg">
                                Upgrade Now
                            </button>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

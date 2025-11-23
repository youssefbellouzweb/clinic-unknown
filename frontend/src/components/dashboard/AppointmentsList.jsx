import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, User, X } from 'lucide-react';
import { appointments, patients } from '../../lib/services';
import Table from '../ui/Table';
import Button from '../ui/Button';
import Input, { Textarea } from '../ui/Input';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Badge, { StatusBadge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

export default function AppointmentsList() {
    const [appointmentList, setAppointmentList] = useState([]);
    const [patientList, setPatientList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        patientId: '',
        date: '',
        time: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [appointmentsRes, patientsRes] = await Promise.all([
                appointments.getAll(),
                patients.getAll()
            ]);
            setAppointmentList(appointmentsRes.data);
            setPatientList(patientsRes.data);
        } catch (error) {
            console.error("Error loading data:", error);
            addToast({
                type: 'error',
                message: 'Failed to load appointments'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await appointments.create({
                patient_id: parseInt(formData.patientId),
                date: formData.date,
                time: formData.time,
                notes: formData.notes
            });
            addToast({
                type: 'success',
                message: 'Appointment scheduled successfully'
            });
            setIsModalOpen(false);
            setFormData({ patientId: '', date: '', time: '', notes: '' });
            fetchData();
        } catch (error) {
            console.error("Error creating appointment:", error);
            addToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to schedule appointment'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;

        try {
            await appointments.cancel(id);
            addToast({
                type: 'success',
                message: 'Appointment canceled successfully'
            });
            fetchData();
        } catch (error) {
            addToast({
                type: 'error',
                message: 'Failed to cancel appointment'
            });
        }
    };

    const filteredAppointments = appointmentList.filter(apt => {
        const matchesSearch = apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            header: 'Patient',
            key: 'patient_name',
            sortable: true,
            render: (row) => (
                <div className="font-medium text-gray-900">{row.patient_name || 'N/A'}</div>
            )
        },
        {
            header: 'Date & Time',
            key: 'date',
            sortable: true,
            render: (row) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{row.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                        <Clock size={12} />
                        <span>{row.time}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Doctor',
            key: 'doctor_name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {row.doctor_name?.charAt(0) || 'D'}
                    </div>
                    <span className="text-gray-600">{row.doctor_name || 'Unassigned'}</span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (row) => <StatusBadge status={row.status} />
        },
        {
            header: 'Actions',
            key: 'actions',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {row.status !== 'canceled' && row.status !== 'completed' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancel(row.id)}
                            title="Cancel Appointment"
                        >
                            <X size={16} />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-500">Manage clinic schedule</p>
                </div>
                <Button
                    variant="gradient"
                    icon={Plus}
                    iconPosition="left"
                    onClick={() => setIsModalOpen(true)}
                    className="shadow-colored hover-lift"
                >
                    New Appointment
                </Button>
            </div>

            <Card className="overflow-hidden border-none shadow-md">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative max-w-md w-full sm:w-auto flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search patient or doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {['all', 'pending', 'confirmed', 'completed', 'canceled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${filterStatus === status
                                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={filteredAppointments}
                    isLoading={isLoading}
                    emptyState={
                        <div className="text-center py-12">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                            <p className="text-gray-500 mt-1 mb-6">Schedule a new appointment to get started.</p>
                            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                                New Appointment
                            </Button>
                        </div>
                    }
                    hover
                    striped
                />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="New Appointment"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                        <select
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="">Select a patient</option>
                            {patientList.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                            icon={Calendar}
                        />
                        <Input
                            label="Time"
                            name="time"
                            type="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required
                            icon={Clock}
                        />
                    </div>

                    <Textarea
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Reason for visit..."
                    />

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="gradient"
                            loading={isSubmitting}
                        >
                            Schedule
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

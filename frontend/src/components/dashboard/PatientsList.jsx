import { useState, useEffect } from 'react';
import { Plus, Search, Phone, Calendar, FileText, User } from 'lucide-react';
import { patients } from '../../lib/services';
import Table from '../ui/Table';
import Button from '../ui/Button';
import Input, { Textarea } from '../ui/Input';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import { useToast } from '../ui/Toast';

export default function PatientsList() {
    const [patientList, setPatientList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        birthdate: '',
        notes: ''
    });

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const response = await patients.getAll();
            setPatientList(response.data);
        } catch (error) {
            console.error("Error loading patients:", error);
            addToast({
                type: 'error',
                message: 'Failed to load patients'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await patients.create(formData);
            addToast({
                type: 'success',
                message: 'Patient created successfully'
            });
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', birthdate: '', notes: '' });
            fetchPatients();
        } catch (error) {
            console.error("Error creating patient:", error);
            addToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to create patient'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPatients = patientList.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm))
    );

    const columns = [
        {
            header: 'Name',
            key: 'name',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {row.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{row.name}</span>
                </div>
            )
        },
        {
            header: 'Phone',
            key: 'phone',
            render: (row) => row.phone ? (
                <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} />
                    <span>{row.phone}</span>
                </div>
            ) : <span className="text-gray-400">-</span>
        },
        {
            header: 'Birthdate',
            key: 'birthdate',
            render: (row) => row.birthdate ? (
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} />
                    <span>{row.birthdate}</span>
                </div>
            ) : <span className="text-gray-400">-</span>
        },
        {
            header: 'Actions',
            key: 'actions',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        View Details
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                    <p className="text-gray-500">Manage your patient records</p>
                </div>
                <Button
                    variant="gradient"
                    icon={Plus}
                    iconPosition="left"
                    onClick={() => setIsModalOpen(true)}
                    className="shadow-colored hover-lift"
                >
                    Add Patient
                </Button>
            </div>

            <Card className="overflow-hidden border-none shadow-md">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={filteredPatients}
                    isLoading={isLoading}
                    emptyState={
                        <div className="text-center py-12">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No patients found</h3>
                            <p className="text-gray-500 mt-1 mb-6">Get started by adding a new patient.</p>
                            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                                Add Patient
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
                title="Add New Patient"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        icon={User}
                        placeholder="John Doe"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            icon={Phone}
                            placeholder="+1 (555) 000-0000"
                        />
                        <Input
                            label="Birthdate"
                            name="birthdate"
                            type="date"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            icon={Calendar}
                        />
                    </div>

                    <Textarea
                        label="Medical Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Allergies, medical history, etc."
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
                            Save Patient
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

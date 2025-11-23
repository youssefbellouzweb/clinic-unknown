import { useState, useEffect } from 'react';
import { Plus, Search, User, Mail, Lock, Trash2, Shield } from 'lucide-react';
import { users } from '../../lib/services';
import Table from '../ui/Table';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useToast } from '../ui/Toast';

export default function UsersList() {
    const [userList, setUserList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'doctor',
        password: ''
    });

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await users.getAll();
            setUserList(response.data);
        } catch (error) {
            console.error("Error loading users:", error);
            addToast({
                type: 'error',
                message: 'Failed to load staff members'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await users.create(formData);
            addToast({
                type: 'success',
                message: 'Staff member added successfully'
            });
            setIsModalOpen(false);
            setFormData({ name: '', email: '', role: 'doctor', password: '' });
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            addToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to add staff member'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;

        try {
            await users.delete(id);
            addToast({
                type: 'success',
                message: 'Staff member removed successfully'
            });
            fetchUsers();
        } catch (error) {
            addToast({
                type: 'error',
                message: 'Failed to remove staff member'
            });
        }
    };

    const filteredUsers = userList.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'admin': return 'purple';
            case 'doctor': return 'blue';
            case 'nurse': return 'green';
            case 'reception': return 'orange';
            default: return 'gray';
        }
    };

    const columns = [
        {
            header: 'Name',
            key: 'name',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold">
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{row.name}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Email',
            key: 'email',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} />
                    <span>{row.email}</span>
                </div>
            )
        },
        {
            header: 'Role',
            key: 'role',
            render: (row) => (
                <Badge variant={getRoleBadgeVariant(row.role)} className="capitalize">
                    {row.role}
                </Badge>
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(row.id)}
                        title="Remove Staff"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-500">Manage clinic staff and permissions</p>
                </div>
                <Button
                    variant="gradient"
                    icon={Plus}
                    iconPosition="left"
                    onClick={() => setIsModalOpen(true)}
                    className="shadow-colored hover-lift"
                >
                    Add Staff
                </Button>
            </div>

            <Card className="overflow-hidden border-none shadow-md">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search staff by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={filteredUsers}
                    isLoading={isLoading}
                    emptyState={
                        <div className="text-center py-12">
                            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield size={32} className="text-purple-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No staff members found</h3>
                            <p className="text-gray-500 mt-1 mb-6">Add staff members to manage your clinic.</p>
                            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                                Add Staff
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
                title="Add Staff Member"
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
                        placeholder="Dr. Jane Smith"
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        icon={Mail}
                        placeholder="jane@clinic.com"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="reception">Receptionist</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        icon={Lock}
                        showPasswordToggle
                        placeholder="••••••••"
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
                            Create Account
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

import { Building2, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    <a href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
                        <Building2 size={28} />
                        <span>ClinicHub</span>
                    </a>

                    <div className="flex items-center gap-4">
                        <a href="/clinics" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Browse Clinics
                        </a>
                        <a href="/login" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <LogIn size={18} />
                            Login
                        </a>
                        <a href="/register" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <UserPlus size={18} />
                            Register Clinic
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}

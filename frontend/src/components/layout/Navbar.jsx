import { Building2, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    <a href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        <Building2 size={28} />
                        <span>ClinicHub</span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <a href="/clinics" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Browse Clinics
                        </a>
                        <a href="/login" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            <LogIn size={18} />
                            Login
                        </a>
                        <a href="/register" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-medium">
                            <UserPlus size={18} />
                            Register Clinic
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
                        <div className="flex flex-col gap-3">
                            <a
                                href="/clinics"
                                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Browse Clinics
                            </a>
                            <a
                                href="/login"
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LogIn size={18} />
                                Login
                            </a>
                            <a
                                href="/register"
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <UserPlus size={18} />
                                Register Clinic
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

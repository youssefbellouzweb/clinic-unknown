import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';

export default function Topbar({ user, onLogout }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 lg:hidden">
                    {/* Mobile Menu Button Placeholder - would be implemented with a context or prop to toggle sidebar */}
                    <button className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <span className="font-bold text-xl text-gray-900">ClinicHub</span>
                </div>

                <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Search size={18} className="text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search patients, appointments..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-gray-900"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900 leading-none">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 mt-0.5 capitalize">{user?.role?.replace('_', ' ') || 'Role'}</p>
                            </div>
                            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-scale-in origin-top-right">
                                <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                                <a href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                    Your Profile
                                </a>
                                <a href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                    Settings
                                </a>
                                <div className="border-t border-gray-50 my-1"></div>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

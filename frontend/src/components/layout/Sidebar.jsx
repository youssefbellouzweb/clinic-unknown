import { LayoutDashboard, Users, Calendar, Settings, Activity, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar({ currentPath, userRole, clinicName }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/patients', label: 'Patients', icon: Users },
        { path: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
    ];

    if (userRole === 'admin' || userRole === 'owner') {
        menuItems.push({ path: '/dashboard/users', label: 'Staff Management', icon: Settings });
    }

    const isActive = (path) => {
        if (path === '/dashboard' && currentPath === '/dashboard') return true;
        if (path !== '/dashboard' && currentPath.startsWith(path)) return true;
        return false;
    };

    return (
        <aside
            className={`bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                } z-30 hidden lg:flex`}
        >
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            CH
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 leading-none">ClinicHub</h1>
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">{clinicName || 'Loading...'}</p>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto">
                        CH
                    </div>
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ${isCollapsed ? 'hidden' : ''}`}
                >
                    <ChevronRight size={16} className="transform rotate-180" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                        <a
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${active
                                    ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon size={20} className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />

                            {!isCollapsed && (
                                <span className="animate-fade-in">{item.label}</span>
                            )}

                            {active && !isCollapsed && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                            )}
                        </a>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <a
                    href="#"
                    id="logout-btn-sidebar"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    title="Logout"
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </a>
            </div>
        </aside>
    );
}

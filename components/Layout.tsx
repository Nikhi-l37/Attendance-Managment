
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { DashboardIcon, UsersIcon, ChartBarIcon, LogoutIcon, BookOpenIcon, ClipboardListIcon } from './icons';

interface LayoutProps {
  children: React.ReactNode;
}

const NavLink: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
    <a
        href="#"
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center px-4 py-3 text-gray-200 hover:bg-slate-700 rounded-md transition-colors duration-200 ${active ? 'bg-slate-700' : ''}`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </a>
);

const Sidebar: React.FC<{ activeView: string; setActiveView: (view: string) => void; }> = ({ activeView, setActiveView }) => {
    const { user, logout } = useAuth();

    const getNavItems = () => {
        switch (user?.role) {
            case Role.ADMIN:
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
                    { id: 'students', label: 'Students', icon: <UsersIcon /> },
                    { id: 'teachers', label: 'Teachers', icon: <UsersIcon /> },
                    { id: 'reports', label: 'Reports', icon: <ChartBarIcon /> },
                ];
            case Role.TEACHER:
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
                    { id: 'attendance', label: 'Attendance', icon: <ClipboardListIcon /> },
                    { id: 'marks', label: 'Marks', icon: <BookOpenIcon /> },
                ];
            case Role.STUDENT:
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
                ];
            default:
                return [];
        }
    };

    return (
        <aside className="w-64 bg-slate-800 text-white flex-shrink-0 flex flex-col">
            <div className="h-20 flex items-center justify-center bg-slate-900">
                <h1 className="text-xl font-bold">AcademiaSystem</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {getNavItems().map(item => (
                    <NavLink
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeView === item.id}
                        onClick={() => setActiveView(item.id)}
                    />
                ))}
            </nav>
            <div className="p-4 border-t border-slate-700">
                <NavLink icon={<LogoutIcon />} label="Logout" onClick={logout} />
            </div>
        </aside>
    );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user } = useAuth();
    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
             <button onClick={onMenuClick} className="text-gray-500 focus:outline-none lg:hidden">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-700">Welcome, {user?.name}</h2>
            <div>
                <div className="text-right">
                    <p className="text-gray-800 font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
            </div>
        </header>
    );
};

export const Layout: React.FC<{ activeView: string; setActiveView: (view: string) => void; children: React.ReactNode; }> = ({ activeView, setActiveView, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-100">
            <div className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-slate-800 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar activeView={activeView} setActiveView={setActiveView} />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

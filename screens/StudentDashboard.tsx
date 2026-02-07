import React, { useMemo, useState, useEffect } from 'react';
import { type Student } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { DashboardCard } from '../components/DashboardCard';
import { StudentChart } from '../components/StudentChart';
import { UsersIcon, BookOpenIcon, ClipboardListIcon } from '../components/icons';
import { api } from '../services/api';

export const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [studentData, setStudentData] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = React.useState('dashboard');

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user?.id) {
                setIsLoading(true);
                const data = await api.getStudentById(user.id);
                setStudentData(data);
                setIsLoading(false);
            }
        };
        fetchStudentData();
    }, [user]);

    const attendanceSummary = useMemo(() => {
        if (!studentData?.attendance) return { present: 0, total: 0, percentage: '0' };
        const presentDays = studentData.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const totalDays = studentData.attendance.length;
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';
        return { present: presentDays, total: totalDays, percentage };
    }, [studentData]);

    const averageMarks = useMemo(() => {
        if (!studentData?.marks || studentData.marks.length === 0) return '0';
        const total = studentData.marks.reduce((acc, curr) => acc + curr.marks, 0);
        return (total / studentData.marks.length).toFixed(1);
    }, [studentData]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Loading student data...</p>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-slate-700 mb-6">Could not load your student data. Your account may have been removed by an administrator.</p>
                    <button 
                        onClick={logout} 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-slideInUp">Student Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                 <div className="stagger-1"><DashboardCard 
                    title="Overall Attendance" 
                    value={`${attendanceSummary.percentage}%`} 
                    icon={<ClipboardListIcon className="w-8 h-8 text-white"/>} 
                    color="bg-gradient-to-r from-green-500 to-green-600" 
                /></div>
                 <div className="stagger-2"><DashboardCard 
                    title="Average Marks" 
                    value={averageMarks} 
                    icon={<BookOpenIcon className="w-8 h-8 text-white"/>} 
                    color="bg-gradient-to-r from-blue-500 to-blue-600" 
                /></div>
                <div className="stagger-3"><DashboardCard 
                    title="Class" 
                    value={studentData.class} 
                    icon={<UsersIcon className="w-8 h-8 text-white"/>} 
                    color="bg-gradient-to-r from-purple-500 to-pink-500" 
                /></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="animate-slideInLeft"><StudentChart marks={studentData.marks} /></div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-slideInRight hover-lift">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <span className="mr-2">📋</span> Attendance Details
                    </h3>
                    <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Month</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {studentData.attendance.length > 0 ? studentData.attendance.map(record => (
                                    <tr key={record.month} className="hover:bg-indigo-50 transition-all duration-300 transform hover:scale-[1.01]">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.month}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={2} className="text-center py-8 text-gray-500">No attendance records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
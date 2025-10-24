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
        return <div className="min-h-screen flex items-center justify-center">Loading student data...</div>;
    }

    if (!studentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-slate-600 mb-6">Could not load your student data. Your account may have been removed by an administrator.</p>
                    <button 
                        onClick={logout} 
                        className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                 <DashboardCard 
                    title="Overall Attendance" 
                    value={`${attendanceSummary.percentage}%`} 
                    icon={<ClipboardListIcon className="w-8 h-8 text-white"/>} 
                    color="bg-green-500" 
                />
                 <DashboardCard 
                    title="Average Marks" 
                    value={averageMarks} 
                    icon={<BookOpenIcon className="w-8 h-8 text-white"/>} 
                    color="bg-blue-500" 
                />
                <DashboardCard 
                    title="Class" 
                    value={studentData.class} 
                    icon={<UsersIcon className="w-8 h-8 text-white"/>} 
                    color="bg-purple-500" 
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StudentChart marks={studentData.marks} />

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Attendance Details</h3>
                    <div className="overflow-x-auto max-h-80">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {studentData.attendance.length > 0 ? studentData.attendance.map(record => (
                                    <tr key={record.month}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.month}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.status}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={2} className="text-center py-4 text-gray-500">No attendance records found.</td>
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

import React, { useMemo } from 'react';
import { type Student } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { DashboardCard } from '../components/DashboardCard';
import { StudentChart } from '../components/StudentChart';
import { UsersIcon, BookOpenIcon, ClipboardListIcon } from '../components/icons';

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const student = user as Student;
    const [activeView, setActiveView] = React.useState('dashboard');

    const attendanceSummary = useMemo(() => {
        if (!student || !student.attendance) return { present: 0, total: 0, percentage: '0' };
        const presentDays = student.attendance.filter(a => a.status === 'Present').length;
        const totalDays = student.attendance.length;
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';
        return { present: presentDays, total: totalDays, percentage };
    }, [student]);

    const averageMarks = useMemo(() => {
        if (!student || !student.marks || student.marks.length === 0) return '0';
        const total = student.marks.reduce((acc, curr) => acc + curr.marks, 0);
        return (total / student.marks.length).toFixed(1);
    }, [student]);

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
                    value={student.class} 
                    icon={<UsersIcon className="w-8 h-8 text-white"/>} 
                    color="bg-purple-500" 
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StudentChart marks={student.marks} />

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Attendance Details</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {student.attendance.map(record => (
                                    <tr key={record.month}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.month}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};


import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { type Student, type Teacher } from '../types';
import { Layout } from '../components/Layout';
import { UsersIcon, ChartBarIcon } from '../components/icons';
import { DashboardCard } from '../components/DashboardCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboardHome = () => {
    const chartData = [
        { name: 'Class 10A', students: 30, attendance: 95 },
        { name: 'Class 10B', students: 28, attendance: 92 },
        { name: 'Class 11A', students: 35, attendance: 98 },
        { name: 'Class 11B', students: 32, attendance: 91 },
    ];
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <DashboardCard title="Total Students" value="125" icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-blue-500" />
                <DashboardCard title="Total Teachers" value="15" icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-green-500" />
                <DashboardCard title="Overall Attendance" value="94%" icon={<ChartBarIcon className="w-8 h-8 text-white"/>} color="bg-yellow-500" />
                <DashboardCard title="Classes" value="8" icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-purple-500" />
            </div>
             <div className="bg-white p-4 rounded-lg shadow-md h-96">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Class Performance</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 5,}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[80, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="students" fill="#8884d8" name="Number of Students" />
                        <Bar yAxisId="right" dataKey="attendance" fill="#82ca9d" name="Attendance (%)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

const StudentManagement = () => {
    const [students, setStudents] = useState<Student[]>([]);
    useEffect(() => {
        api.getStudents().then(setStudents);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Management</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    useEffect(() => {
        api.getTeachers().then(setTeachers);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Management</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.teacherId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState('dashboard');
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <AdminDashboardHome />;
            case 'students':
                return <StudentManagement />;
            case 'teachers':
                return <TeacherManagement />;
            case 'reports':
                return <AdminDashboardHome />; // Reusing for demo
            default:
                return <AdminDashboardHome />;
        }
    };

    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            {renderContent()}
        </Layout>
    );
};

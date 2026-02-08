
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { type Student, type Teacher } from '../types';
import { Layout } from '../components/Layout';
import { UsersIcon, ChartBarIcon, PlusIcon, TrashIcon, XIcon } from '../components/icons';
import { DashboardCard } from '../components/DashboardCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboardHome = ({ students, teachers }: { students: Student[], teachers: Teacher[] }) => {
    const chartData = [
        { name: 'Class 10A', students: students.filter(s => s.class === '10A').length, attendance: 95 },
        { name: 'Class 10B', students: students.filter(s => s.class === '10B').length, attendance: 92 },
        { name: 'Class 11A', students: students.filter(s => s.class === '11A').length, attendance: 98 },
    ];
    return (
        <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-slideInUp">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="stagger-1"><DashboardCard title="Total Students" value={students.length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-blue-500 to-blue-600" /></div>
                <div className="stagger-2"><DashboardCard title="Total Teachers" value={teachers.length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-green-500 to-green-600" /></div>
                <div className="stagger-3"><DashboardCard title="Overall Attendance" value="94%" icon={<ChartBarIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-yellow-500 to-orange-500" /></div>
                <div className="stagger-4"><DashboardCard title="Classes" value={[...new Set(students.map(s => s.class))].length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-purple-500 to-pink-500" /></div>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 h-96 animate-slideInUp hover-lift">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                    <span className="mr-2">📊</span> Class Overview
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 5,}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Bar dataKey="students" fill="url(#colorStudents)" name="Number of Students" radius={[8, 8, 0, 0]} />
                        <defs>
                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

const StudentManagement = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', studentId: '', class: '' });

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        const data = await api.getStudents();
        setStudents(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
    }
    
    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addStudent(newStudent);
            setShowModal(false);
            setNewStudent({ name: '', email: '', studentId: '', class: '' });
            fetchStudents(); // Refresh list
        } catch (error) {
            alert((error as Error).message);
        }
    }

    const handleDeleteStudent = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            await api.deleteStudent(id);
            fetchStudents(); // Refresh list
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6 animate-slideInUp">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Student Management</h1>
                <button onClick={() => setShowModal(true)} className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-medium active:scale-95">
                    <PlusIcon /> <span className="ml-2">Add Student</span>
                </button>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 animate-slideInUp">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table head */}
                        <thead className="bg-gradient-to-r from-indigo-50 dark:from-slate-700 to-purple-50 dark:to-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        {/* Table body */}
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {isLoading ? (<tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    <span className="ml-3">Loading...</span>
                                </div>
                            </td></tr>) : 
                            students.map(student => (
                                <tr key={student.id} className="hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-[1.01]">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.studentId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-medium">{student.class}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95">
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Add New Student</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-all duration-200">
                                <XIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent}>
                            {/* Form fields */}
                            <input name="name" value={newStudent.name} onChange={handleInputChange} placeholder="Full Name" className="w-full p-3 mb-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <input name="email" type="email" value={newStudent.email} onChange={handleInputChange} placeholder="Email" className="w-full p-3 mb-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <input name="studentId" value={newStudent.studentId} onChange={handleInputChange} placeholder="Student ID" className="w-full p-3 mb-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <input name="class" value={newStudent.class} onChange={handleInputChange} placeholder="Class (e.g., 10A)" className="w-full p-3 mb-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-medium active:scale-95">Add Student</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTeacher, setNewTeacher] = useState({ name: '', email: '', teacherId: '', department: '', classes: '' });

    const fetchTeachers = useCallback(async () => {
        setIsLoading(true);
        const data = await api.getTeachers();
        setTeachers(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTeacher({ ...newTeacher, [e.target.name]: e.target.value });
    }
    
    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addTeacher({ ...newTeacher, classes: newTeacher.classes.split(',').map(c => c.trim()) });
            setShowModal(false);
            setNewTeacher({ name: '', email: '', teacherId: '', department: '', classes: '' });
            fetchTeachers();
        } catch (error) {
            alert((error as Error).message);
        }
    }

    const handleDeleteTeacher = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            await api.deleteTeacher(id);
            fetchTeachers();
        }
    }

    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Teacher Management</h1>
                <button onClick={() => setShowModal(true)} className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium">
                    <PlusIcon /> <span className="ml-2">Add Teacher</span>
                </button>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gradient-to-r from-indigo-50 dark:from-slate-700 to-purple-50 dark:to-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Teacher ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                             {isLoading ? (<tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    <span className="ml-3">Loading...</span>
                                </div>
                            </td></tr>) : 
                                teachers.map(teacher => (
                                    <tr key={teacher.id} className="hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{teacher.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{teacher.teacherId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">{teacher.department}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{teacher.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-all duration-200">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Add New Teacher</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-all duration-200">
                                <XIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddTeacher}>
                            <input name="name" value={newTeacher.name} onChange={handleInputChange} placeholder="Full Name" className="w-full p-3 mb-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <input name="email" type="email" value={newTeacher.email} onChange={handleInputChange} placeholder="Email" className="w-full p-3 mb-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <input name="teacherId" value={newTeacher.teacherId} onChange={handleInputChange} placeholder="Teacher ID" className="w-full p-3 mb-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <input name="department" value={newTeacher.department} onChange={handleInputChange} placeholder="Department" className="w-full p-3 mb-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <input name="classes" value={newTeacher.classes} onChange={handleInputChange} placeholder="Classes (comma-separated)" className="w-full p-3 mb-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" required />
                            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium">Add Teacher</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    useEffect(() => {
        api.getStudents().then(setStudents);
        api.getTeachers().then(setTeachers);
    }, []);
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <AdminDashboardHome students={students} teachers={teachers} />;
            case 'students':
                return <StudentManagement />;
            case 'teachers':
                return <TeacherManagement />;
            case 'reports':
                return <AdminDashboardHome students={students} teachers={teachers} />; // Reusing for demo
            default:
                return <AdminDashboardHome students={students} teachers={teachers} />;
        }
    };

    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            {renderContent()}
        </Layout>
    );
};

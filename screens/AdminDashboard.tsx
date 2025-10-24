
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <DashboardCard title="Total Students" value={students.length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-blue-500" />
                <DashboardCard title="Total Teachers" value={teachers.length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-green-500" />
                <DashboardCard title="Overall Attendance" value="94%" icon={<ChartBarIcon className="w-8 h-8 text-white"/>} color="bg-yellow-500" />
                <DashboardCard title="Classes" value={[...new Set(students.map(s => s.class))].length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-purple-500" />
            </div>
             <div className="bg-white p-4 rounded-lg shadow-md h-96">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Class Overview</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 5,}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="students" fill="#8884d8" name="Number of Students" />
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
                <button onClick={() => setShowModal(true)} className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                    <PlusIcon /> <span className="ml-2">Add Student</span>
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table head */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        {/* Table body */}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>) : 
                            students.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Student</h2>
                            <button onClick={() => setShowModal(false)}><XIcon /></button>
                        </div>
                        <form onSubmit={handleAddStudent}>
                            {/* Form fields */}
                            <input name="name" value={newStudent.name} onChange={handleInputChange} placeholder="Full Name" className="w-full p-2 mb-3 border rounded" required />
                            <input name="email" type="email" value={newStudent.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 mb-3 border rounded" required />
                            <input name="studentId" value={newStudent.studentId} onChange={handleInputChange} placeholder="Student ID" className="w-full p-2 mb-3 border rounded" required />
                            <input name="class" value={newStudent.class} onChange={handleInputChange} placeholder="Class (e.g., 10A)" className="w-full p-2 mb-4 border rounded" required />
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Add Student</button>
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
                <h1 className="text-3xl font-bold text-gray-800">Teacher Management</h1>
                <button onClick={() => setShowModal(true)} className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                    <PlusIcon /> <span className="ml-2">Add Teacher</span>
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {isLoading ? (<tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>) : 
                                teachers.map(teacher => (
                                    <tr key={teacher.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.teacherId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-600 hover:text-red-900"><TrashIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Teacher</h2>
                            <button onClick={() => setShowModal(false)}><XIcon /></button>
                        </div>
                        <form onSubmit={handleAddTeacher}>
                            <input name="name" value={newTeacher.name} onChange={handleInputChange} placeholder="Full Name" className="w-full p-2 mb-3 border rounded" required />
                            <input name="email" type="email" value={newTeacher.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 mb-3 border rounded" required />
                            <input name="teacherId" value={newTeacher.teacherId} onChange={handleInputChange} placeholder="Teacher ID" className="w-full p-2 mb-3 border rounded" required />
                            <input name="department" value={newTeacher.department} onChange={handleInputChange} placeholder="Department" className="w-full p-2 mb-3 border rounded" required />
                            <input name="classes" value={newTeacher.classes} onChange={handleInputChange} placeholder="Classes (comma-separated)" className="w-full p-2 mb-4 border rounded" required />
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Add Teacher</button>
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

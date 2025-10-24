
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { type Student, type Teacher } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { DashboardCard } from '../components/DashboardCard';
import { UsersIcon, BookOpenIcon, ClipboardListIcon } from '../components/icons';

const TeacherDashboardHome: React.FC<{ teacher: Teacher }> = ({ teacher }) => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Assigned Classes" value={teacher.classes.join(', ')} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-blue-500" />
            <DashboardCard title="Department" value={teacher.department} icon={<BookOpenIcon className="w-8 h-8 text-white"/>} color="bg-green-500" />
            <DashboardCard title="Total Students" value="58" icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-purple-500" />
        </div>
    </div>
);

const AttendanceManagement: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [selectedClass, setSelectedClass] = useState(teacher.classes[0]);
    const [students, setStudents] = useState<Student[]>([]);
    
    useEffect(() => {
        api.getStudentsByClass(selectedClass).then(setStudents);
    }, [selectedClass]);
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance Management</h1>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="mb-4 p-2 border rounded">
                {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {students.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-2 border-b">
                        <span>{student.name}</span>
                        <div className="flex gap-2">
                             <button className="px-3 py-1 text-sm bg-green-200 text-green-800 rounded">Present</button>
                             <button className="px-3 py-1 text-sm bg-red-200 text-red-800 rounded">Absent</button>
                             <button className="px-3 py-1 text-sm bg-yellow-200 text-yellow-800 rounded">Late</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MarksManagement: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [selectedClass, setSelectedClass] = useState(teacher.classes[0]);
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        api.getStudentsByClass(selectedClass).then(setStudents);
    }, [selectedClass]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Marks Management</h1>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="mb-4 p-2 border rounded">
                {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {students.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-2 border-b">
                        <span>{student.name}</span>
                        <input type="number" max="100" min="0" className="w-20 p-1 border rounded" placeholder="Marks" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const teacher = user as Teacher;

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <TeacherDashboardHome teacher={teacher} />;
            case 'attendance':
                return <AttendanceManagement teacher={teacher} />;
            case 'marks':
                return <MarksManagement teacher={teacher} />;
            default:
                return <TeacherDashboardHome teacher={teacher} />;
        }
    };
    
    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            {renderContent()}
        </Layout>
    );
};


import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { type Student, type Teacher } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { DashboardCard } from '../components/DashboardCard';
import { UsersIcon, BookOpenIcon } from '../components/icons';

const TeacherDashboardHome: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [studentCount, setStudentCount] = useState(0);

    useEffect(() => {
        const fetchStudents = async () => {
            const studentPromises = teacher.classes.map(c => api.getStudentsByClass(c));
            const studentsPerClass = await Promise.all(studentPromises);
            const total = studentsPerClass.reduce((acc, curr) => acc + curr.length, 0);
            setStudentCount(total);
        }
        fetchStudents();
    }, [teacher.classes]);

    return (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Assigned Classes" value={teacher.classes.join(', ')} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-blue-500" />
            <DashboardCard title="Department" value={teacher.department} icon={<BookOpenIcon className="w-8 h-8 text-white"/>} color="bg-green-500" />
            <DashboardCard title="Total Students" value={studentCount.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-purple-500" />
        </div>
    </div>
    )
};

const AttendanceManagement: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [selectedClass, setSelectedClass] = useState(teacher.classes[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [month, setMonth] = useState('Jan'); // Simple month selection for demo
    
    useEffect(() => {
        if(selectedClass) api.getStudentsByClass(selectedClass).then(setStudents);
    }, [selectedClass]);
    
    const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
        api.updateStudentAttendance(studentId, month, status);
        // Optimistic UI update
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const newAttendance = [...s.attendance];
                const record = newAttendance.find(a => a.month === month);
                if (record) record.status = status;
                else newAttendance.push({ month, status });
                return { ...s, attendance: newAttendance };
            }
            return s;
        }));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance Management</h1>
            <div className="flex gap-4 mb-4">
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 border rounded bg-white">
                    {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={month} onChange={e => setMonth(e.target.value)} className="p-2 border rounded bg-white">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {students.map(student => {
                    const currentStatus = student.attendance.find(a => a.month === month)?.status;
                    return (
                        <div key={student.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 border-b">
                            <span className="font-medium text-gray-800 mb-2 sm:mb-0">{student.name}</span>
                            <div className="flex gap-2">
                                <button onClick={() => handleStatusChange(student.id, 'Present')} className={`px-3 py-1 text-sm rounded transition-colors ${currentStatus === 'Present' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>Present</button>
                                <button onClick={() => handleStatusChange(student.id, 'Absent')} className={`px-3 py-1 text-sm rounded transition-colors ${currentStatus === 'Absent' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>Absent</button>
                                <button onClick={() => handleStatusChange(student.id, 'Late')} className={`px-3 py-1 text-sm rounded transition-colors ${currentStatus === 'Late' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>Late</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MarksManagement: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [selectedClass, setSelectedClass] = useState(teacher.classes[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [month, setMonth] = useState('Jan');
    const [subject, setSubject] = useState(teacher.department === 'Science' ? 'Science' : 'Math');
    const [marks, setMarks] = useState<{[key: string]: number | string}>({});

    useEffect(() => {
        if(selectedClass) api.getStudentsByClass(selectedClass).then(setStudents);
    }, [selectedClass]);

    useEffect(() => {
        // Populate marks state when students load or subject/month changes
        const initialMarks: {[key: string]: number | string} = {};
        students.forEach(s => {
            const markRecord = s.marks.find(m => m.month === month && m.subject === subject);
            initialMarks[s.id] = markRecord ? markRecord.marks : '';
        });
        setMarks(initialMarks);
    }, [students, month, subject]);

    const handleMarkChange = (studentId: string, value: string) => {
        setMarks(prev => ({ ...prev, [studentId]: value }));
    }

    const handleSaveMarks = (studentId: string) => {
        const studentMark = marks[studentId];
        if (typeof studentMark === 'string' && studentMark.trim() === '') return;
        const numericMark = Number(studentMark);
        if(!isNaN(numericMark) && numericMark >= 0 && numericMark <= 100) {
            api.updateStudentMarks(studentId, month, subject, numericMark);
            alert(`Marks saved for student.`);
        } else {
            alert('Please enter a valid mark between 0 and 100.');
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Marks Management</h1>
            <div className="flex gap-4 mb-4">
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 border rounded bg-white">
                    {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={month} onChange={e => setMonth(e.target.value)} className="p-2 border rounded bg-white">
                     {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="p-2 border rounded"/>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {students.map(student => (
                    <div key={student.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 border-b">
                        <span className="font-medium text-gray-800 mb-2 sm:mb-0">{student.name}</span>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                max="100" min="0" 
                                value={marks[student.id] || ''}
                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                className="w-24 p-2 border rounded" 
                                placeholder="Marks" 
                            />
                            <button onClick={() => handleSaveMarks(student.id)} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm">Save</button>
                        </div>
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

    if (!teacher || !teacher.classes) {
        return <div className="min-h-screen flex items-center justify-center">Loading teacher data...</div>;
    }

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

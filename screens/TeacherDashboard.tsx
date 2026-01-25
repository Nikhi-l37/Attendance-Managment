
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Teacher Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Assigned Classes" value={teacher.classes.join(', ')} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-blue-500 to-blue-600" />
            <DashboardCard title="Department" value={teacher.department} icon={<BookOpenIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-green-500 to-green-600" />
            <DashboardCard title="Total Students" value={studentCount.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-purple-500 to-pink-500" />
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Attendance Management</h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                    {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={month} onChange={e => setMonth(e.target.value)} className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-2">
                {students.map(student => {
                    const currentStatus = student.attendance.find(a => a.month === month)?.status;
                    return (
                        <div key={student.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-100 rounded-lg hover:bg-indigo-50 transition-all duration-200">
                            <span className="font-semibold text-gray-800 mb-2 sm:mb-0">{student.name}</span>
                            <div className="flex gap-2">
                                <button onClick={() => handleStatusChange(student.id, 'Present')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${currentStatus === 'Present' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>✓ Present</button>
                                <button onClick={() => handleStatusChange(student.id, 'Absent')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${currentStatus === 'Absent' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>✗ Absent</button>
                                <button onClick={() => handleStatusChange(student.id, 'Late')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${currentStatus === 'Late' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>⏰ Late</button>
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Marks Management</h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                    {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={month} onChange={e => setMonth(e.target.value)} className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                     {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="p-3 border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"/>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-2">
                {students.map(student => (
                    <div key={student.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-100 rounded-lg hover:bg-indigo-50 transition-all duration-200">
                        <span className="font-semibold text-gray-800 mb-2 sm:mb-0">{student.name}</span>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                max="100" min="0" 
                                value={marks[student.id] || ''}
                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                className="w-28 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm" 
                                placeholder="Marks" 
                            />
                            <button onClick={() => handleSaveMarks(student.id)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium text-sm">Save</button>
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Loading teacher data...</p>
                </div>
            </div>
        );
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

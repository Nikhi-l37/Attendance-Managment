
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { type Student, type Teacher } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { DashboardCard } from '../components/DashboardCard';
import { UsersIcon, BookOpenIcon, AlertTriangleIcon } from '../components/icons';
import { DefaultersList } from '../components/DefaultersList';
import { calculateAttendanceStats } from '../services/attendanceUtils';
import { exportAttendanceToCsv, exportMarksToCsv } from '../services/csvUtils';
import { ReportCardModal } from '../components/ReportCardModal';

const TeacherDashboardHome: React.FC<{ teacher: Teacher; onNavigateDefaulters?: () => void }> = ({ teacher, onNavigateDefaulters }) => {
    const [studentCount, setStudentCount] = useState(0);
    const [defaulterCount, setDefaulterCount] = useState(0);

    useEffect(() => {
        const fetchStudents = async () => {
            const studentPromises = teacher.classes.map(c => api.getStudentsByClass(c));
            const studentsPerClass = await Promise.all(studentPromises);
            const allStudents = studentsPerClass.flat();
            setStudentCount(allStudents.length);
            const defaulters = allStudents.filter(s => calculateAttendanceStats(s, 75).isDefaulter);
            setDefaulterCount(defaulters.length);
        };
        fetchStudents();
    }, [teacher.classes]);

    return (
    <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-slideInUp">Teacher Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="stagger-1"><DashboardCard title="Assigned Classes" value={teacher.classes.join(', ')} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-blue-500 to-blue-600" /></div>
            <div className="stagger-2"><DashboardCard title="Department" value={teacher.department} icon={<BookOpenIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-green-500 to-green-600" /></div>
            <div className="stagger-3"><DashboardCard title="Total Students" value={studentCount.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-purple-500 to-pink-500" /></div>
            <div className="stagger-4 cursor-pointer" onClick={onNavigateDefaulters}>
                <DashboardCard 
                    title="Defaulters (<75%)" 
                    value={defaulterCount.toString()} 
                    icon={<AlertTriangleIcon className="w-8 h-8 text-white"/>} 
                    color={defaulterCount > 0 ? "bg-gradient-to-r from-rose-500 to-red-600" : "bg-gradient-to-r from-emerald-500 to-teal-600"} 
                />
            </div>
        </div>

        {defaulterCount > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between animate-fadeIn mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h4 className="text-sm font-bold text-rose-900">Attendance Alert: {defaulterCount} {defaulterCount === 1 ? 'student is' : 'students are'} below 75%</h4>
                        <p className="text-xs text-rose-700">Immediate academic intervention or warning dispatch is advised.</p>
                    </div>
                </div>
                {onNavigateDefaulters && (
                    <button 
                        type="button" 
                        onClick={onNavigateDefaulters}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow transition-all"
                    >
                        View Defaulters →
                    </button>
                )}
            </div>
        )}
    </div>
    );
};

const AttendanceManagement: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [selectedClass, setSelectedClass] = useState(teacher.classes[0] || '10A');
    const [students, setStudents] = useState<Student[]>([]);
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [month, setMonth] = useState('Jan');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSavingAll, setIsSavingAll] = useState(false);

    const activeKey = viewMode === 'daily' ? selectedDate : month;

    useEffect(() => {
        if (selectedClass) api.getStudentsByClass(selectedClass).then(setStudents);
    }, [selectedClass]);

    const handleStatusChange = async (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
        await api.updateStudentAttendance(studentId, activeKey, status, viewMode === 'daily' ? selectedDate : undefined);
        // Optimistic UI update
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const newAttendance = [...s.attendance];
                const recordIndex = newAttendance.findIndex(a => 
                    viewMode === 'daily' 
                        ? a.date === selectedDate || (a.month === activeKey && !a.date)
                        : a.month === month
                );
                if (recordIndex >= 0) {
                    newAttendance[recordIndex] = { 
                        ...newAttendance[recordIndex], 
                        status, 
                        date: viewMode === 'daily' ? selectedDate : newAttendance[recordIndex].date 
                    };
                } else {
                    newAttendance.push({ 
                        date: viewMode === 'daily' ? selectedDate : undefined, 
                        month: viewMode === 'daily' ? new Date(selectedDate).toLocaleString('default', { month: 'short' }) : month, 
                        status 
                    });
                }
                return { ...s, attendance: newAttendance };
            }
            return s;
        }));
    };

    const handleMarkAll = async (status: 'Present' | 'Absent' | 'Late') => {
        setIsSavingAll(true);
        await api.markAllClassAttendance(selectedClass, activeKey, status, viewMode === 'daily' ? selectedDate : undefined);
        setStudents(prev => prev.map(s => {
            const newAttendance = [...s.attendance];
            const recordIndex = newAttendance.findIndex(a => 
                viewMode === 'daily' 
                    ? a.date === selectedDate || (a.month === activeKey && !a.date)
                    : a.month === month
            );
            if (recordIndex >= 0) {
                newAttendance[recordIndex] = { 
                    ...newAttendance[recordIndex], 
                    status, 
                    date: viewMode === 'daily' ? selectedDate : newAttendance[recordIndex].date 
                };
            } else {
                newAttendance.push({ 
                    date: viewMode === 'daily' ? selectedDate : undefined, 
                    month: viewMode === 'daily' ? new Date(selectedDate).toLocaleString('default', { month: 'short' }) : month, 
                    status 
                });
            }
            return { ...s, attendance: newAttendance };
        }));
        setIsSavingAll(false);
    };

    const stats = useMemo(() => {
        let present = 0;
        let absent = 0;
        let late = 0;
        let unmarked = 0;

        students.forEach(student => {
            const rec = student.attendance.find(a => 
                viewMode === 'daily' 
                    ? a.date === selectedDate || (a.month === activeKey && !a.date)
                    : a.month === month
            );
            if (!rec) unmarked++;
            else if (rec.status === 'Present') present++;
            else if (rec.status === 'Absent') absent++;
            else if (rec.status === 'Late') late++;
        });

        const total = students.length;
        const presentRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

        return { present, absent, late, unmarked, total, presentRate };
    }, [students, activeKey, viewMode, selectedDate, month]);

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const q = searchQuery.toLowerCase();
        return students.filter(s => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q));
    }, [students, searchQuery]);

    const setQuickDate = (daysAgo: number) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-slideInUp">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Attendance Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Track daily class presence or review monthly trends.
                    </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex p-1 bg-slate-200 rounded-xl max-w-fit shadow-inner">
                    <button
                        type="button"
                        onClick={() => setViewMode('daily')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${viewMode === 'daily' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        📅 Daily Attendance
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('monthly')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${viewMode === 'monthly' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        🗓️ Monthly View
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-slate-100 mb-6 space-y-4 animate-slideInLeft">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    {/* Class Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Class</label>
                        <select 
                            value={selectedClass} 
                            onChange={e => setSelectedClass(e.target.value)} 
                            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                        >
                            {teacher.classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                        </select>
                    </div>

                    {/* Date / Month Picker */}
                    {viewMode === 'daily' ? (
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Attendance Date
                            </label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="p-2 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuickDate(0)}
                                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${selectedDate === new Date().toISOString().split('T')[0] ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuickDate(1)}
                                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all"
                                >
                                    Yesterday
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Academic Month</label>
                            <select 
                                value={month} 
                                onChange={e => setMonth(e.target.value)} 
                                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                            >
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Quick Search */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter Student</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name or ID..."
                            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                </div>

                {/* Bulk Actions & Summary Banner */}
                <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Quick Actions:</span>
                        <button
                            type="button"
                            disabled={isSavingAll || students.length === 0}
                            onClick={() => handleMarkAll('Present')}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            ✓ Mark All Present
                        </button>
                        <button
                            type="button"
                            disabled={isSavingAll || students.length === 0}
                            onClick={() => handleMarkAll('Absent')}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            ✗ Mark All Absent
                        </button>
                        <button
                            type="button"
                            disabled={students.length === 0}
                            onClick={() => exportAttendanceToCsv(students, selectedClass, activeKey)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            <span>📥</span> Export CSV
                        </button>
                    </div>

                    {/* Mini Stats Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                            <strong>{stats.present}</strong> Present
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                            <strong>{stats.absent}</strong> Absent
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                            <strong>{stats.late}</strong> Late
                        </span>
                        {stats.unmarked > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                <strong>{stats.unmarked}</strong> Unmarked
                            </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                            {stats.presentRate}% Rate
                        </span>
                    </div>
                </div>
            </div>

            {/* Students List */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-3 animate-slideInUp">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Student Details</span>
                    <span>Status for {activeKey}</span>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        No students found matching your criteria.
                    </div>
                ) : (
                    filteredStudents.map(student => {
                        const overallStats = calculateAttendanceStats(student, 75);
                        const currentRecord = student.attendance.find(a => 
                            viewMode === 'daily' 
                                ? a.date === selectedDate || (a.month === activeKey && !a.date)
                                : a.month === month
                        );
                        const currentStatus = currentRecord?.status;

                        return (
                            <div 
                                key={student.id} 
                                className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-slate-100 rounded-xl hover:bg-indigo-50/50 transition-all duration-200 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                                            <span>{student.name}</span>
                                            {overallStats.isDefaulter ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                                    ⚠️ Defaulter ({overallStats.percentage}%)
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {overallStats.percentage}% Attd
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">ID: {student.studentId} • Class {student.class}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => handleStatusChange(student.id, 'Present')} 
                                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                            currentStatus === 'Present' 
                                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md scale-105' 
                                                : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
                                        }`}
                                    >
                                        ✓ Present
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleStatusChange(student.id, 'Absent')} 
                                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                            currentStatus === 'Absent' 
                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md scale-105' 
                                                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                                        }`}
                                    >
                                        ✗ Absent
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleStatusChange(student.id, 'Late')} 
                                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                            currentStatus === 'Late' 
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md scale-105' 
                                                : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                                        }`}
                                    >
                                        ⏰ Late
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
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
    const [reportStudent, setReportStudent] = useState<Student | null>(null);

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-slideInUp">Marks Management</h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slideInLeft">
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                    {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={month} onChange={e => setMonth(e.target.value)} className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                     {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="p-3 border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"/>
                <button
                    type="button"
                    disabled={students.length === 0}
                    onClick={() => exportMarksToCsv(students, selectedClass, month, subject)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-sm shadow transition-all hover:scale-105 active:scale-95 whitespace-nowrap disabled:opacity-50"
                >
                    <span>📥</span> Export Marks (CSV)
                </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-2 animate-slideInUp">
                {students.map(student => (
                    <div key={student.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-100 rounded-lg hover:bg-indigo-50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md">
                        <span className="font-semibold text-gray-800 mb-2 sm:mb-0">{student.name} <span className="text-xs text-slate-400 font-mono">({student.studentId})</span></span>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                max="100" min="0" 
                                value={marks[student.id] || ''}
                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                className="w-28 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm" 
                                placeholder="Marks" 
                            />
                            <button onClick={() => handleSaveMarks(student.id)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-medium text-sm active:scale-95">Save</button>
                            <button 
                                type="button" 
                                onClick={() => setReportStudent(student)} 
                                className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-3 rounded-lg font-medium text-xs transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                                title={`View ${student.name}'s Official Report Card`}
                            >
                                <span>📋</span>
                                <span>Report Card</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Teacher View: Student Report Card Modal */}
            {reportStudent && (
                <ReportCardModal
                    student={reportStudent}
                    onClose={() => setReportStudent(null)}
                />
            )}
        </div>
    );
};

const TeacherDefaultersView: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true);
            const promises = teacher.classes.map(c => api.getStudentsByClass(c));
            const results = await Promise.all(promises);
            setStudents(results.flat());
            setIsLoading(false);
        };
        fetchStudents();
    }, [teacher.classes]);

    if (isLoading) {
        return (
            <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                <p className="text-sm font-medium text-slate-500">Checking attendance records across your classes...</p>
            </div>
        );
    }

    return <DefaultersList students={students} availableClasses={teacher.classes} roleTitle="Teacher Defaulters" />;
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
                return <TeacherDashboardHome teacher={teacher} onNavigateDefaulters={() => setActiveView('defaulters')} />;
            case 'attendance':
                return <AttendanceManagement teacher={teacher} />;
            case 'marks':
                return <MarksManagement teacher={teacher} />;
            case 'defaulters':
                return <TeacherDefaultersView teacher={teacher} />;
            default:
                return <TeacherDashboardHome teacher={teacher} onNavigateDefaulters={() => setActiveView('defaulters')} />;
        }
    };
    
    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            {renderContent()}
        </Layout>
    );
};

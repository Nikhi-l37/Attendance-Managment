
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { type Student, type Teacher } from '../types';
import { Layout } from '../components/Layout';
import { UsersIcon, ChartBarIcon, PlusIcon, TrashIcon, XIcon, AlertTriangleIcon } from '../components/icons';
import { DashboardCard } from '../components/DashboardCard';
import { DefaultersList } from '../components/DefaultersList';
import { calculateAttendanceStats } from '../services/attendanceUtils';
import { downloadCsv, parseStudentsCsv, downloadSampleStudentCsv } from '../services/csvUtils';
import { ReportCardModal } from '../components/ReportCardModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboardHome = ({ students, teachers, onNavigateDefaulters }: { students: Student[], teachers: Teacher[], onNavigateDefaulters?: () => void }) => {
    const defaulters = useMemo(() => {
        return students.filter(s => calculateAttendanceStats(s, 75).isDefaulter);
    }, [students]);

    const chartData = [
        { name: 'Class 10A', students: students.filter(s => s.class === '10A').length, attendance: 95 },
        { name: 'Class 10B', students: students.filter(s => s.class === '10B').length, attendance: 92 },
        { name: 'Class 11A', students: students.filter(s => s.class === '11A').length, attendance: 98 },
    ];
    return (
        <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-slideInUp">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                <div className="stagger-1"><DashboardCard title="Total Students" value={students.length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-blue-500 to-blue-600" /></div>
                <div className="stagger-2"><DashboardCard title="Total Teachers" value={teachers.length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-green-500 to-green-600" /></div>
                <div className="stagger-3"><DashboardCard title="Overall Attendance" value="94%" icon={<ChartBarIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-yellow-500 to-orange-500" /></div>
                <div className="stagger-4"><DashboardCard title="Classes" value={[...new Set(students.map(s => s.class))].length.toString()} icon={<UsersIcon className="w-8 h-8 text-white"/>} color="bg-gradient-to-r from-purple-500 to-pink-500" /></div>
                <div className="stagger-5 cursor-pointer" onClick={onNavigateDefaulters}>
                    <DashboardCard 
                        title="Defaulters (<75%)" 
                        value={defaulters.length.toString()} 
                        icon={<AlertTriangleIcon className="w-8 h-8 text-white"/>} 
                        color={defaulters.length > 0 ? "bg-gradient-to-r from-rose-500 to-red-600" : "bg-gradient-to-r from-emerald-500 to-teal-600"} 
                    />
                </div>
            </div>

            {defaulters.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between animate-fadeIn mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h4 className="text-sm font-bold text-rose-900">Institutional Notice: {defaulters.length} {defaulters.length === 1 ? 'student is' : 'students are'} below 75% attendance</h4>
                            <p className="text-xs text-rose-700">These students risk detention in upcoming examinations.</p>
                        </div>
                    </div>
                    {onNavigateDefaulters && (
                        <button 
                            type="button" 
                            onClick={onNavigateDefaulters}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow transition-all"
                        >
                            Open Defaulter List →
                        </button>
                    )}
                </div>
            )}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 h-96 animate-slideInUp hover-lift">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                    <span className="mr-2">📊</span> Class Overview
                </h3>
                <div className="h-72 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
        </div>
    );
}

const StudentManagement = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', studentId: '', class: '' });

    // CSV Import State
    const [showImportModal, setShowImportModal] = useState(false);
    const [parsedStudents, setParsedStudents] = useState<{ name: string; email: string; studentId: string; class: string }[]>([]);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [selectedReportStudent, setSelectedReportStudent] = useState<Student | null>(null);

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (text) {
                const { valid, errors } = parseStudentsCsv(text);
                setParsedStudents(valid);
                setImportErrors(errors);
            }
        };
        reader.readAsText(file);
    };

    const handleConfirmImport = async () => {
        if (parsedStudents.length === 0) return;
        setIsImporting(true);
        try {
            const result = await api.addMultipleStudents(parsedStudents);
            let msg = `Successfully imported ${result.added.length} students!`;
            if (result.skipped.length > 0) {
                msg += `\n\n${result.skipped.length} students skipped (already exist):\n` + result.skipped.slice(0, 5).join('\n');
                if (result.skipped.length > 5) msg += `\n...and ${result.skipped.length - 5} more.`;
            }
            alert(msg);
            setShowImportModal(false);
            setParsedStudents([]);
            setImportErrors([]);
            fetchStudents();
        } catch (err) {
            alert('Failed to import students.');
        } finally {
            setIsImporting(false);
        }
    };

    const handleExportAllStudents = () => {
        const headers = ['Student ID', 'Full Name', 'Class', 'Email', 'Total Sessions', 'Current Attendance %'];
        const rows: (string | number)[][] = [headers];
        students.forEach(s => {
            const stats = calculateAttendanceStats(s);
            rows.push([s.studentId, s.name, s.class, s.email, s.attendance.length, `${stats.percentage}%`]);
        });
        downloadCsv(`all_students_roster_${new Date().toISOString().split('T')[0]}.csv`, rows);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-slideInUp">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Student Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Enroll new students, export roster, or bulk import via CSV.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleExportAllStudents}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-lg shadow font-medium text-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <span>📤</span> Export Roster (CSV)
                    </button>
                    <button
                        type="button"
                        onClick={() => { setShowImportModal(true); setParsedStudents([]); setImportErrors([]); }}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg shadow font-medium text-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <span>📥</span> Import CSV
                    </button>
                    <button 
                        onClick={() => setShowModal(true)} 
                        className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-medium text-sm active:scale-95"
                    >
                        <PlusIcon /> <span className="ml-1.5">Add Student</span>
                    </button>
                </div>
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
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedReportStudent(student)}
                                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 px-2.5 py-1.5 rounded-lg transition-all transform hover:scale-105 active:scale-95 font-semibold"
                                                title={`View ${student.name}'s Official Report Card`}
                                            >
                                                <span>📋</span>
                                                <span>Report Card</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteStudent(student.id)} 
                                                className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
                                                title="Delete Student"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
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

            {/* CSV Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 border border-gray-100 dark:border-slate-700 animate-scaleIn">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📥</span>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Import Students (CSV)
                                </h2>
                            </div>
                            <button onClick={() => setShowImportModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 p-2 rounded-lg">
                                <XIcon />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                <span className="text-slate-600 dark:text-slate-300">Need the correct column format?</span>
                                <button
                                    type="button"
                                    onClick={downloadSampleStudentCsv}
                                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                >
                                    📥 Download Sample CSV
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 dark:bg-slate-900/30">
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={handleFileUpload}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                                <p className="text-xs text-slate-400 mt-2">Required columns: Name, Email, StudentID, Class</p>
                            </div>

                            {importErrors.length > 0 && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs space-y-1 max-h-32 overflow-y-auto">
                                    <div className="font-bold">⚠️ Warnings / Formatting Errors:</div>
                                    {importErrors.map((err, i) => (
                                        <div key={i}>• {err}</div>
                                    ))}
                                </div>
                            )}

                            {parsedStudents.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <span>Preview: Ready to Import ({parsedStudents.length} students)</span>
                                    </div>
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                                        <table className="min-w-full text-xs divide-y divide-slate-200">
                                            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-1.5 text-left">Name</th>
                                                    <th className="px-3 py-1.5 text-left">ID</th>
                                                    <th className="px-3 py-1.5 text-left">Class</th>
                                                    <th className="px-3 py-1.5 text-left">Email</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {parsedStudents.slice(0, 5).map((s, i) => (
                                                    <tr key={i}>
                                                        <td className="px-3 py-1 font-medium text-slate-800 dark:text-white">{s.name}</td>
                                                        <td className="px-3 py-1 font-mono text-slate-600 dark:text-slate-400">{s.studentId}</td>
                                                        <td className="px-3 py-1 text-slate-600 dark:text-slate-400">{s.class}</td>
                                                        <td className="px-3 py-1 text-slate-500 dark:text-slate-400">{s.email}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {parsedStudents.length > 5 && (
                                            <div className="text-center py-1 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800">
                                                + {parsedStudents.length - 5} more students
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="w-1/2 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={parsedStudents.length === 0 || isImporting}
                                    onClick={handleConfirmImport}
                                    className="w-1/2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 text-sm font-semibold shadow transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isImporting ? 'Importing...' : `Import (${parsedStudents.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Official Student Report Card Modal */}
            {selectedReportStudent && (
                <ReportCardModal
                    student={selectedReportStudent}
                    onClose={() => setSelectedReportStudent(null)}
                />
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
                return <AdminDashboardHome students={students} teachers={teachers} onNavigateDefaulters={() => setActiveView('defaulters')} />;
            case 'students':
                return <StudentManagement />;
            case 'teachers':
                return <TeacherManagement />;
            case 'defaulters':
                return <DefaultersList students={students} roleTitle="Institutional Defaulters List" />;
            case 'reports':
                return <AdminDashboardHome students={students} teachers={teachers} onNavigateDefaulters={() => setActiveView('defaulters')} />;
            default:
                return <AdminDashboardHome students={students} teachers={teachers} onNavigateDefaulters={() => setActiveView('defaulters')} />;
        }
    };

    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            {renderContent()}
        </Layout>
    );
};

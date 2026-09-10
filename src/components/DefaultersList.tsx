import React, { useState, useMemo } from 'react';
import { type Student } from '../types';
import { calculateAttendanceStats } from '../services/attendanceUtils';
import { exportDefaultersToCsv } from '../services/csvUtils';
import { AlertTriangleIcon } from './icons';

interface DefaultersListProps {
  students: Student[];
  availableClasses?: string[];
  roleTitle?: string;
}

export const DefaultersList: React.FC<DefaultersListProps> = ({
  students,
  availableClasses,
  roleTitle = 'Defaulters Overview',
}) => {
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifiedStudents, setNotifiedStudents] = useState<{ [id: string]: boolean }>({});

  const classes = useMemo(() => {
    if (availableClasses && availableClasses.length > 0) return availableClasses;
    return [...new Set(students.map(s => s.class))].sort();
  }, [students, availableClasses]);

  // Filter students based on class, then calculate stats
  const defaulterData = useMemo(() => {
    return students
      .filter(student => selectedClass === 'ALL' || student.class === selectedClass)
      .map(student => ({
        student,
        stats: calculateAttendanceStats(student, 75),
      }))
      .filter(item => item.stats.isDefaulter);
  }, [students, selectedClass]);

  const filteredDefaulters = useMemo(() => {
    if (!searchQuery.trim()) return defaulterData;
    const q = searchQuery.toLowerCase();
    return defaulterData.filter(
      item =>
        item.student.name.toLowerCase().includes(q) ||
        item.student.studentId.toLowerCase().includes(q) ||
        item.student.email.toLowerCase().includes(q)
    );
  }, [defaulterData, searchQuery]);

  const handleSendNotice = (studentName: string, studentId: string, email: string) => {
    setNotifiedStudents(prev => ({ ...prev, [studentId]: true }));
    alert(`📢 Notice Sent!\n\nOfficial low-attendance warning letter dispatched to:\nStudent: ${studentName}\nEmail: ${email}\nThreshold: < 75%`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slideInUp">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-100 text-rose-600">
              <AlertTriangleIcon className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 bg-clip-text text-transparent">
              Attendance Defaulters List
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Students with overall attendance below the required 75% institutional threshold.
          </p>
        </div>

        {/* Warning Banner Badge */}
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600">Action Required</div>
            <div className="text-sm font-semibold text-rose-900">
              {defaulterData.length} {defaulterData.length === 1 ? 'Student' : 'Students'} At Risk
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center animate-slideInLeft">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Filter Class:</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="p-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-sm w-full sm:w-44"
          >
            <option value="ALL">All Classes ({classes.join(', ')})</option>
            {classes.map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search defaulter by name or ID..."
            className="w-full sm:w-64 p-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            type="button"
            onClick={() => exportDefaultersToCsv(students)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Defaulters Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-slideInUp">
        {filteredDefaulters.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">No Defaulters Found!</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              {selectedClass === 'ALL' 
                ? 'All enrolled students currently meet or exceed the 75% attendance threshold.'
                : `All students in Class ${selectedClass} meet or exceed the 75% attendance threshold.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sessions Attended</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Current Attendance</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Target Recovery</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredDefaulters.map(({ student, stats }) => {
                  const isNotified = notifiedStudents[student.id];

                  return (
                    <tr key={student.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm shadow-inner">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{student.name}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: {student.studentId}</div>
                            <div className="text-xs text-slate-400">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                          {student.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-700">
                          {stats.presentDays + stats.lateDays} / {stats.totalDays} days
                        </div>
                        <div className="text-xs text-rose-600 font-semibold">
                          {stats.absentDays} absences
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-rose-600 h-2.5 rounded-full"
                              style={{ width: `${Math.min(100, stats.percentage)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-rose-600">
                            {stats.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                          Needs +{stats.shortfallDays} classes
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleSendNotice(student.name, student.id, student.email)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
                            isNotified
                              ? 'bg-slate-100 text-slate-600 border border-slate-200 cursor-default'
                              : 'bg-rose-600 hover:bg-rose-700 text-white hover:scale-105 active:scale-95'
                          }`}
                        >
                          {isNotified ? '✓ Notice Sent' : '✉️ Send Notice'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

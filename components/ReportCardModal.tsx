import React from 'react';
import { type Student } from '../types';
import { generateStudentAcademicReport } from '../services/gradeUtils';
import { PrinterIcon, XIcon, AcademicCapIcon } from './icons';

interface ReportCardModalProps {
  student: Student | null;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ student, onClose }) => {
  if (!student) return null;

  const report = generateStudentAcademicReport(student);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-start overflow-y-auto p-4 sm:p-6 md:p-8 animate-fadeIn">
      <div className="relative w-full max-w-4xl my-auto">
        {/* Top Control Bar - Hidden on print */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 rounded-t-2xl shadow-xl flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Official Student Report Card</h2>
              <p className="text-xs text-slate-300">Generated for {student.name} ({student.studentId})</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105 active:scale-95"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Document */}
        <div
          id="printable-report-card"
          className="bg-white text-slate-900 p-8 sm:p-12 rounded-b-2xl shadow-2xl border-4 border-double border-slate-300 relative overflow-hidden"
        >
          {/* Decorative Corner Borders for authentic academic document look */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-indigo-900 pointer-events-none"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-indigo-900 pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-indigo-900 pointer-events-none"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-indigo-900 pointer-events-none"></div>

          {/* Academic Header */}
          <div className="text-center pb-6 mb-6 border-b-2 border-slate-900">
            <div className="flex justify-center items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-800 to-purple-900 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
                🎓
              </div>
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wider uppercase text-slate-900">
                  Academia International Academy
                </h1>
                <p className="text-xs tracking-widest uppercase font-semibold text-slate-600">
                  Board of Secondary & Higher Academic Education • Reg. No. EDU-2026-992
                </p>
              </div>
            </div>
            <div className="mt-4 inline-block bg-slate-900 text-white px-6 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">
              Official Academic Transcript & Semester Report Card
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 mb-6 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Student Name</span>
                <span className="font-bold text-base text-slate-900">{student.name}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Student / Roll ID</span>
                <span className="font-bold text-base text-indigo-800 font-mono">{student.studentId}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Class & Section</span>
                <span className="font-bold text-base text-slate-900">{student.class}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Academic Session</span>
                <span className="font-bold text-base text-slate-900">{report.academicYear}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</span>
                <span className="font-medium text-slate-700">{student.email}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Date of Issue</span>
                <span className="font-medium text-slate-700">{report.issueDate}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Curriculum Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Enrolled / Good Standing
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Attendance Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  report.attendanceStats.isDefaulter 
                    ? 'bg-rose-100 text-rose-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {report.attendanceStats.percentage}% ({report.attendanceStats.isDefaulter ? 'Defaulter' : 'Eligible'})
                </span>
              </div>
            </div>
          </div>

          {/* Academic Performance Table */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <span>📚</span> Subject Marks & Grade Breakdown
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-300 text-sm">
                <thead className="bg-slate-100 font-semibold text-slate-700 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-center">Period / Exam</th>
                    <th className="px-4 py-3 text-center">Max Marks</th>
                    <th className="px-4 py-3 text-center">Marks Scored</th>
                    <th className="px-4 py-3 text-center">Percentage</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-center">Grade Point</th>
                    <th className="px-4 py-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {report.subjectGrades.length > 0 ? (
                    report.subjectGrades.map((sub, idx) => (
                      <tr key={`${sub.subject}-${sub.month}-${idx}`} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{sub.subject}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600 font-medium">{sub.month} Term</td>
                        <td className="px-4 py-2.5 text-center text-slate-600 font-mono">{sub.maxMarks}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-slate-900 font-mono">{sub.marks}</td>
                        <td className="px-4 py-2.5 text-center font-semibold text-slate-800 font-mono">{sub.percentage}%</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs ${
                            sub.grade.startsWith('A') ? 'bg-indigo-100 text-indigo-900 font-black' :
                            sub.grade.startsWith('B') ? 'bg-blue-100 text-blue-900' :
                            sub.grade.startsWith('C') ? 'bg-amber-100 text-amber-900' :
                            'bg-rose-100 text-rose-900'
                          }`}>
                            {sub.grade}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center font-mono font-semibold text-slate-700">{sub.gpa.toFixed(1)}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sub.passed ? 'PASSED' : 'REMEDIAL'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500 italic">
                        No subject evaluation marks recorded for this academic session yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                {report.subjectGrades.length > 0 && (
                  <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right uppercase tracking-wider text-xs">Total / Aggregate:</td>
                      <td className="px-4 py-3 text-center font-mono">{report.totalMaxMarks}</td>
                      <td className="px-4 py-3 text-center font-mono text-indigo-900">{report.totalMarksObtained}</td>
                      <td className="px-4 py-3 text-center font-mono text-indigo-900">{report.aggregatePercentage}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded bg-indigo-700 text-white text-xs font-black">
                          {report.overallGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono">{report.cumulativeGpa.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-emerald-700 text-xs">QUALIFIED</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Academic Standing & Attendance Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Cumulative GPA & Standing
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-indigo-900">{report.cumulativeGpa.toFixed(2)}</span>
                <span className="text-xs text-slate-500 font-medium">/ 4.00</span>
              </div>
              <p className="text-xs font-bold text-slate-700 mt-1">{report.academicStanding}</p>
            </div>

            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Aggregate Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">{report.aggregatePercentage}%</span>
                <span className="text-xs text-slate-500 font-medium">({report.totalMarksObtained} / {report.totalMaxMarks})</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">Grade: {report.overallGrade}</p>
            </div>

            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Attendance Standing
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono ${
                  report.attendanceStats.isDefaulter ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {report.attendanceStats.percentage}%
                </span>
                <span className="text-xs text-slate-500 font-medium">({report.attendanceStats.presentCount}/{report.attendanceStats.totalSessions} sessions)</span>
              </div>
              <p className={`text-xs font-bold mt-1 ${
                report.attendanceStats.isDefaulter ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {report.attendanceStats.isDefaulter ? '⚠️ Defaulter Shortfall' : '✓ Full Exam Clearance'}
              </p>
            </div>
          </div>

          {/* Conduct & Teacher Observations */}
          <div className="border border-slate-300 rounded-xl p-4 mb-6 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Faculty & Academic Advisor Observations:
            </h4>
            <p className="text-sm italic text-slate-800 leading-relaxed">
              &ldquo;{report.conductRemark}&rdquo;
            </p>
          </div>

          {/* Grading Scale Legend (Compact) */}
          <div className="border-t border-slate-200 pt-4 mb-8 text-[11px] text-slate-600">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-800 uppercase">Grading Scale:</span>
              <span><strong>A+</strong> (90-100% | 4.0)</span>
              <span><strong>A</strong> (80-89% | 3.7)</span>
              <span><strong>B+</strong> (70-79% | 3.3)</span>
              <span><strong>B</strong> (60-69% | 3.0)</span>
              <span><strong>C</strong> (50-59% | 2.0)</span>
              <span><strong>D</strong> (40-49% | 1.0)</span>
              <span><strong>F</strong> (&lt;40% | 0.0)</span>
            </div>
          </div>

          {/* Signatures & Seal Area */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="h-12 flex items-end justify-center pb-1">
                <span className="font-serif italic text-sm text-indigo-900 font-semibold tracking-wider">Prof. S. Jenkins</span>
              </div>
              <div className="border-t border-slate-800 pt-1">
                <p className="text-xs font-bold uppercase text-slate-800">Class Teacher</p>
                <p className="text-[10px] text-slate-500">Department of Academics</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-900/60 flex flex-col items-center justify-center text-center p-1 transform rotate-[-6deg]">
                <span className="text-[8px] font-black uppercase text-indigo-900 tracking-tighter">OFFICIAL SEAL</span>
                <span className="text-xs">🏛️</span>
                <span className="text-[7px] font-bold text-indigo-900 uppercase">ACADEMIA</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">Institutional Seal</p>
            </div>

            <div>
              <div className="h-12 flex items-end justify-center pb-1">
                <span className="font-serif italic text-sm text-indigo-900 font-semibold tracking-wider">Dr. R. Harrison</span>
              </div>
              <div className="border-t border-slate-800 pt-1">
                <p className="text-xs font-bold uppercase text-slate-800">Registrar & Principal</p>
                <p className="text-[10px] text-slate-500">Academia Board of Governors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

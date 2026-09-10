import { type Student, type MarkRecord } from '../types';
import { calculateAttendanceStats, type AttendanceStats } from './attendanceUtils';

export interface SubjectGrade {
  subject: string;
  month: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  remarks: string;
  passed: boolean;
}

export interface StudentAcademicReport {
  student: Student;
  subjectGrades: SubjectGrade[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  aggregatePercentage: number;
  cumulativeGpa: number;
  overallGrade: string;
  academicStanding: string;
  attendanceStats: AttendanceStats;
  conductRemark: string;
  issueDate: string;
  academicYear: string;
}

/**
 * Returns letter grade, GPA point, and verbal remarks for a percentage score out of 100.
 */
export function getGradeDetails(marks: number, maxMarks: number = 100): {
  percentage: number;
  grade: string;
  gpa: number;
  remarks: string;
  passed: boolean;
} {
  const percentage = maxMarks > 0 ? Math.round((marks / maxMarks) * 100 * 10) / 10 : 0;

  if (percentage >= 90) {
    return { percentage, grade: 'A+', gpa: 4.0, remarks: 'Outstanding Performance', passed: true };
  } else if (percentage >= 80) {
    return { percentage, grade: 'A', gpa: 3.7, remarks: 'Excellent Understanding', passed: true };
  } else if (percentage >= 70) {
    return { percentage, grade: 'B+', gpa: 3.3, remarks: 'Very Good Progress', passed: true };
  } else if (percentage >= 60) {
    return { percentage, grade: 'B', gpa: 3.0, remarks: 'Good Competency', passed: true };
  } else if (percentage >= 50) {
    return { percentage, grade: 'C', gpa: 2.0, remarks: 'Satisfactory Performance', passed: true };
  } else if (percentage >= 40) {
    return { percentage, grade: 'D', gpa: 1.0, remarks: 'Marginal Pass', passed: true };
  } else {
    return { percentage, grade: 'F', gpa: 0.0, remarks: 'Needs Improvement / Remedial', passed: false };
  }
}

/**
 * Generates an institutional academic report for any student.
 */
export function generateStudentAcademicReport(
  student: Student,
  academicYear: string = '2025-2026'
): StudentAcademicReport {
  const attendanceStats = calculateAttendanceStats(student, 75);
  
  const subjectGrades: SubjectGrade[] = (student.marks || []).map((m: MarkRecord) => {
    const maxMarks = 100;
    const gradeInfo = getGradeDetails(m.marks, maxMarks);
    return {
      subject: m.subject,
      month: m.month,
      marks: m.marks,
      maxMarks,
      percentage: gradeInfo.percentage,
      grade: gradeInfo.grade,
      gpa: gradeInfo.gpa,
      remarks: gradeInfo.remarks,
      passed: gradeInfo.passed,
    };
  });

  const totalMarksObtained = subjectGrades.reduce((sum, item) => sum + item.marks, 0);
  const totalMaxMarks = subjectGrades.length * 100;
  const aggregatePercentage = totalMaxMarks > 0
    ? Math.round((totalMarksObtained / totalMaxMarks) * 100 * 10) / 10
    : 0;

  const cumulativeGpa = subjectGrades.length > 0
    ? Math.round((subjectGrades.reduce((sum, item) => sum + item.gpa, 0) / subjectGrades.length) * 100) / 100
    : 0;

  const overallGradeInfo = getGradeDetails(aggregatePercentage, 100);

  // Determine Academic Standing Distinction
  let academicStanding = 'Satisfactory';
  if (aggregatePercentage >= 85) {
    academicStanding = 'First Class with Distinction (Honors)';
  } else if (aggregatePercentage >= 70) {
    academicStanding = 'First Class';
  } else if (aggregatePercentage >= 50) {
    academicStanding = 'Second Class';
  } else if (subjectGrades.length > 0) {
    academicStanding = 'Academic Probation / Remedial Required';
  } else {
    academicStanding = 'Awaiting Examination Records';
  }

  // Generate Personalized Teacher / Institutional Conduct Remark
  let conductRemark = '';
  if (aggregatePercentage >= 80 && !attendanceStats.isDefaulter) {
    conductRemark = 'Exemplary academic achievement paired with consistent attendance. Demonstrates high leadership and intellectual curiosity.';
  } else if (aggregatePercentage >= 80 && attendanceStats.isDefaulter) {
    conductRemark = 'Shows excellent academic potential and test performance, but must improve attendance rate to satisfy graduation requirements.';
  } else if (aggregatePercentage >= 55 && !attendanceStats.isDefaulter) {
    conductRemark = 'Regular and punctual in attendance. Shows steady academic effort; continuous practice in core topics will yield top marks.';
  } else if (attendanceStats.isDefaulter) {
    conductRemark = 'Urgent attention required regarding lecture attendance and tutorial participation. Academic counseling scheduled.';
  } else {
    conductRemark = 'Consistent effort observed. Encouraged to participate more actively in classroom discussions and laboratory assignments.';
  }

  const today = new Date();
  const issueDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    student,
    subjectGrades,
    totalMarksObtained,
    totalMaxMarks,
    aggregatePercentage,
    cumulativeGpa,
    overallGrade: overallGradeInfo.grade,
    academicStanding,
    attendanceStats,
    conductRemark,
    issueDate,
    academicYear,
  };
}

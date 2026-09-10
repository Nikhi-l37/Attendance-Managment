import { type Student } from '../types';
import { calculateAttendanceStats } from './attendanceUtils';

/**
 * Escapes a cell value for CSV formatting.
 */
const escapeCsvCell = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Triggers a browser download of a CSV file.
 */
export const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  const csvContent = rows.map(row => row.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports class attendance to a formatted CSV file.
 */
export const exportAttendanceToCsv = (students: Student[], className: string, periodOrDate: string) => {
  const headers = ['Student ID', 'Full Name', 'Class', 'Email', 'Status for Selected Period', 'Overall Attendance %'];
  const rows: (string | number)[][] = [headers];

  students.forEach(s => {
    const rec = s.attendance.find(a => a.date === periodOrDate || a.month === periodOrDate);
    const stats = calculateAttendanceStats(s);
    rows.push([
      s.studentId,
      s.name,
      s.class,
      s.email,
      rec ? rec.status : 'Not Marked',
      `${stats.percentage}%`,
    ]);
  });

  const safePeriod = periodOrDate.replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadCsv(`attendance_class_${className}_${safePeriod}.csv`, rows);
};

/**
 * Exports student marks to a formatted CSV file.
 */
export const exportMarksToCsv = (students: Student[], className: string, month: string, subject?: string) => {
  const headers = ['Student ID', 'Full Name', 'Class', 'Month', 'Subject', 'Marks Scored'];
  const rows: (string | number)[][] = [headers];

  students.forEach(s => {
    const relevantMarks = s.marks.filter(m => {
      const matchMonth = m.month.toLowerCase() === month.toLowerCase();
      const matchSubject = subject ? m.subject.toLowerCase() === subject.toLowerCase() : true;
      return matchMonth && matchSubject;
    });

    if (relevantMarks.length === 0) {
      rows.push([s.studentId, s.name, s.class, month, subject || 'All', 'N/A']);
    } else {
      relevantMarks.forEach(m => {
        rows.push([s.studentId, s.name, s.class, m.month, m.subject, m.marks]);
      });
    }
  });

  const safeSubject = (subject || 'all').toLowerCase().replace(/\s+/g, '_');
  downloadCsv(`marks_class_${className}_${month}_${safeSubject}.csv`, rows);
};

/**
 * Exports defaulters (< 75% attendance) to CSV.
 */
export const exportDefaultersToCsv = (students: Student[]) => {
  const headers = [
    'Student ID',
    'Full Name',
    'Class',
    'Email',
    'Total Sessions',
    'Attended Days',
    'Absences',
    'Attendance %',
    'Consecutive Classes Needed to Reach 75%',
  ];
  const rows: (string | number)[][] = [headers];

  students.forEach(s => {
    const stats = calculateAttendanceStats(s, 75);
    if (stats.isDefaulter) {
      rows.push([
        s.studentId,
        s.name,
        s.class,
        s.email,
        stats.totalDays,
        stats.presentDays + stats.lateDays,
        stats.absentDays,
        `${stats.percentage}%`,
        stats.shortfallDays,
      ]);
    }
  });

  downloadCsv(`attendance_defaulters_${new Date().toISOString().split('T')[0]}.csv`, rows);
};

/**
 * Parses a student roster CSV string into structured student objects.
 * Expected columns: Name, Email, Student ID, Class
 */
export const parseStudentsCsv = (
  csvText: string
): { valid: { name: string; email: string; studentId: string; class: string }[]; errors: string[] } => {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const errors: string[] = [];
  const valid: { name: string; email: string; studentId: string; class: string }[] = [];

  if (lines.length < 2) {
    return { valid, errors: ['CSV file appears empty or missing data rows.'] };
  }

  // Parse header row
  const headerCells = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const nameIdx = headerCells.findIndex(h => h.includes('name'));
  const emailIdx = headerCells.findIndex(h => h.includes('email'));
  const idIdx = headerCells.findIndex(h => h.includes('id'));
  const classIdx = headerCells.findIndex(h => h.includes('class'));

  if (nameIdx === -1 || emailIdx === -1 || idIdx === -1 || classIdx === -1) {
    return {
      valid,
      errors: [
        'Invalid CSV headers. Expected headers must include: Name, Email, Student ID, Class (e.g. "Name,Email,StudentID,Class")',
      ],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;

    // Simple comma separation handling quotes
    const cells = rawLine
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map(c => c.trim().replace(/^"|"$/g, '').trim());

    const name = cells[nameIdx];
    const email = cells[emailIdx];
    const studentId = cells[idIdx];
    const className = cells[classIdx];

    if (!name || !email || !studentId || !className) {
      errors.push(`Row ${i + 1}: Missing required fields (Name, Email, StudentID, or Class).`);
      continue;
    }

    if (!email.includes('@')) {
      errors.push(`Row ${i + 1}: Invalid email address "${email}".`);
      continue;
    }

    valid.push({
      name,
      email,
      studentId,
      class: className,
    });
  }

  return { valid, errors };
};

/**
 * Downloads a sample student CSV template for users to fill in.
 */
export const downloadSampleStudentCsv = () => {
  const templateRows = [
    ['Full Name', 'Email', 'Student ID', 'Class'],
    ['Lucas Scott', 'lucas.scott@example.com', 'STU-1010', '10A'],
    ['Chloe Bennett', 'chloe.bennett@example.com', 'STU-1011', '10B'],
    ['Daniel Kim', 'daniel.kim@example.com', 'STU-1012', '11A'],
  ];
  downloadCsv('sample_students_template.csv', templateRows);
};

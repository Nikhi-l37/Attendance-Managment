import { Student } from '../types';

export interface StudentAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
  isDefaulter: boolean;
  shortfallDays: number;
}

export const calculateAttendanceStats = (student: Student, threshold: number = 75): StudentAttendanceStats => {
  const records = student.attendance || [];
  const totalDays = records.length;
  const presentDays = records.filter(a => a.status === 'Present').length;
  const lateDays = records.filter(a => a.status === 'Late').length;
  const absentDays = records.filter(a => a.status === 'Absent').length;

  const effectivePresent = presentDays + lateDays;
  const percentage = totalDays > 0 ? Math.round((effectivePresent / totalDays) * 100) : 100;
  const isDefaulter = totalDays > 0 && percentage < threshold;

  let shortfallDays = 0;
  if (isDefaulter) {
    const t = threshold / 100;
    const numerator = t * totalDays - effectivePresent;
    const denominator = 1 - t;
    shortfallDays = Math.max(1, Math.ceil(numerator / denominator));
  }

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    percentage,
    isDefaulter,
    shortfallDays,
  };
};

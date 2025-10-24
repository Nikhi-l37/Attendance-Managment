
export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AttendanceRecord {
  month: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface MarkRecord {
  month: string;
  subject: string;
  marks: number;
}

export interface Student extends User {
  studentId: string;
  class: string;
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
}

export interface Teacher extends User {
  teacherId: string;
  department: string;
  classes: string[];
}

export type AppUser = User | Student | Teacher;

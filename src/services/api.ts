import { Role, type Student, type Teacher, type User, type AppUser } from '../types';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  ((import.meta as any).env?.DEV ? 'http://localhost:5000/api' : '/api');

/**
 * Pure Cloud API Service communicating directly with MongoDB Atlas backend.
 */
export const api = {
  adminSignup: async (name: string, email: string): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign up admin');
    }
    return data;
  },

  login: async (email: string, role: Role): Promise<AppUser | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('MongoDB Atlas Login failed:', err);
      return null;
    }
  },

  getStudents: async (): Promise<Student[]> => {
    const res = await fetch(`${API_BASE_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students from MongoDB Atlas');
    return await res.json();
  },

  getTeachers: async (): Promise<Teacher[]> => {
    const res = await fetch(`${API_BASE_URL}/teachers`);
    if (!res.ok) throw new Error('Failed to fetch teachers from MongoDB Atlas');
    return await res.json();
  },

  getStudentById: async (id: string): Promise<Student | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getStudentsByClass: async (className: string): Promise<Student[]> => {
    const res = await fetch(`${API_BASE_URL}/students?class=${encodeURIComponent(className)}`);
    if (!res.ok) throw new Error('Failed to fetch class students from MongoDB Atlas');
    return await res.json();
  },

  addStudent: async (studentData: Omit<Student, 'id' | 'role' | 'attendance' | 'marks'>): Promise<Student> => {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create student in MongoDB Atlas');
    }
    return data;
  },

  addMultipleStudents: async (
    studentsData: Omit<Student, 'id' | 'role' | 'attendance' | 'marks'>[]
  ): Promise<{ added: Student[]; skipped: string[] }> => {
    const res = await fetch(`${API_BASE_URL}/students/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: studentsData }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to bulk import students to MongoDB Atlas');
    }
    return data;
  },

  deleteStudent: async (studentId: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  addTeacher: async (teacherData: Omit<Teacher, 'id' | 'role'>): Promise<Teacher> => {
    const res = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create teacher in MongoDB Atlas');
    }
    return data;
  },

  deleteTeacher: async (teacherId: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}/teachers/${teacherId}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  updateStudentAttendance: async (
    studentId: string,
    dateOrMonth: string,
    status: 'Present' | 'Absent' | 'Late',
    dateValue?: string
  ): Promise<boolean> => {
    const isDate = Boolean(dateValue || dateOrMonth.includes('-'));
    const targetDate = isDate ? (dateValue || dateOrMonth) : undefined;
    const targetMonth = isDate ? new Date(targetDate!).toLocaleString('en-US', { month: 'short' }) : dateOrMonth;

    const res = await fetch(`${API_BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        date: targetDate,
        month: targetMonth,
        status,
      }),
    });
    return res.ok;
  },

  markAllClassAttendance: async (
    className: string,
    dateOrMonth: string,
    status: 'Present' | 'Absent' | 'Late',
    dateValue?: string
  ): Promise<boolean> => {
    const targetDate = dateValue || dateOrMonth;
    const res = await fetch(`${API_BASE_URL}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className,
        date: targetDate,
        status,
      }),
    });
    return res.ok;
  },

  updateStudentMarks: async (
    studentId: string,
    month: string,
    subject: string,
    marks: number
  ): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}/marks/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        month,
        subject,
        marks,
      }),
    });
    return res.ok;
  },

  resetToDemoData: async (): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/auth/reset`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error('Failed to reset MongoDB Atlas database');
    }
  },
};

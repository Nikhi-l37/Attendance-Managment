
import { Role, type Student, type Teacher, type User, type AppUser } from '../types';

const students: Student[] = [
  { id: 's1', studentId: 'S001', name: 'Alice Johnson', email: 'alice@example.com', role: Role.STUDENT, class: '10A', 
    attendance: [
        { month: 'Jan', status: 'Present' }, { month: 'Feb', status: 'Present' }, { month: 'Mar', status: 'Absent' }, { month: 'Apr', status: 'Present' }
    ], 
    marks: [
        { month: 'Jan', subject: 'Math', marks: 85 }, { month: 'Feb', subject: 'Math', marks: 90 }, { month: 'Mar', subject: 'Math', marks: 78 }, { month: 'Apr', subject: 'Math', marks: 92 },
        { month: 'Jan', subject: 'Science', marks: 92 }, { month: 'Feb', subject: 'Science', marks: 88 }, { month: 'Mar', subject: 'Science', marks: 85 }, { month: 'Apr', subject: 'Science', marks: 95 }
    ] },
  { id: 's2', studentId: 'S002', name: 'Bob Williams', email: 'bob@example.com', role: Role.STUDENT, class: '10A', 
    attendance: [
        { month: 'Jan', status: 'Present' }, { month: 'Feb', status: 'Late' }, { month: 'Mar', status: 'Present' }, { month: 'Apr', status: 'Present' }
    ], 
    marks: [
        { month: 'Jan', subject: 'Math', marks: 76 }, { month: 'Feb', subject: 'Math', marks: 80 }, { month: 'Mar', subject: 'Math', marks: 82 }, { month: 'Apr', subject: 'Math', marks: 79 },
        { month: 'Jan', subject: 'Science', marks: 81 }, { month: 'Feb', subject: 'Science', marks: 77 }, { month: 'Mar', subject: 'Science', marks: 85 }, { month: 'Apr', subject: 'Science', marks: 83 }
    ] },
];

const teachers: Teacher[] = [
  { id: 't1', teacherId: 'T001', name: 'Charles Davis', email: 'charles@example.com', role: Role.TEACHER, department: 'Science', classes: ['10A', '10B'] },
  { id: 't2', teacherId: 'T002', name: 'Diana Miller', email: 'diana@example.com', role: Role.TEACHER, department: 'Math', classes: ['10A', '11A'] },
];

const admins: User[] = [
  { id: 'a1', name: 'Admin User', email: 'admin@example.com', role: Role.ADMIN },
];

const allUsers: AppUser[] = [...students, ...teachers, ...admins];

// Mock API functions
export const api = {
  login: async (email: string, role: Role): Promise<AppUser | null> => {
    console.log(`Attempting login for ${email} with role ${role}`);
    const user = allUsers.find(u => u.email === email && u.role === role);
    return new Promise((resolve) => setTimeout(() => resolve(user || null), 500));
  },
  getStudents: async (): Promise<Student[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(students), 500));
  },
  getTeachers: async (): Promise<Teacher[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(teachers), 500));
  },
  getStudentById: async (id: string): Promise<Student | null> => {
     const student = students.find(s => s.id === id) || null;
     return new Promise((resolve) => setTimeout(() => resolve(student), 500));
  },
  getStudentsByClass: async (className: string): Promise<Student[]> => {
    const classStudents = students.filter(s => s.class === className);
    return new Promise((resolve) => setTimeout(() => resolve(classStudents), 500));
  },
  updateStudentAttendance: async (studentId: string, month: string, status: 'Present' | 'Absent' | 'Late'): Promise<boolean> => {
    const student = students.find(s => s.id === studentId);
    if(student) {
        const record = student.attendance.find(a => a.month === month);
        if(record) {
            record.status = status;
        } else {
            student.attendance.push({month, status});
        }
    }
    return new Promise((resolve) => setTimeout(() => resolve(!!student), 500));
  },
  updateStudentMarks: async (studentId: string, month: string, subject: string, marks: number): Promise<boolean> => {
      const student = students.find(s => s.id === studentId);
      if(student) {
        const record = student.marks.find(m => m.month === month && m.subject === subject);
        if(record){
            record.marks = marks;
        } else {
            student.marks.push({month, subject, marks});
        }
      }
      return new Promise((resolve) => setTimeout(() => resolve(!!student), 500));
  }
};

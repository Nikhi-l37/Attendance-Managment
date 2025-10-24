
import { Role, type Student, type Teacher, type User, type AppUser } from '../types';

// In-memory database with localStorage persistence
interface DB {
  students: Student[];
  teachers: Teacher[];
  admins: User[];
}

const DB_KEY = 'academia-system-db';

const getDb = (): DB => {
  const dbJson = localStorage.getItem(DB_KEY);
  if (dbJson) {
    try {
      const parsed = JSON.parse(dbJson);
      // Basic validation
      if (parsed.students && parsed.teachers && parsed.admins) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse DB from localStorage", e);
    }
  }
  // Initialize with an empty DB if nothing is in localStorage or if parsing fails
  const initialDb: DB = {
    students: [],
    teachers: [],
    admins: [],
  };
  localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  return initialDb;
};

const saveDb = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Mock API functions
export const api = {
  adminSignup: async (name: string, email: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            if (db.admins.some(a => a.email === email) || db.teachers.some(t => t.email === email) || db.students.some(s => s.email === email)) {
                reject(new Error('An account with this email already exists.'));
                return;
            }
            const newAdmin: User = {
                id: `a${Date.now()}`,
                name,
                email,
                role: Role.ADMIN,
            };
            db.admins.push(newAdmin);
            saveDb(db);
            resolve(newAdmin);
        }, 500);
    });
  },

  login: async (email: string, role: Role): Promise<AppUser | null> => {
    return new Promise((resolve) => {
        const db = getDb();
        let user: AppUser | undefined;
        switch (role) {
            case Role.ADMIN:
                user = db.admins.find(u => u.email === email);
                break;
            case Role.TEACHER:
                user = db.teachers.find(u => u.email === email);
                break;
            case Role.STUDENT:
                user = db.students.find(u => u.email === email);
                break;
        }
        setTimeout(() => resolve(user || null), 500);
    });
  },

  getStudents: async (): Promise<Student[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(getDb().students), 500));
  },

  getTeachers: async (): Promise<Teacher[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(getDb().teachers), 500));
  },

  getStudentById: async (id: string): Promise<Student | null> => {
     const student = getDb().students.find(s => s.id === id) || null;
     return new Promise((resolve) => setTimeout(() => resolve(student), 500));
  },

  getStudentsByClass: async (className: string): Promise<Student[]> => {
    const classStudents = getDb().students.filter(s => s.class === className);
    return new Promise((resolve) => setTimeout(() => resolve(classStudents), 500));
  },

  addStudent: async (studentData: Omit<Student, 'id' | 'role' | 'attendance' | 'marks'>): Promise<Student> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const db = getDb();
              if (db.students.some(s => s.email === studentData.email || s.studentId === studentData.studentId)) {
                  reject(new Error('Student with this email or ID already exists.'));
                  return;
              }
              const newStudent: Student = {
                  ...studentData,
                  id: `s${Date.now()}`,
                  role: Role.STUDENT,
                  attendance: [],
                  marks: [],
              };
              db.students.push(newStudent);
              saveDb(db);
              resolve(newStudent);
          }, 500);
      });
  },

  deleteStudent: async (studentId: string): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const db = getDb();
              const initialLength = db.students.length;
              db.students = db.students.filter(s => s.id !== studentId);
              const success = db.students.length < initialLength;
              if (success) saveDb(db);
              resolve(success);
          }, 500);
      });
  },

  addTeacher: async (teacherData: Omit<Teacher, 'id' | 'role'>): Promise<Teacher> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const db = getDb();
               if (db.teachers.some(t => t.email === teacherData.email || t.teacherId === teacherData.teacherId)) {
                  reject(new Error('Teacher with this email or ID already exists.'));
                  return;
              }
              const newTeacher: Teacher = {
                  ...teacherData,
                  id: `t${Date.now()}`,
                  role: Role.TEACHER,
              };
              db.teachers.push(newTeacher);
              saveDb(db);
              resolve(newTeacher);
          }, 500);
      });
  },

  deleteTeacher: async (teacherId: string): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const db = getDb();
              const initialLength = db.teachers.length;
              db.teachers = db.teachers.filter(t => t.id !== teacherId);
              const success = db.teachers.length < initialLength;
              if (success) saveDb(db);
              resolve(success);
          }, 500);
      });
  },

  updateStudentAttendance: async (studentId: string, month: string, status: 'Present' | 'Absent' | 'Late'): Promise<boolean> => {
      const db = getDb();
      const student = db.students.find(s => s.id === studentId);
      if (student) {
          const record = student.attendance.find(a => a.month === month);
          if (record) {
              record.status = status;
          } else {
              student.attendance.push({ month, status });
          }
          saveDb(db);
      }
      return new Promise((resolve) => setTimeout(() => resolve(!!student), 200));
  },

  updateStudentMarks: async (studentId: string, month: string, subject: string, marks: number): Promise<boolean> => {
      const db = getDb();
      const student = db.students.find(s => s.id === studentId);
      if (student) {
          const record = student.marks.find(m => m.month === month && m.subject === subject);
          if (record) {
              record.marks = marks;
          } else {
              student.marks.push({ month, subject, marks });
          }
          saveDb(db);
      }
      return new Promise((resolve) => setTimeout(() => resolve(!!student), 200));
  }
};

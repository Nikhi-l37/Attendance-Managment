import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Teacher } from './models/Teacher.js';
import { Student } from './models/Student.js';

import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for Windows DNS SRV resolution error (ECONNREFUSED) with MongoDB Atlas SRV URIs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore if already set
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const initialAdmins = [
  {
    name: 'Dr. Robert Harrison',
    email: 'admin@academia.edu',
    role: 'ADMIN',
    password: 'password123',
  },
];

const initialTeachers = [
  {
    name: 'Prof. Sarah Jenkins',
    email: 'sarah.teacher@academia.edu',
    role: 'TEACHER',
    teacherId: 'TCH-101',
    department: 'Mathematics',
    classes: ['10A', '10B'],
  },
  {
    name: 'Dr. Marcus Vance',
    email: 'marcus.teacher@academia.edu',
    role: 'TEACHER',
    teacherId: 'TCH-102',
    department: 'Science & Physics',
    classes: ['10A', '11A'],
  },
  {
    name: 'Ms. Elena Rostova',
    email: 'elena.teacher@academia.edu',
    role: 'TEACHER',
    teacherId: 'TCH-103',
    department: 'English Literature',
    classes: ['10B', '11A'],
  },
];

const initialStudents = [
  {
    name: 'Alex Morgan',
    email: 'alex.student@academia.edu',
    role: 'STUDENT',
    studentId: 'STU-1001',
    class: '10A',
    attendance: [
      { date: '2026-09-01', month: 'Sep', status: 'Present' },
      { date: '2026-09-02', month: 'Sep', status: 'Present' },
      { date: '2026-09-03', month: 'Sep', status: 'Present' },
      { date: '2026-09-04', month: 'Sep', status: 'Late' },
      { date: '2026-09-05', month: 'Sep', status: 'Present' },
    ],
    marks: [
      { month: 'Jan', subject: 'Mathematics', marks: 92 },
      { month: 'Jan', subject: 'Physics', marks: 88 },
      { month: 'Jan', subject: 'English', marks: 85 },
      { month: 'Feb', subject: 'Mathematics', marks: 95 },
      { month: 'Feb', subject: 'Physics', marks: 91 },
      { month: 'Feb', subject: 'English', marks: 89 },
    ],
  },
  {
    name: 'Priya Sharma',
    email: 'priya.student@academia.edu',
    role: 'STUDENT',
    studentId: 'STU-1002',
    class: '10A',
    attendance: [
      { date: '2026-09-01', month: 'Sep', status: 'Present' },
      { date: '2026-09-02', month: 'Sep', status: 'Present' },
      { date: '2026-09-03', month: 'Sep', status: 'Present' },
      { date: '2026-09-04', month: 'Sep', status: 'Present' },
      { date: '2026-09-05', month: 'Sep', status: 'Present' },
    ],
    marks: [
      { month: 'Jan', subject: 'Mathematics', marks: 96 },
      { month: 'Jan', subject: 'Physics', marks: 94 },
      { month: 'Jan', subject: 'English', marks: 92 },
    ],
  },
  {
    name: 'Liam Chen',
    email: 'liam.student@academia.edu',
    role: 'STUDENT',
    studentId: 'STU-1003',
    class: '10A',
    attendance: [
      { date: '2026-09-01', month: 'Sep', status: 'Absent' },
      { date: '2026-09-02', month: 'Sep', status: 'Absent' },
      { date: '2026-09-03', month: 'Sep', status: 'Present' },
      { date: '2026-09-04', month: 'Sep', status: 'Absent' },
      { date: '2026-09-05', month: 'Sep', status: 'Late' },
    ],
    marks: [
      { month: 'Jan', subject: 'Mathematics', marks: 68 },
      { month: 'Jan', subject: 'Physics', marks: 71 },
      { month: 'Jan', subject: 'English', marks: 65 },
    ],
  },
  {
    name: 'Sophia Rodriguez',
    email: 'sophia.student@academia.edu',
    role: 'STUDENT',
    studentId: 'STU-1004',
    class: '10B',
    attendance: [
      { date: '2026-09-01', month: 'Sep', status: 'Present' },
      { date: '2026-09-02', month: 'Sep', status: 'Present' },
      { date: '2026-09-03', month: 'Sep', status: 'Present' },
      { date: '2026-09-04', month: 'Sep', status: 'Present' },
      { date: '2026-09-05', month: 'Sep', status: 'Present' },
    ],
    marks: [
      { month: 'Jan', subject: 'Mathematics', marks: 89 },
      { month: 'Jan', subject: 'Physics', marks: 90 },
      { month: 'Jan', subject: 'English', marks: 94 },
    ],
  },
  {
    name: 'Noah Taylor',
    email: 'noah.student@academia.edu',
    role: 'STUDENT',
    studentId: 'STU-1005',
    class: '10B',
    attendance: [
      { date: '2026-09-01', month: 'Sep', status: 'Present' },
      { date: '2026-09-02', month: 'Sep', status: 'Absent' },
      { date: '2026-09-03', month: 'Sep', status: 'Present' },
      { date: '2026-09-04', month: 'Sep', status: 'Present' },
      { date: '2026-09-05', month: 'Sep', status: 'Late' },
    ],
    marks: [
      { month: 'Jan', subject: 'Mathematics', marks: 81 },
      { month: 'Jan', subject: 'Physics', marks: 78 },
      { month: 'Jan', subject: 'English', marks: 84 },
    ],
  },
  {
    name: 'Emma Watson',
    email: 'emma.student@academia.edu',
    role: 'STUDENT',
    studentId: 'STU-1006',
    class: '11A',
    attendance: [
      { date: '2026-09-01', month: 'Sep', status: 'Present' },
      { date: '2026-09-02', month: 'Sep', status: 'Present' },
      { date: '2026-09-03', month: 'Sep', status: 'Present' },
      { date: '2026-09-04', month: 'Sep', status: 'Present' },
      { date: '2026-09-05', month: 'Sep', status: 'Present' },
    ],
    marks: [
      { month: 'Jan', subject: 'Mathematics', marks: 95 },
      { month: 'Jan', subject: 'Physics', marks: 97 },
      { month: 'Jan', subject: 'English', marks: 93 },
    ],
  },
  {
    name: 'Lucas Silva',
    email: 'lucas.student@academia.edu',
    role: 'STUDENT',
    studentId: 'STU-1007',
    class: '11A',
    attendance: [
      { date: '2026-09-01', month: 'Sep', status: 'Absent' },
      { date: '2026-09-02', month: 'Sep', status: 'Absent' },
      { date: '2026-09-03', month: 'Sep', status: 'Present' },
      { date: '2026-09-04', month: 'Sep', status: 'Absent' },
      { date: '2026-09-05', month: 'Sep', status: 'Absent' },
    ],
    marks: [
      { month: 'Jan', subject: 'Mathematics', marks: 62 },
      { month: 'Jan', subject: 'Physics', marks: 65 },
      { month: 'Jan', subject: 'English', marks: 70 },
    ],
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas.');

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});

    console.log('Seeding Admins...');
    await User.insertMany(initialAdmins);

    console.log('Seeding Teachers...');
    await Teacher.insertMany(initialTeachers);

    console.log('Seeding Students with Attendance & Marks...');
    await Student.insertMany(initialStudents);

    console.log('\n🎉 MongoDB Atlas Successfully Seeded!');
    console.log(`- Admins: ${initialAdmins.length}`);
    console.log(`- Teachers: ${initialTeachers.length}`);
    console.log(`- Students: ${initialStudents.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();

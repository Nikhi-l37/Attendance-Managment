import express from 'express';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';

const router = express.Router();

// Login or auto-provision endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Student collection first
    const student = await Student.findOne({ email: cleanEmail });
    if (student) {
      return res.json({
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        role: 'STUDENT',
        studentId: student.studentId,
        class: student.class,
      });
    }

    // 2. Check Teacher collection
    const teacher = await Teacher.findOne({ email: cleanEmail });
    if (teacher) {
      return res.json({
        id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email,
        role: 'TEACHER',
        teacherId: teacher.teacherId,
        department: teacher.department,
        classes: teacher.classes,
      });
    }

    // 3. Check User (e.g. Admin) collection
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      return res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }

    // 4. Auto-provision account in MongoDB Atlas based on requested role so new users can log in smoothly
    const targetRole = role ? role.toUpperCase() : 'STUDENT';
    const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart.replace(/\b\w/g, l => l.toUpperCase()) || 'New User';

    if (targetRole === 'ADMIN') {
      const newAdmin = new User({
        name: formattedName,
        email: cleanEmail,
        role: 'ADMIN',
      });
      await newAdmin.save();
      return res.json({
        id: newAdmin._id.toString(),
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      });
    } else if (targetRole === 'TEACHER') {
      const newTeacher = new Teacher({
        name: `Prof. ${formattedName}`,
        email: cleanEmail,
        role: 'TEACHER',
        teacherId: `TCH-${Date.now().toString().slice(-4)}`,
        department: 'Academics',
        classes: ['10A', '10B', '11A'],
      });
      await newTeacher.save();
      return res.json({
        id: newTeacher._id.toString(),
        name: newTeacher.name,
        email: newTeacher.email,
        role: newTeacher.role,
        teacherId: newTeacher.teacherId,
        department: newTeacher.department,
        classes: newTeacher.classes,
      });
    } else {
      // Default: Student
      const newStudent = new Student({
        name: formattedName,
        email: cleanEmail,
        role: 'STUDENT',
        studentId: `STU-${Date.now().toString().slice(-4)}`,
        class: '10A',
        attendance: [
          { date: new Date().toISOString().split('T')[0], month: new Date().toLocaleString('en-US', { month: 'short' }), status: 'Present' }
        ],
        marks: [
          { month: 'Jan', subject: 'Mathematics', marks: 85 },
          { month: 'Jan', subject: 'Physics', marks: 82 },
          { month: 'Jan', subject: 'English', marks: 88 },
        ],
      });
      await newStudent.save();
      return res.json({
        id: newStudent._id.toString(),
        name: newStudent.name,
        email: newStudent.email,
        role: newStudent.role,
        studentId: newStudent.studentId,
        class: newStudent.class,
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      role: 'ADMIN',
    });
    await newUser.save();
    res.status(201).json({
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all users
router.get('/users', async (req, res) => {
  try {
    const admins = await User.find();
    const teachers = await Teacher.find();
    const students = await Student.find();
    res.json([...admins, ...teachers, ...students]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /reset database endpoint
router.post('/reset', async (req, res) => {
  try {
    // Dynamic import to reseed
    const { exec } = await import('child_process');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const seedPath = path.join(__dirname, '..', 'seed.js');

    exec(`node "${seedPath}"`, (err, stdout, stderr) => {
      if (err) {
        console.error('Reset execution error:', err);
        return res.status(500).json({ error: 'Failed to reset database', details: err.message });
      }
      res.json({ message: 'MongoDB Atlas database successfully reset to default demo records!' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

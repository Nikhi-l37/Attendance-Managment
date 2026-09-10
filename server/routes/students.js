import express from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';

const router = express.Router();

// GET all students (optional ?class=10A)
router.get('/', async (req, res) => {
  try {
    const { class: className } = req.query;
    const filter = className ? { class: className } : {};
    const students = await Student.find(filter).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single student by MongoDB ID or studentId
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ studentId: id });
    }
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create single student
router.post('/', async (req, res) => {
  try {
    const { name, email, studentId, class: studentClass } = req.body;
    if (!name || !email || !studentId || !studentClass) {
      return res.status(400).json({ error: 'Name, email, studentId, and class are required' });
    }

    const existing = await Student.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { studentId: studentId.trim() }]
    });

    if (existing) {
      return res.status(409).json({ error: 'A student with this email or Student ID already exists' });
    }

    const newStudent = new Student({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'STUDENT',
      studentId: studentId.trim(),
      class: studentClass.trim(),
      attendance: [],
      marks: [],
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST bulk import students (from CSV)
router.post('/bulk', async (req, res) => {
  try {
    const { students: rawStudents } = req.body;
    if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
      return res.status(400).json({ error: 'Array of students is required' });
    }

    const added = [];
    const skipped = [];

    for (const raw of rawStudents) {
      const email = raw.email?.toLowerCase().trim();
      const studentId = raw.studentId?.trim();
      const name = raw.name?.trim();
      const className = raw.class?.trim();

      if (!email || !studentId || !name || !className) {
        skipped.push(`${raw.name || 'Unknown'}: Missing required fields`);
        continue;
      }

      const existing = await Student.findOne({
        $or: [{ email }, { studentId }]
      });

      if (existing) {
        skipped.push(`${name} (${studentId}): Already exists`);
        continue;
      }

      const newStudent = new Student({
        name,
        email,
        studentId,
        class: className,
        role: 'STUDENT',
        attendance: [],
        marks: [],
      });

      await newStudent.save();
      added.push(newStudent);
    }

    res.json({ added, skipped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Student.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Student.findOneAndDelete({ studentId: id });
    }
    if (!deleted) {
      return res.status(404).json({ error: 'Student not found to delete' });
    }
    res.json({ message: 'Student successfully deleted', student: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';

const router = express.Router();

// POST update or insert student marks
router.post('/update', async (req, res) => {
  try {
    const { studentId, month, subject, marks } = req.body;
    if (!studentId || !month || !subject || marks === undefined) {
      return res.status(400).json({ error: 'studentId, month, subject, and marks are required' });
    }

    const numericMarks = Number(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({ error: 'Marks must be a number between 0 and 100' });
    }

    let student = null;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }
    if (!student) {
      student = await Student.findOne({ studentId });
    }
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const existingIdx = student.marks.findIndex(m => m.month === month && m.subject.toLowerCase() === subject.toLowerCase());
    if (existingIdx > -1) {
      student.marks[existingIdx].marks = numericMarks;
    } else {
      student.marks.push({
        month,
        subject,
        marks: numericMarks,
      });
    }

    await student.save();
    res.json({ message: 'Marks updated successfully', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

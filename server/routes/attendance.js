import express from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';

const router = express.Router();

// Helper to determine month short name if not passed
const getMonthShortName = (dateStr) => {
  if (!dateStr) return 'Jan';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Jan' : d.toLocaleString('en-US', { month: 'short' });
  } catch {
    return 'Jan';
  }
};

// POST mark attendance for single student
router.post('/mark', async (req, res) => {
  try {
    const { studentId, date, month, status } = req.body;
    if (!studentId || !status) {
      return res.status(400).json({ error: 'studentId and status are required' });
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

    const calculatedMonth = month || getMonthShortName(date);

    // Check if record exists for this date (or month if date not supplied)
    let existingIndex = -1;
    if (date) {
      existingIndex = student.attendance.findIndex(a => a.date === date);
    } else {
      existingIndex = student.attendance.findIndex(a => a.month === calculatedMonth && !a.date);
    }

    if (existingIndex > -1) {
      student.attendance[existingIndex].status = status;
      if (date) student.attendance[existingIndex].date = date;
      student.attendance[existingIndex].month = calculatedMonth;
    } else {
      student.attendance.push({
        date: date || undefined,
        month: calculatedMonth,
        status,
      });
    }

    await student.save();
    res.json({ message: 'Attendance updated successfully', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST bulk mark attendance for class
router.post('/bulk', async (req, res) => {
  try {
    const { className, date, status } = req.body;
    if (!className || !date || !status) {
      return res.status(400).json({ error: 'className, date, and status are required' });
    }

    const month = getMonthShortName(date);
    const students = await Student.find({ class: className });

    for (const student of students) {
      const existingIdx = student.attendance.findIndex(a => a.date === date);
      if (existingIdx > -1) {
        student.attendance[existingIdx].status = status;
        student.attendance[existingIdx].month = month;
      } else {
        student.attendance.push({
          date,
          month,
          status,
        });
      }
      await student.save();
    }

    res.json({ message: `Bulk marked ${status} for ${students.length} students in class ${className}`, count: students.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import mongoose from 'mongoose';
import { Teacher } from '../models/Teacher.js';

const router = express.Router();

// GET all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ name: 1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add teacher
router.post('/', async (req, res) => {
  try {
    const { name, email, teacherId, department, classes } = req.body;
    if (!name || !email || !teacherId || !department) {
      return res.status(400).json({ error: 'Name, email, teacherId, and department are required' });
    }

    const existing = await Teacher.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { teacherId: teacherId.trim() }]
    });

    if (existing) {
      return res.status(409).json({ error: 'A teacher with this email or Teacher ID already exists' });
    }

    const newTeacher = new Teacher({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'TEACHER',
      teacherId: teacherId.trim(),
      department: department.trim(),
      classes: Array.isArray(classes) ? classes : (typeof classes === 'string' ? classes.split(',').map(c => c.trim()).filter(Boolean) : []),
    });

    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE teacher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Teacher.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Teacher.findOneAndDelete({ teacherId: id });
    }
    if (!deleted) {
      return res.status(404).json({ error: 'Teacher not found to delete' });
    }
    res.json({ message: 'Teacher deleted successfully', teacher: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

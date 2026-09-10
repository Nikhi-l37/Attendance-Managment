import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  date: { type: String }, // e.g. '2026-09-10'
  month: { type: String, required: true }, // e.g. 'Jan'
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
}, { _id: false });

const markRecordSchema = new mongoose.Schema({
  month: { type: String, required: true },
  subject: { type: String, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, default: 'STUDENT' },
  studentId: { type: String, required: true, unique: true, trim: true },
  class: { type: String, required: true, trim: true },
  attendance: [attendanceRecordSchema],
  marks: [markRecordSchema],
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    }
  }
});

export const Student = mongoose.model('Student', studentSchema);

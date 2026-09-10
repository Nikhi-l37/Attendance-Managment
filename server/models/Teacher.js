import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, default: 'TEACHER' },
  teacherId: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true, trim: true },
  classes: [{ type: String, trim: true }],
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

export const Teacher = mongoose.model('Teacher', teacherSchema);

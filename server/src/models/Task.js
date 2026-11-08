import mongoose from 'mongoose';

export const PRIORITIES = ['low', 'medium', 'high'];
export const STATUSES = ['in_progress', 'completed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description must be at most 1000 characters'],
    },
    dueAt: {
      type: Date,
      required: [true, 'Date & time is required'],
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: 'Priority must be low, medium or high' },
      default: null,
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be in_progress or completed' },
      default: 'in_progress',
    },
  },
  { timestamps: true }
);

taskSchema.index({ dueAt: 1 });

export default mongoose.model('Task', taskSchema);

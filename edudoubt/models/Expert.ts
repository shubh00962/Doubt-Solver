import mongoose, { Schema, Document } from 'mongoose';

export interface IExpert extends Document {
  userId: mongoose.Types.ObjectId;
  subjects: string[];
  bio: string;
  qualifications: string;
  hourlyRate: number;
  rating: number;
  totalSessions: number;
  isOnline: boolean;
  availability: { day: string; slots: string[] }[];
}

const ExpertSchema = new Schema<IExpert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjects: [{ type: String }],
    bio: { type: String, default: '' },
    qualifications: { type: String, default: '' },
    hourlyRate: { type: Number, default: 500 },
    rating: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    availability: [
      {
        day: String,
        slots: [String],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Expert || mongoose.model<IExpert>('Expert', ExpertSchema);

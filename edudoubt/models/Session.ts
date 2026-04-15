import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  studentId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  agoraChannelName: string;
  scheduledAt?: Date;
  duration: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  amount: number;
  recordingUrl?: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
    agoraChannelName: { type: String, required: true },
    scheduledAt: { type: Date },
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    amount: { type: Number, required: true },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

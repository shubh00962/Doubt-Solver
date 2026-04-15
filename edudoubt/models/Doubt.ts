import mongoose, { Schema, Document } from 'mongoose';

export interface IDoubt extends Document {
  studentId: mongoose.Types.ObjectId;
  question: string;
  imageUrl?: string;
  subject: string;
  aiAnswer?: {
    steps: string[];
    finalAnswer: string;
    tip: string;
    subject: string;
  };
  isResolved: boolean;
  helpfulVote?: boolean;
  createdAt: Date;
}

const DoubtSchema = new Schema<IDoubt>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    imageUrl: { type: String },
    subject: { type: String, required: true },
    aiAnswer: {
      steps: [String],
      finalAnswer: String,
      tip: String,
      subject: String,
    },
    isResolved: { type: Boolean, default: false },
    helpfulVote: { type: Boolean },
  },
  { timestamps: true }
);

export default mongoose.models.Doubt || mongoose.model<IDoubt>('Doubt', DoubtSchema);

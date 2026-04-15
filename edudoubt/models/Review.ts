import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  sessionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

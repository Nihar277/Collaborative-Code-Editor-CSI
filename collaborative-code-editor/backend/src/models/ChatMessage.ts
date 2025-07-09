import mongoose, { Document as MDoc, Schema } from 'mongoose';

export interface IChatMessage extends MDoc {
  documentId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  type: 'message' | 'system';
}

const ChatMessageSchema = new Schema<IChatMessage>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['message', 'system'], default: 'message' },
});

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema); 
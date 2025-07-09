import mongoose, { Document as MDoc, Schema } from 'mongoose';

export interface IDocument extends MDoc {
  title: string;
  content: string;
  language: string;
  owner: mongoose.Types.ObjectId;
  collaborators: Array<{
    userId: mongoose.Types.ObjectId;
    permission: 'owner' | 'editor' | 'viewer';
    joinedAt: Date;
  }>;
  versions: Array<{
    content: string;
    author: mongoose.Types.ObjectId;
    timestamp: Date;
    message: string;
  }>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollaboratorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  permission: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
  joinedAt: { type: Date, default: Date.now },
});

const VersionSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  message: { type: String, default: '' },
});

const DocumentSchema = new Schema<IDocument>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  language: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [CollaboratorSchema],
  versions: [VersionSchema],
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDocument>('Document', DocumentSchema); 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import collaborationRoutes from './routes/collaboration';
import chatRoutes from './routes/chat';
import http from 'http';
import { initSocket } from './socket';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/csi-code-editor';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Collaborative Code Editor API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/chat', chatRoutes);

const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

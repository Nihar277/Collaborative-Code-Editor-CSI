import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import collaborationRoutes from './routes/collaboration';
import chatRoutes from './routes/chat';
import http from 'http';
import { initSocket } from './socket';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Collaborative Code Editor API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents', collaborationRoutes);
app.use('/api/documents', chatRoutes);

const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

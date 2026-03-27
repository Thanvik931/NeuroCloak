import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import decisionsRoutes from './routes/decisions';
import systemsRoutes from './routes/systems';
import analyticsRoutes from './routes/analytics';
import anomaliesRoutes from './routes/anomalies';
import { initSocket } from './services/socketService';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);

initSocket(httpServer);

app.use(helmet());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/decisions', decisionsRoutes);
app.use('/api/systems', systemsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/anomalies', anomaliesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { app, httpServer };

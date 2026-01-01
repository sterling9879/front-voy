import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.routes';
import { projectRouter } from './routes/project.routes';
import { copyRouter } from './routes/copy.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { hypothesisRouter } from './routes/hypothesis.routes';
import { timelineRouter } from './routes/timeline.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 4001;

// Security middleware
app.use(helmet());

// CORS - allow all origins for now
app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit
  message: { error: 'Muitas requisições, tente novamente mais tarde.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/copies', copyRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/hypotheses', hypothesisRouter);
app.use('/api/timeline', timelineRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

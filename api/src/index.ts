import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { traceRouter } from './trace/router';
import { clusterRouter } from './cluster/router';
import { reportRouter } from './report/router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'The Constable API',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/trace', traceRouter);
app.use('/api/cluster', clusterRouter);
app.use('/api/report', reportRouter);

// Documentation
app.get('/', (req, res) => {
  res.json({
    name: 'The Constable API',
    description: 'On-chain forensics and investigation toolkit for Solana',
    version: '0.1.0',
    endpoints: {
      '/health': 'Health check',
      '/api/trace/:signature': 'Trace transaction flow',
      '/api/trace/wallet/:address': 'Trace wallet transactions',
      '/api/cluster/analyze': 'Analyze wallet cluster',
      '/api/cluster/related/:address': 'Find related wallets',
      '/api/report/create': 'Create investigation report',
      '/api/report/:caseId': 'Get report by case ID'
    }
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🎩 The Constable API listening on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import analyticsRouter from './routes/analytics';
import { initializeDatabase } from './database/schema';

const app = express();
const PORT = process.env.PORT || 3001;

// 确保data目录存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据库
initializeDatabase();

// 中间件
app.use(cors());
app.use(express.json());

// API路由
app.use('/api/analytics', analyticsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Agent Analytics API server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/analytics`);
});

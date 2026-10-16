import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from './config.js';
import requestRoutes from './routes/requestRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // ⭐ Security header — ป้องกัน MIME sniffing (Challenge)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  // ① CORS
  app.use(cors({ origin: config.corsOrigin }));

  // ② logging — ปิดใน test เพื่อให้อ่านผลง่าย
  if (config.env !== 'test') app.use(morgan(config.isProd ? 'combined' : 'dev'));

  // ③ JSON body + จำกัดขนาด 10kb (CP48) — Express จะโยน PayloadTooLarge
  app.use(express.json({ limit: '10kb' }));

  // ④ API routes
  app.get('/api', (req, res) => {
    res.json({ message: 'Campus Service API is running', version: '3.0.0' });
  });
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/users', userRoutes);

  // ⑤ หน้าแรก — ขึ้นกับสภาพแวดล้อม
  if (config.isProd && existsSync(config.staticDir)) {
    app.use(express.static(config.staticDir));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(config.staticDir, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.json({ message: 'Campus Service API (dev) — หน้าเว็บอยู่ที่ Vite พอร์ต 5173', api: '/api' });
    });
  }

  // ⑥ ปิดท้าย
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

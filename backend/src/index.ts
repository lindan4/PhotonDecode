import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import submissionsRouter from './routes/submissions.js'; // ✅ renamed for generalization
import path from 'path';
import multer from 'multer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ───────────────────────────────
// 🗄️ Database Connection
// ───────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Attach pool globally (optional helper if used in multiple files)
app.locals.pool = pool;

// ───────────────────────────────
// 📁 Static Files
// ───────────────────────────────
// This directory is mounted by Docker at runtime
app.use('/uploads', express.static('/usr/src/app/uploads'));

// ───────────────────────────────
// 🩺 Health Check Endpoint
// ───────────────────────────────
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// ───────────────────────────────
// 🧩 API Routes
// ───────────────────────────────
app.use('/api/submissions', submissionsRouter); // ✅ new route name


// ───────────────────────────────
// 🧱 Multer Error Handling
// ───────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// ───────────────────────────────
// 🚀 Server Startup
// ───────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Photon Decode backend running on port ${PORT}`);
  });
}

export default app;
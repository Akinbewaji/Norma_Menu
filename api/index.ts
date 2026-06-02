import express from 'express';
import cors from 'cors';
import { initDb } from '../server/db.js'; // Ensure .js extension is used if needed
import menuRoutes from '../server/routes/menu.js';
import adminRoutes from '../server/routes/admin.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize DB (Note: On Vercel, this runs on cold starts)
if (process.env.DATABASE_URL) {
  initDb().catch(console.error);
}

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);

export default app;

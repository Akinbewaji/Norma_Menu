import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticateAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me-in-production';

const logAction = async (email: string, action: string, entity: string, entity_id: number | null, details: string) => {
  try {
    await pool.query(
      'INSERT INTO admin_logs (admin_email, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [email, action, entity, entity_id, details]
    );
  } catch (err) {
    console.error('Failed to log admin action', err);
  }
};

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    await logAction(user.email, 'LOGIN', 'Admin Session', null, 'Admin logged in');

    res.json({ token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.use(authenticateAdmin);

// LOGS
router.get('/logs', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CATEGORIES CRUD
router.post('/categories', async (req: AuthRequest, res) => {
  const { name, description, display_order } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, description, display_order) VALUES ($1, $2, $3) RETURNING *',
      [name, description, display_order || 0]
    );
    await logAction(req.user.email, 'CREATE', 'Category', result.rows[0].id, `Created category: ${name}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/categories/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, description, display_order } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, display_order = $3 WHERE id = $4 RETURNING *',
      [name, description, display_order || 0, id]
    );
    await logAction(req.user.email, 'UPDATE', 'Category', parseInt(id), `Updated category: ${name}`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/categories/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT name FROM categories WHERE id = $1', [id]);
    const name = result.rows[0]?.name;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    await logAction(req.user.email, 'DELETE', 'Category', parseInt(id), `Deleted category: ${name}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ITEMS CRUD
router.post('/items', async (req: AuthRequest, res) => {
  const { category_id, name, description, price, available, allergens, image_url, display_order } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO menu_items (category_id, name, description, price, available, allergens, image_url, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [category_id, name, description, price, available ?? true, JSON.stringify(allergens || []), image_url, display_order || 0]
    );
    await logAction(req.user.email, 'CREATE', 'Menu Item', result.rows[0].id, `Created item: ${name} (₦${price})`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/items/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { category_id, name, description, price, available, allergens, image_url, display_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE menu_items 
       SET category_id = $1, name = $2, description = $3, price = $4, available = $5, allergens = $6, image_url = $7, display_order = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [category_id, name, description, price, available ?? true, JSON.stringify(allergens || []), image_url, display_order || 0, id]
    );
    await logAction(req.user.email, 'UPDATE', 'Menu Item', parseInt(id), `Updated item: ${name} (₦${price})`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/items/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT name FROM menu_items WHERE id = $1', [id]);
    const name = result.rows[0]?.name;
    await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
    await logAction(req.user.email, 'DELETE', 'Menu Item', parseInt(id), `Deleted item: ${name}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

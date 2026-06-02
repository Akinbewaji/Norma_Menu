import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { categories, items } from './seedData.js';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

export const initDb = async () => {
  try {
    // Categories Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Menu Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        available BOOLEAN DEFAULT true,
        allergens JSONB,
        image_url VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Admin Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    // Admin Logs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_email VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        entity VARCHAR(255),
        entity_id INTEGER,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create default admin user if none exists
    const users = await pool.query('SELECT COUNT(*) FROM admin_users');
    if (parseInt(users.rows[0].count) === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query('INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)', ['admin@norma.com', hash]);
      console.log('Created default admin user: admin@norma.com / admin123');
    }

    // Seed menu if categories are empty
    const catCount = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCount.rows[0].count) === 0) {
      console.log('Categories table is empty, seeding PDF data...');
      const categoryIds: Record<string, number> = {};
      for (let i = 0; i < categories.length; i++) {
        const res = await pool.query(
          'INSERT INTO categories (name, display_order) VALUES ($1, $2) RETURNING id',
          [categories[i], i + 1]
        );
        categoryIds[categories[i]] = res.rows[0].id;
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await pool.query(
          'INSERT INTO menu_items (category_id, name, description, price, display_order) VALUES ($1, $2, $3, $4, $5)',
          [categoryIds[item.c], item.n, item.d || null, item.p, i + 1]
        );
      }
      console.log('Seeded menu items successfully.');
    }

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

export default pool;

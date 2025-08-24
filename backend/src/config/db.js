import {neon} from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();
//create sql connection

export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transaction (
        id SERIAL PRIMARY KEY,  
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`;

    console.log('Database and table initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1); // Exit if there's a DB error, 1 meas failure 0 means success
  }
}
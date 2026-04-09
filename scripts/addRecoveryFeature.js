import pkg from 'pg';
const { Client } = pkg;
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load env
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, '');
        process.env[key] = val;
      }
    }
  });
}

const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

async function migrate() {
  if (!dbUrl) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log('Connected to database for migration...');

    console.log('Adding recovery_hash to workrooms table...');
    await client.query(`
      ALTER TABLE workrooms 
      ADD COLUMN IF NOT EXISTS recovery_hash VARCHAR(255);
    `);

    console.log('Adding tone to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS tone VARCHAR(100) DEFAULT 'Professional but provocative';
    `);

    console.log('✅ Migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();

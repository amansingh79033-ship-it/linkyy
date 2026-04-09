import pkg from 'pg';
const { Client } = pkg;
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local');
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
}

async function debugAPI() {
  loadEnv();
  const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const client = new Client({ connectionString: connStr });
  
  try {
    await client.connect();
    console.log('Connected to database.');
    
    console.log('Testing SELECT 1 FROM workrooms WHERE codename = $1');
    const result = await client.query('SELECT 1 FROM workrooms WHERE codename = $1', ['tester']);
    console.log('Query successful, rows:', result.rows.length);
    
    console.log('Checking table schema for workrooms:');
    const schema = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'workrooms'");
    console.table(schema.rows);
    
  } catch (err) {
    console.error('DEBUG ERROR:', err);
  } finally {
    await client.end();
  }
}

debugAPI();

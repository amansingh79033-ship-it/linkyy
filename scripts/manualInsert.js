import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');
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

async function insertUser() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL });
  try {
    await client.connect();
    console.log('Inserting user...');
    await client.query("INSERT INTO users (codename, status, last_active) VALUES ('manual_test_user', 'active', NOW()) ON CONFLICT (codename) DO UPDATE SET last_active = NOW()");
    console.log('User inserted!');
  } catch (err) {
    console.error('Insert failed:', err);
  } finally {
    await client.end();
  }
}

insertUser();

import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let poolInstance = null;
let envLoaded = false;

function loadEnvBackup() {
  if (envLoaded) return;
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    envLoaded = true;
    return;
  }
  
  try {
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
      console.log('✅ [_db.js] Manually loaded .env.local');
    }
  } catch (e) {
    console.error('⚠️ [_db.js] Failed to load .env.local fallback:', e);
  }
  envLoaded = true;
}

export const getPool = () => {
  loadEnvBackup();
  if (!poolInstance) {
    // Force local connection for testing unless explicitly disabled or running in true Vercel prod
    const isProd = process.env.VERCEL_ENV === 'production';
    const connStr = isProd 
      ? (process.env.POSTGRES_URL || process.env.DATABASE_URL)
      : 'postgres://postgres:postgres@localhost:5432/Linkyy';

    if (!connStr) {
      throw new Error('DATABASE_URL is not defined in environment or .env.local. Pool cannot be initialized.');
    }
    poolInstance = new Pool({ connectionString: connStr });
  }
  return poolInstance;
};

import pkg from 'pg';
const { Pool } = pkg;
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

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

async function testStats() {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count, 10);
    console.log('Total users:', totalUsers);

    const activityResult = await pool.query(`
      SELECT action, COUNT(*) as count 
      FROM activity_logs 
      WHERE action IN ('generate_post', 'generate_carousel')
      GROUP BY action
    `);
    console.log('Activities:', activityResult.rows);

    const dwellAvgResult = await pool.query(`
      SELECT AVG(dwell_score) as avg_dwell 
      FROM activity_logs 
      WHERE dwell_score IS NOT NULL
    `);
    console.log('Dwell avg:', dwellAvgResult.rows[0]);

    const activeTodayResult = await pool.query(`
      SELECT COUNT(DISTINCT codename) as count
      FROM activity_logs
      WHERE created_at >= NOW() - INTERVAL '24 HOURS'
    `);
    console.log('Active today:', activeTodayResult.rows[0]);

    console.log('Stats check successful!');
  } catch (err) {
    console.error('Stats check failed:', err);
  } finally {
    await pool.end();
  }
}

testStats();

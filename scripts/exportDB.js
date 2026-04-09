/**
 * Database Export Script - Export all data from local database
 * 
 * This script exports all users, workrooms, and activity logs
 * to a JSON file that can be imported to production.
 */

import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
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
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
});

async function exportData() {
  console.log('🚀 Starting database export...\n');
  
  try {
    const exportData = {
      exportedAt: new Date().toISOString(),
      source: 'localhost:8000',
      version: '2.0.0',
      data: {}
    };

    // Export Users
    console.log('📦 Exporting users...');
    const usersResult = await pool.query(`
      SELECT codename, status, last_active, created_at 
      FROM users 
      ORDER BY created_at ASC
    `);
    exportData.data.users = usersResult.rows;
    console.log(`   ✅ Exported ${usersResult.rows.length} user(s)\n`);

    // Export Workrooms
    console.log('📦 Exporting workrooms...');
    const workroomsResult = await pool.query(`
      SELECT codename, created_at 
      FROM workrooms 
      ORDER BY created_at ASC
    `);
    exportData.data.workrooms = workroomsResult.rows;
    console.log(`   ✅ Exported ${workroomsResult.rows.length} workroom(s)\n`);

    // Export Activity Logs
    console.log('📦 Exporting activity logs...');
    const activitiesResult = await pool.query(`
      SELECT id, codename, action, dwell_score, created_at 
      FROM activity_logs 
      ORDER BY created_at ASC
    `);
    exportData.data.activityLogs = activitiesResult.rows;
    console.log(`   ✅ Exported ${activitiesResult.rows.length} activity log(s)\n`);

    // Summary
    console.log('📊 Export Summary:');
    console.log(`   Users: ${exportData.data.users.length}`);
    console.log(`   Workrooms: ${exportData.data.workrooms.length}`);
    console.log(`   Activity Logs: ${exportData.data.activityLogs.length}`);
    
    // Write to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `db-export-${timestamp}.json`;
    const outputPath = resolve(__dirname, '..', filename);
    
    writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n✅ Data exported successfully to: ${filename}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Upload this file to Vercel or share with production team`);
    console.log(`   2. Run import script on production database`);
    console.log(`   3. Verify data appears in production admin dashboard\n`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

exportData();

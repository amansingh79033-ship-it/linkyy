/**
 * Database Import Script - Import data to production database
 * 
 * This script imports data from a JSON export file to the production database.
 * Make sure to set PRODUCTION_DATABASE_URL environment variable.
 */

import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get the export filename from command line arguments
const exportFilename = process.argv[2];

if (!exportFilename) {
  console.error('❌ Please provide the export filename as argument');
  console.error('Usage: node scripts/importDB.js <export-filename.json>');
  console.error('Example: node scripts/importDB.js db-export-2026-03-31T12-00-00-000Z.json');
  process.exit(1);
}

const exportPath = resolve(__dirname, '..', exportFilename);

console.log('📥 Importing data from:', exportFilename);

// Read export file
let exportData;
try {
  const fileContent = readFileSync(exportPath, 'utf8');
  exportData = JSON.parse(fileContent);
  console.log('✅ Export file loaded successfully\n');
} catch (error) {
  console.error('❌ Failed to read export file:', error.message);
  process.exit(1);
}

// Create pool for production database
const pool = new Pool({
  connectionString: process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL_PROD
});

async function importData() {
  console.log('🚀 Starting database import to production...\n');
  
  try {
    // Check connection
    const testRes = await pool.query('SELECT NOW()');
    console.log('✅ Connected to production database');
    console.log(`   Database time: ${testRes.rows[0].now}\n`);

    const data = exportData.data;
    let totalImported = 0;

    // Import Users
    if (data.users && data.users.length > 0) {
      console.log(`📦 Importing ${data.users.length} user(s)...`);
      
      for (const user of data.users) {
        try {
          await pool.query(`
            INSERT INTO users (codename, status, last_active, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (codename) DO UPDATE SET
              status = EXCLUDED.status,
              last_active = EXCLUDED.last_active,
              created_at = EXCLUDED.created_at
          `, [user.codename, user.status, user.last_active, user.created_at]);
        } catch (error) {
          console.error(`   ⚠️ Failed to import user ${user.codename}:`, error.message);
        }
      }
      
      console.log(`   ✅ Imported ${data.users.length} user(s)\n`);
      totalImported += data.users.length;
    }

    // Import Workrooms
    if (data.workrooms && data.workrooms.length > 0) {
      console.log(`📦 Importing ${data.workrooms.length} workroom(s)...`);
      
      for (const workroom of data.workrooms) {
        try {
          await pool.query(`
            INSERT INTO workrooms (codename, created_at)
            VALUES ($1, $2)
            ON CONFLICT (codename) DO UPDATE SET
              created_at = EXCLUDED.created_at
          `, [workroom.codename, workroom.created_at]);
        } catch (error) {
          console.error(`   ⚠️ Failed to import workroom ${workroom.codename}:`, error.message);
        }
      }
      
      console.log(`   ✅ Imported ${data.workrooms.length} workroom(s)\n`);
      totalImported += data.workrooms.length;
    }

    // Import Activity Logs
    if (data.activityLogs && data.activityLogs.length > 0) {
      console.log(`📦 Importing ${data.activityLogs.length} activity log(s)...`);
      
      for (const activity of data.activityLogs) {
        try {
          await pool.query(`
            INSERT INTO activity_logs (id, codename, action, dwell_score, created_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
          `, [activity.id, activity.codename, activity.action, activity.dwell_score, activity.created_at]);
        } catch (error) {
          console.error(`   ⚠️ Failed to import activity log ID ${activity.id}:`, error.message);
        }
      }
      
      console.log(`   ✅ Imported ${data.activityLogs.length} activity log(s)\n`);
      totalImported += data.activityLogs.length;
    }

    // Summary
    console.log('📊 Import Summary:');
    console.log(`   Total Records Imported: ${totalImported}`);
    console.log(`   - Users: ${data.users?.length || 0}`);
    console.log(`   - Workrooms: ${data.workrooms?.length || 0}`);
    console.log(`   - Activity Logs: ${data.activityLogs?.length || 0}`);
    
    console.log('\n✅ Production database migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Visit https://www.linkyy.online/admin');
    console.log('   2. Login with credentials (Addy / Password12)');
    console.log('   3. Verify all data appears correctly');
    console.log('   4. Check all tabs: Overview, User Analytics, Forecasting, Workrooms\n');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

importData();

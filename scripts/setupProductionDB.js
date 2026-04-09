/**
 * Database Setup Script - Create and configure production database
 * 
 * This script will:
 * 1. Guide you through creating a free Neon PostgreSQL database
 * 2. Generate the complete schema with all tables
 * 3. Update .env.local with the production URL
 * 4. Migrate your local data to production
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');

// Complete database schema for Linkyy platform
const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  codename VARCHAR(255) PRIMARY KEY,
  status VARCHAR(50) DEFAULT 'active',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workrooms table
CREATE TABLE IF NOT EXISTS workrooms (
  codename VARCHAR(255) PRIMARY KEY,
  passcode_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  codename VARCHAR(255) REFERENCES users(codename) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  dwell_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin sessions table (optional, for admin dashboard)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  token VARCHAR(512) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_codename ON activity_logs(codename);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- Insert default admin user if not exists
INSERT INTO users (codename, status, last_active, created_at) 
VALUES ('addy', 'admin', NOW(), NOW())
ON CONFLICT (codename) DO NOTHING;
`;

async function main() {
  console.log('🚀 Linkyy Production Database Setup\n');
  console.log('This will guide you through setting up a production database.\n');
  
  // Step 1: Check if export file exists
  console.log('📦 Step 1: Checking export file...');
  const exportFile = 'db-export-2026-03-31T12-09-47-886Z.json';
  const exportPath = resolve(__dirname, '..', exportFile);
  
  try {
    readFileSync(exportPath);
    console.log(`   ✅ Found: ${exportFile}\n`);
  } catch (error) {
    console.log('   ❌ Export file not found!');
    console.log('   Run first: node scripts/exportDB.js\n');
    return;
  }
  
  // Step 2: Guide user to create Neon database
  console.log('📝 Step 2: Create Free Neon Database\n');
  console.log('Follow these steps:\n');
  console.log('   1. Go to: https://neon.tech/signup');
  console.log('   2. Sign up with GitHub (recommended) or email');
  console.log('   3. Click "New Project"');
  console.log('   4. Name it: "linkyy-production"');
  console.log('   5. Choose region closest to you');
  console.log('   6. Click "Create Project"\n');
  
  console.log('💡 Neon is FREE and perfect for Vercel deployments!\n');
  
  const readline = await import('readline').then(r => r.createInterface({
    input: process.stdin,
    output: process.stdout
  }));
  
  const answer = await new Promise(resolve => 
    readline.question('\nPress Enter when ready to continue...')
  );
  
  // Step 3: Get connection string from Neon
  console.log('\n📝 Step 3: Get Your Connection String\n');
  console.log('In Neon dashboard:\n');
  console.log('   1. You should see your project "linkyy-production"');
  console.log('   2. Look for "Connection Details" or "Connection Info"');
  console.log('   3. Find the URI that looks like:');
  console.log('      postgres://user:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require');
  console.log('   4. Click "Copy" to copy it\n');
  
  const connectionString = await new Promise(resolve =>
    readline.question('\nPaste your Neon connection string here: ')
  );
  
  readline.close();
  
  // Validate connection string format
  if (!connectionString.startsWith('postgres://')) {
    console.log('\n❌ Invalid connection string! It should start with "postgres://"');
    console.log('Please try again.\n');
    return;
  }
  
  // Step 4: Test connection and create schema
  console.log('\n🔧 Step 4: Testing connection and creating schema...\n');
  
  const pool = new Pool({ connectionString });
  
  try {
    // Test connection
    const testRes = await pool.query('SELECT NOW() as db_time');
    console.log('✅ Connected to Neon database');
    console.log(`   Database time: ${testRes.rows[0].db_time}\n`);
    
    // Create schema
    console.log('📋 Creating database schema...');
    await pool.query(SCHEMA_SQL);
    console.log('✅ Schema created successfully!\n');
    
    // Update .env.local
    console.log('💾 Updating .env.local...');
    let envContent = readFileSync(envPath, 'utf8');
    
    // Replace both DATABASE_URL and PRODUCTION_DATABASE_URL
    envContent = envContent.replace(
      /DATABASE_URL="[^"]*"/g,
      `DATABASE_URL="${connectionString}"`
    );
    envContent = envContent.replace(
      /PRODUCTION_DATABASE_URL="[^"]*"/g,
      `PRODUCTION_DATABASE_URL="${connectionString}"`
    );
    
    writeFileSync(envPath, envContent);
    console.log('✅ .env.local updated with production database URL\n');
    
    // Import data
    console.log('📦 Step 5: Importing your local data to production...\n');
    const exportData = JSON.parse(readFileSync(exportPath, 'utf8'));
    
    let imported = 0;
    
    // Import users
    if (exportData.data.users && exportData.data.users.length > 0) {
      console.log(`   Importing ${exportData.data.users.length} user(s)...`);
      for (const user of exportData.data.users) {
        await pool.query(`
          INSERT INTO users (codename, status, last_active, created_at)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (codename) DO UPDATE SET
            status = EXCLUDED.status,
            last_active = EXCLUDED.last_active
        `, [user.codename, user.status, user.last_active, user.created_at]);
      }
      imported += exportData.data.users.length;
      console.log(`   ✅ Imported users\n`);
    }
    
    // Import workrooms
    if (exportData.data.workrooms && exportData.data.workrooms.length > 0) {
      console.log(`   Importing ${exportData.data.workrooms.length} workroom(s)...`);
      for (const workroom of exportData.data.workrooms) {
        await pool.query(`
          INSERT INTO workrooms (codename, created_at)
          VALUES ($1, $2)
          ON CONFLICT (codename) DO UPDATE SET
            created_at = EXCLUDED.created_at
        `, [workroom.codename, workroom.created_at]);
      }
      imported += exportData.data.workrooms.length;
      console.log(`   ✅ Imported workrooms\n`);
    }
    
    // Import activity logs
    if (exportData.data.activityLogs && exportData.data.activityLogs.length > 0) {
      console.log(`   Importing ${exportData.data.activityLogs.length} activity log(s)...`);
      for (const activity of exportData.data.activityLogs) {
        await pool.query(`
          INSERT INTO activity_logs (id, codename, action, dwell_score, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [activity.id, activity.codename, activity.action, activity.dwell_score, activity.created_at]);
      }
      imported += exportData.data.activityLogs.length;
      console.log(`   ✅ Imported activity logs\n`);
    }
    
    console.log('📊 Migration Summary:');
    console.log(`   Total Records Imported: ${imported}`);
    console.log(`   - Users: ${exportData.data.users?.length || 0}`);
    console.log(`   - Workrooms: ${exportData.data.workrooms?.length || 0}`);
    console.log(`   - Activity Logs: ${exportData.data.activityLogs?.length || 0}\n`);
    
    console.log('✅ Production database setup completed successfully!\n');
    
    console.log('🎉 Next Steps:\n');
    console.log('   1. Deploy to Vercel with the new database:');
    console.log('      npx vercel --prod\n');
    console.log('   2. Visit production site:');
    console.log('      https://www.linkyy.online/admin\n');
    console.log('   3. Login with:');
    console.log('      Username: Addy');
    console.log('      Password: Password12\n');
    console.log('   4. Verify all data appears correctly!\n');
    
    console.log('💾 Your production database URL has been saved to .env.local\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(console.error);

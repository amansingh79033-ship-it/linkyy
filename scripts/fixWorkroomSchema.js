/**
 * Fix Workroom Schema - Add passcode_hash column
 * 
 * This script adds the missing passcode_hash column to the workrooms table
 */

import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';

// Get database URL from .env.local
const env = readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL="([^"]+)"/);

if (!match) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: match[1] });

async function main() {
  console.log('🔧 Fixing Workroom Schema\n');
  
  try {
    // Check if passcode_hash column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'workrooms' 
        AND column_name = 'passcode_hash'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ passcode_hash column already exists\n');
    } else {
      console.log('⚠️  passcode_hash column is missing!');
      console.log('📝 Adding passcode_hash column to workrooms table...\n');
      
      // Add the column
      await pool.query(`
        ALTER TABLE workrooms 
        ADD COLUMN IF NOT EXISTS passcode_hash VARCHAR(255)
      `);
      
      console.log('✅ Column added successfully!\n');
      
      // Verify it was added
      const verify = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'workrooms' 
          AND column_name = 'passcode_hash'
      `);
      
      console.log('📊 Column Details:');
      console.log(`   Name: ${verify.rows[0].column_name}`);
      console.log(`   Type: ${verify.rows[0].data_type}`);
      console.log(`   Nullable: ${verify.rows[0].is_nullable}\n`);
    }
    
    // Show complete workrooms table structure
    console.log('📋 Complete Workrooms Table Structure:\n');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'workrooms'
      ORDER BY ordinal_position
    `);
    
    console.log('Column'.padEnd(25) + 'Type'.padEnd(20) + 'Nullable'.padEnd(10) + 'Default');
    console.log('─'.repeat(70));
    
    for (const col of columns.rows) {
      const name = col.column_name.padEnd(25);
      const type = col.data_type.padEnd(20);
      const nullable = (col.is_nullable === 'YES' ? 'Yes' : 'No').padEnd(10);
      const def = col.column_default || '-';
      console.log(`${name}${type}${nullable}${def}`);
    }
    
    console.log('\n✅ Workroom schema is now complete and ready!\n');
    
    // Show existing workrooms
    const workrooms = await pool.query('SELECT codename, created_at FROM workrooms ORDER BY created_at');
    console.log(`📦 Existing Workrooms (${workrooms.rows.length}):\n`);
    
    if (workrooms.rows.length === 0) {
      console.log('   No workrooms found. You can create a new one from the app.\n');
    } else {
      workrooms.rows.forEach(w => {
        console.log(`   - ${w.codename}`);
        console.log(`     Created: ${w.created_at}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);

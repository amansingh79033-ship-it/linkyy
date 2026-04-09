import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL="([^"]+)"/);

if (!match) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: match[1] });

try {
  // Check workrooms table structure
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'workrooms'
    ORDER BY ordinal_position
  `);
  
  console.log('\n📊 Workrooms Table Structure:\n');
  result.rows.forEach(col => {
    console.log(`  ${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | ${col.is_nullable}`);
  });
  
  // Check if passcode_hash column exists
  const hasPasscodeHash = result.rows.some(r => r.column_name === 'passcode_hash');
  
  if (!hasPasscodeHash) {
    console.log('\n⚠️  MISSING COLUMN: passcode_hash not found!');
    console.log('This is why workroom login/creation is failing.\n');
    
    // Add the missing column
    console.log('🔧 Adding passcode_hash column...\n');
    try {
      await pool.query(`
        ALTER TABLE workrooms 
        ADD COLUMN IF NOT EXISTS passcode_hash VARCHAR(255)
      `);
      console.log('✅ Successfully added passcode_hash column!\n');
      
      // Verify
      const verify = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'workrooms' AND column_name = 'passcode_hash'
      `);
      
      if (verify.rows.length > 0) {
        console.log('✅ Column verified:', verify.rows[0]);
      }
    } catch (error) {
      console.error('❌ Failed to add column:', error.message);
    }
  } else {
    console.log('\n✅ passcode_hash column exists\n');
  }
  
  // Check existing workrooms
  const workrooms = await pool.query('SELECT codename, created_at FROM workrooms LIMIT 10');
  console.log(`\n📦 Existing Workrooms (${workrooms.rows.length} total):\n`);
  workrooms.rows.forEach(w => {
    console.log(`  - ${w.codename} (created: ${w.created_at})`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await pool.end();
}

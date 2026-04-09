/**
 * Database Migration Helper - Interactive Guide
 * 
 * This script helps you migrate data from localhost to production
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🚀 Linkyy Database Migration Helper\n');
  console.log('This will help you migrate data from localhost:8000 to production (linkyy.online)\n');
  
  // Step 1: Check if export file exists
  console.log('📦 Step 1: Checking for export file...');
  const exportFiles = readFileSync(resolve(__dirname, '..'), 'utf8')
    .split('\n')
    .filter(line => line.includes('db-export-') && line.includes('.json'));
  
  // Find the most recent export
  const files = readFileSync(resolve(__dirname, '..')).toString().split('\n')
    .filter(line => line.trim().startsWith('db-export-'))
    .map(line => line.trim().replace(/^.+\s+/, '').replace(/\s+.*$/, ''));
  
  // Just use the known filename
  const exportFile = 'db-export-2026-03-31T12-09-47-886Z.json';
  const exportPath = resolve(__dirname, '..', exportFile);
  
  try {
    readFileSync(exportPath);
    console.log(`   ✅ Found: ${exportFile}\n`);
  } catch (error) {
    console.log('   ❌ Export file not found!');
    console.log('   Run this first: node scripts/exportDB.js\n');
    return;
  }
  
  // Step 2: Get production database URL
  console.log('📝 Step 2: Production Database URL\n');
  console.log('You need to get your production database URL from Vercel:\n');
  console.log('   1. Go to: https://vercel.com/amansingh79033-ship-its-projects/linkaaa');
  console.log('   2. Click "Settings" tab');
  console.log('   3. Click "Environment Variables" in sidebar');
  console.log('   4. Find "DATABASE_URL" or "POSTGRES_URL"');
  console.log('   5. Click "Reveal" to see the value');
  console.log('   6. Copy the entire URL\n');
  
  const prodUrl = await question('Paste your production DATABASE_URL here (or press Enter to skip): ');
  
  if (!prodUrl || prodUrl.trim() === '') {
    console.log('\n⚠️  Skipping automatic setup. Manual steps required:\n');
    console.log('   1. Open .env.local file');
    console.log('   2. Find line: PRODUCTION_DATABASE_URL=""');
    console.log('   3. Paste your production URL between the quotes');
    console.log('   4. Save the file');
    console.log('   5. Run: node scripts/importDB.js ' + exportFile + '\n');
  } else {
    // Update .env.local
    console.log('\n💾 Updating .env.local...');
    const envPath = resolve(__dirname, '..', '.env.local');
    let envContent = readFileSync(envPath, 'utf8');
    
    // Replace the empty PRODUCTION_DATABASE_URL
    envContent = envContent.replace(
      /PRODUCTION_DATABASE_URL=""/g,
      `PRODUCTION_DATABASE_URL="${prodUrl.trim()}"`
    );
    
    writeFileSync(envPath, envContent);
    console.log('   ✅ .env.local updated\n');
    
    // Step 3: Run import
    console.log('🚀 Step 3: Running import script...\n');
    console.log('Executing: node scripts/importDB.js ' + exportFile + '\n');
    
    const { exec } = await import('child_process');
    const util = await import('util');
    const execPromise = util.promisify(exec);
    
    try {
      const { stdout, stderr } = await execPromise(`node scripts/importDB.js ${exportFile}`);
      console.log(stdout);
      if (stderr) console.log(stderr);
      
      console.log('\n✅ Migration completed!\n');
      console.log('📊 Next Steps:');
      console.log('   1. Visit: https://www.linkyy.online/admin');
      console.log('   2. Login with: Addy / Password12');
      console.log('   3. Verify all data appears correctly\n');
      
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      console.log('\nCheck the error above and try again.\n');
    }
  }
  
  rl.close();
}

main().catch(console.error);

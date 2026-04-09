import pkg from 'pg';
const { Client } = pkg;

const targetDbUrl = 'postgres://postgres:postgres@localhost:5432/Linkyy';

async function upgradeDatabase() {
  console.log('Connecting to Linkyy database to add enhanced tracking...');
  const client = new Client({ connectionString: targetDbUrl });
  
  try {
    await client.connect();
    
    console.log('Adding status column to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS device_info JSONB,
      ADD COLUMN IF NOT EXISTS location_info JSONB,
      ADD COLUMN IF NOT EXISTS last_ip_address VARCHAR(45);
    `);

    console.log('Creating navigation_history table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS navigation_history (
        id SERIAL PRIMARY KEY,
        codename VARCHAR(255) NOT NULL,
        page_path VARCHAR(255) NOT NULL,
        time_spent INTEGER,
        referrer VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (codename) REFERENCES users(codename) ON DELETE CASCADE
      );
    `);

    console.log('Creating sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        codename VARCHAR(255) NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP,
        device_type VARCHAR(50),
        browser VARCHAR(100),
        os VARCHAR(100),
        ip_address VARCHAR(45),
        country VARCHAR(100),
        city VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        FOREIGN KEY (codename) REFERENCES users(codename) ON DELETE CASCADE
      );
    `);

    console.log('Creating index on activity_logs for faster queries...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_codename ON activity_logs(codename);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_codename ON sessions(codename);
      CREATE INDEX IF NOT EXISTS idx_navigation_history_codename ON navigation_history(codename);
    `);

    console.log('✅ Database upgrade completed successfully.');
  } catch (err) {
    console.error('❌ Error upgrading database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

upgradeDatabase();

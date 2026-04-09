import pkg from 'pg';
const { Client } = pkg;

const defaultDbUrl = 'postgres://postgres:postgres@localhost:5432/postgres';
const targetDbUrl = 'postgres://postgres:postgres@localhost:5432/Linkyy';

async function setupDatabase() {
  console.log('Connecting to default postgres database...');
  const client = new Client({ connectionString: defaultDbUrl });
  
  try {
    await client.connect();
    console.log('Checking if Linkyy database exists...');
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'Linkyy'");
    
    if (res.rowCount === 0) {
      console.log('Creating Linkyy database...');
      await client.query('CREATE DATABASE "Linkyy"');
      console.log('Database Linkyy created successfully.');
    } else {
      console.log('Database Linkyy already exists.');
    }
  } catch (err) {
    console.error('Error connecting to default DB or creating Linkyy:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('Connecting to Linkyy database to create tables...');
  const targetClient = new Client({ connectionString: targetDbUrl });
  
  try {
    await targetClient.connect();
    
    console.log('Creating users table...');
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        codename VARCHAR(255) UNIQUE NOT NULL,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating activity_logs table...');
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        codename VARCHAR(255) NOT NULL,
        action VARCHAR(50) NOT NULL,
        dwell_score INTEGER,
        user_agent TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (codename) REFERENCES users(codename) ON DELETE CASCADE
      );
    `);
    
    console.log('Tables created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err.message);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

setupDatabase();

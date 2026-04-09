import pkg from 'pg';
const { Client } = pkg;

const client = new Client({ connectionString: 'postgres://postgres:postgres@localhost:5432/Linkyy' });
client.connect()
  .then(async () => {
    console.log("Connected to local DB!");
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(res.rows);
    client.end();
  })
  .catch(err => {
    console.error("Local DB connection failed:", err);
  });

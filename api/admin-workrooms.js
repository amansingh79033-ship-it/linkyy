import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const pool = getPool();

  try {
    const result = await pool.query(`
      SELECT codename, created_at
      FROM workrooms 
      ORDER BY created_at DESC
    `);
    
    return response.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch workrooms for admin:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}

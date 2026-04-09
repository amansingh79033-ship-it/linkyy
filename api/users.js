import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method Not Allowed' });

  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT codename, status, last_active, created_at, 
      (SELECT COUNT(*) FROM activity_logs WHERE activity_logs.codename = users.codename) as total_activities
      FROM users
      ORDER BY last_active DESC
    `);
    
    return response.status(200).json(result.rows);
  } catch (error) {
    console.error('CRITICAL ERROR in /api/users handle:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

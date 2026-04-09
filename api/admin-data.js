import { getPool } from './_db.js';

export default async function handler(request, response) {
  const pool = getPool();

  // GET: Fetch all users
  if (request.method === 'GET') {
    // Check if requesting workrooms or users
    const { type } = request.query;
    
    try {
      if (type === 'workrooms') {
        const result = await pool.query(`
          SELECT codename, created_at
          FROM workrooms 
          ORDER BY created_at DESC
        `);
        return response.status(200).json(result.rows);
      }
      
      // Default: return users
      const result = await pool.query(`
        SELECT codename, status, last_active, created_at, 
        (SELECT COUNT(*) FROM activity_logs WHERE activity_logs.codename = users.codename) as total_activities
        FROM users
        ORDER BY last_active DESC
      `);
      
      return response.status(200).json(result.rows);
    } catch (error) {
      console.error('CRITICAL ERROR in /api/admin-data GET handle:', error);
      return response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  return response.status(405).json({ error: 'Method Not Allowed' });
}

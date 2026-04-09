import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method Not Allowed' });

  const { codename } = request.query;
  if (!codename) return response.status(400).json({ error: 'Codename required' });

  try {
    const pool = getPool();
    const history = await pool.query(`
      SELECT action, dwell_score, created_at, user_agent, ip_address 
      FROM activity_logs 
      WHERE codename = $1 
      ORDER BY created_at DESC 
      LIMIT 100
    `, [codename]);
    
    return response.status(200).json(history.rows);
  } catch (error) {
    console.error('CRITICAL ERROR in /api/user-history handle:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

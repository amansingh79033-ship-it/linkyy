import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method Not Allowed' });

  const { codename } = request.query;
  if (!codename) return response.status(400).json({ error: 'Codename required' });

  try {
    const pool = getPool();

    // 1. Check if the user is frozen
    const userResult = await pool.query('SELECT status FROM users WHERE codename = $1', [codename]);
    const isFrozen = userResult.rows.length > 0 && userResult.rows[0].status === 'frozen';

    // 2. Fetch active messages (target is ALL or specific codename)
    const messages = await pool.query(`
      SELECT id, message_text, target_codename, expires_at 
      FROM messages 
      WHERE (target_codename = 'ALL' OR target_codename = $1)
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
    `, [codename]);

    return response.status(200).json({
      frozen: isFrozen,
      messages: messages.rows
    });
  } catch (error) {
    console.error('CRITICAL ERROR in /api/check-messages handle:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

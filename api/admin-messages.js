import { getPool } from './_db.js';

export default async function handler(request, response) {
  const pool = getPool();

  // GET: Check messages for a user
  if (request.method === 'GET') {
    const { codename } = request.query;
    if (!codename) return response.status(400).json({ error: 'Codename required' });

    try {
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
      console.error('CRITICAL ERROR in /api/admin-messages GET handle:', error);
      return response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  // POST: Send a message to a user
  if (request.method === 'POST') {
    try {
      const { targetCodename, messageText } = request.body;
      if (!targetCodename || !messageText) return response.status(400).json({ error: 'Missing parameters' });

      const expiresAt = new Date(Date.now() + 30 * 1000).toISOString(); 

      await pool.query(`
        INSERT INTO messages (target_codename, message_text, expires_at)
        VALUES ($1, $2, $3)
      `, [targetCodename, messageText, expiresAt]);

      return response.status(200).json({ success: true });
    } catch (error) {
      console.error('CRITICAL ERROR in /api/admin-messages POST handle:', error);
      return response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  return response.status(405).json({ error: 'Method Not Allowed' });
}

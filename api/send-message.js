import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { targetCodename, messageText } = request.body;
    if (!targetCodename || !messageText) return response.status(400).json({ error: 'Missing parameters' });

    const pool = getPool();
    const expiresAt = new Date(Date.now() + 30 * 1000).toISOString(); 

    await pool.query(`
      INSERT INTO messages (target_codename, message_text, expires_at)
      VALUES ($1, $2, $3)
    `, [targetCodename, messageText, expiresAt]);

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('CRITICAL ERROR in /api/send-message handle:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { action, codename } = request.body;
    if (!codename || !action) return response.status(400).json({ error: 'Missing parameters' });

    const pool = getPool();

    if (action === 'DELETE') {
      // Delete all user data including sessions and navigation history
      await pool.query('DELETE FROM activity_logs WHERE codename = $1', [codename]);
      await pool.query('DELETE FROM sessions WHERE codename = $1', [codename]);
      await pool.query('DELETE FROM navigation_history WHERE codename = $1', [codename]);
      await pool.query('DELETE FROM users WHERE codename = $1', [codename]);
      return response.status(200).json({ success: true, action: 'deleted' });
    } 
    
    if (action === 'FREEZE') {
      await pool.query('UPDATE users SET status = $1 WHERE codename = $2', ['frozen', codename]);
      // End any active sessions
      await pool.query('UPDATE sessions SET is_active = false WHERE codename = $1', [codename]);
      return response.status(200).json({ success: true, action: 'frozen' });
    }

    if (action === 'UNFREEZE') {
      await pool.query('UPDATE users SET status = $1 WHERE codename = $2', ['active', codename]);
      return response.status(200).json({ success: true, action: 'unfrozen' });
    }

    if (action === 'REVOKE') {
      // Revoke access by freezing and ending all sessions
      await pool.query('UPDATE users SET status = $1 WHERE codename = $2', ['revoked', codename]);
      await pool.query('UPDATE sessions SET is_active = false WHERE codename = $1', [codename]);
      return response.status(200).json({ success: true, action: 'revoked' });
    }

    if (action === 'ALLOW') {
      // Restore full access
      await pool.query('UPDATE users SET status = $1 WHERE codename = $2', ['active', codename]);
      return response.status(200).json({ success: true, action: 'allowed' });
    }

    return response.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('CRITICAL ERROR in /api/manage-users handle:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

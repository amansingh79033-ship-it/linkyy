import { getPool } from './_db.js';
import { hashSync, compareSync } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'linkyy-secret-key-2026';

export default async function handler(request, response) {
  const pool = getPool();

  console.log('[Workroom API] Request method:', request.method);
  
  // GET: Check if a workroom exists by codename
  if (request.method === 'GET') {
    const { codename } = request.query;
    if (!codename) return response.status(400).json({ error: 'Missing codename' });

    try {
      const result = await pool.query('SELECT 1 FROM workrooms WHERE codename = $1', [codename.toLowerCase()]);
      return response.status(200).json({ exists: result.rows.length > 0 });
    } catch (error) {
      console.error('[Workroom API] Error:', error);
      return response.status(500).json({ error: error?.message || String(error) });
    }
  }

  // POST: Create or Authenticate
  if (request.method === 'POST') {
    const { action, codename, passcode, recoveryHash, newPasscode, tone } = request.body;

    if (!codename && action !== 'update-tone') {
      return response.status(400).json({ error: 'Missing codename' });
    }

    let client;
    try {
      client = await pool.connect();
      
      const cleanCodename = codename?.trim().toLowerCase();

      if (action === 'create') {
        if (!passcode) return response.status(400).json({ error: 'Missing passcode' });
        
        await client.query('BEGIN');

        // 1. Ensure user exists
        await client.query(
          'INSERT INTO users (codename, last_active, tone) VALUES ($1, NOW(), $2) ON CONFLICT (codename) DO UPDATE SET last_active = NOW()',
          [cleanCodename, tone || 'Professional but provocative']
        );

        // 2. Check if workroom exists
        const check = await client.query('SELECT 1 FROM workrooms WHERE codename = $1', [cleanCodename]);
        if (check.rows.length > 0) {
          await client.query('ROLLBACK');
          return response.status(409).json({ error: 'Codename already taken.' });
        }

        const passHash = hashSync(passcode, 12);
        // If recoveryHash is 2500 chars, we hash it for storage
        const recHash = recoveryHash ? hashSync(recoveryHash, 10) : null;

        await client.query(
          'INSERT INTO workrooms (codename, passcode_hash, recovery_hash) VALUES ($1, $2, $3)',
          [cleanCodename, passHash, recHash]
        );

        await client.query('COMMIT');
        
        // Generate JWT
        const token = jwt.sign({ codename: cleanCodename }, JWT_SECRET, { expiresIn: '7d' });

        return response.status(201).json({ 
          success: true, 
          message: 'Workroom created',
          token,
          codename: cleanCodename
        });
      }

      if (action === 'login') {
        if (!passcode) return response.status(400).json({ error: 'Missing passcode' });
        
        const result = await client.query('SELECT passcode_hash FROM workrooms WHERE codename = $1', [cleanCodename]);

        if (result.rows.length === 0) {
          return response.status(404).json({ error: 'User not found' });
        }

        const isValid = compareSync(passcode, result.rows[0].passcode_hash);

        if (!isValid) {
          return response.status(401).json({ error: 'Invalid passcode' });
        }

        await client.query('UPDATE users SET last_active = NOW() WHERE codename = $1', [cleanCodename]);
        const userRes = await client.query('SELECT tone FROM users WHERE codename = $1', [cleanCodename]);

        // Generate JWT
        const token = jwt.sign({ codename: cleanCodename }, JWT_SECRET, { expiresIn: '7d' });

        return response.status(200).json({ 
          success: true, 
          message: 'Authenticated', 
          token,
          codename: cleanCodename,
          tone: userRes.rows[0]?.tone || 'Professional but provocative' 
        });
      }

      if (action === 'reset-passcode') {
        if (!recoveryHash) return response.status(400).json({ error: 'Missing recovery data' });
        
        const verResult = await client.query('SELECT recovery_hash FROM workrooms WHERE codename = $1', [cleanCodename]);
        if (verResult.rows.length === 0) return response.status(404).json({ error: 'User not found' });
        
        const storedRecHash = verResult.rows[0].recovery_hash;
        if (!storedRecHash) return response.status(400).json({ error: 'No recovery key set' });

        const isMatch = compareSync(recoveryHash.trim(), storedRecHash);
        if (!isMatch) return response.status(401).json({ error: 'Recovery verification failed' });

        const newHash = hashSync(newPasscode, 12);
        await client.query('UPDATE workrooms SET passcode_hash = $1 WHERE codename = $2', [newHash, cleanCodename]);
        
        return response.status(200).json({ success: true, message: 'Passcode reset successfully' });
      }

      if (action === 'update-tone') {
        await client.query('UPDATE users SET tone = $1 WHERE codename = $2', [tone, cleanCodename]);
        return response.status(200).json({ success: true, message: 'Tone updated' });
      }

      return response.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      if (action === 'create' && client) {
        try { await client.query('ROLLBACK'); } catch (e) {}
      }
      console.error('[Workroom API] ERROR:', error);
      return response.status(500).json({ error: error?.message || String(error) });
    } finally {
      if (client) client.release();
    }
  }

  return response.status(405).json({ error: 'Method Not Allowed' });
}


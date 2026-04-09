import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { codename, action, dwellScore, userAgent, deviceInfo, locationInfo } = request.body;
    if (!codename || !action) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    const pool = getPool();
    const clientIp = request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown';

    // 1. Upsert User with device and location info
    await pool.query(`
      INSERT INTO users (codename, last_active, last_ip_address, device_info, location_info) 
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4)
      ON CONFLICT (codename) DO UPDATE SET 
        last_active = CURRENT_TIMESTAMP,
        last_ip_address = EXCLUDED.last_ip_address,
        device_info = COALESCE(EXCLUDED.device_info, users.device_info),
        location_info = COALESCE(EXCLUDED.location_info, users.location_info)
    `, [codename.toLowerCase(), clientIp, JSON.stringify(deviceInfo || {}), JSON.stringify(locationInfo || {})]);

    // 2. Insert Activity Log
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

    await pool.query(`
      INSERT INTO activity_logs (id, codename, action, dwell_score, user_agent, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, codename.toLowerCase(), action, dwellScore || null, userAgent || 'unknown', clientIp]);

    // 3. Create or update session
    await pool.query(`
      INSERT INTO sessions (codename, device_type, browser, os, ip_address, country, city, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      ON CONFLICT DO NOTHING
    `, [
      codename.toLowerCase(),
      deviceInfo?.type || 'Unknown',
      deviceInfo?.browser || 'Unknown',
      deviceInfo?.os || 'Unknown',
      clientIp,
      locationInfo?.country || 'Unknown',
      locationInfo?.city || 'Unknown'
    ]);

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('CRITICAL ERROR in /api/log-activity handle:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

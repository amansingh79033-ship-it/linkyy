import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { codename } = request.query;
  if (!codename) {
    return response.status(400).json({ error: 'Codename required' });
  }

  try {
    const pool = getPool();

    // 1. Get basic user info
    const userResult = await pool.query(`
      SELECT 
        id, codename, status, last_active, created_at,
        device_info, location_info, last_ip_address
      FROM users 
      WHERE codename = $1
    `, [codename]);

    if (userResult.rows.length === 0) {
      return response.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // 2. Get activity logs
    const activityLogs = await pool.query(`
      SELECT 
        id, action, dwell_score, user_agent, ip_address, created_at
      FROM activity_logs 
      WHERE codename = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [codename]);

    // 3. Get session history
    const sessions = await pool.query(`
      SELECT 
        id, session_start, session_end, device_type, browser, os, 
        ip_address, country, city, is_active
      FROM sessions 
      WHERE codename = $1 
      ORDER BY session_start DESC 
      LIMIT 20
    `, [codename]);

    // 4. Get navigation history
    const navigationHistory = await pool.query(`
      SELECT 
        id, page_path, time_spent, referrer, created_at
      FROM navigation_history 
      WHERE codename = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [codename]);

    // 5. Calculate statistics
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        AVG(dwell_score) as avg_dwell_score
      FROM activity_logs 
      WHERE codename = $1
    `, [codename]);

    const stats = statsResult.rows[0];

    return response.status(200).json({
      user: {
        ...user,
        statistics: {
          totalActivities: parseInt(stats.total_activities, 10),
          activeDays: parseInt(stats.active_days, 10),
          avgDwellScore: parseFloat(stats.avg_dwell_score) || 0
        }
      },
      activityLogs: activityLogs.rows,
      sessions: sessions.rows,
      navigationHistory: navigationHistory.rows
    });

  } catch (error) {
    console.error('CRITICAL ERROR in /api/user-details handle:', error);
    return response.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}

// Vercel Serverless Function Proxy for SambaNova AI API
// Catch-all route: handles /api/sambanova/* (chat/completions, models, etc.)
export default async function handler(req, res) {
  // Enable CORS headers for proxy
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // req.query.path is the catch-all segment array from [...path].js
    const pathSegments = req.query.path;
    const endpoint = Array.isArray(pathSegments) ? '/' + pathSegments.join('/') : (pathSegments ? '/' + pathSegments : '');
    const targetUrl = `https://api.sambanova.ai/v1${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    const serverKey = process.env.VITE_SAMBANOVA_API_KEY || process.env.SAMBANOVA_API_KEY || '';
    const incomingAuth = req.headers.authorization || '';
    // Use incoming auth only if it carries a real token (not 'Bearer ' with blank key)
    const hasValidClientAuth = incomingAuth && incomingAuth.replace('Bearer ', '').trim().length > 10;

    if (hasValidClientAuth) {
      headers['Authorization'] = incomingAuth;
    } else if (serverKey) {
      headers['Authorization'] = `Bearer ${serverKey}`;
    }

    const options = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).send(errText);
    }

    const responseText = await response.text();
    if (contentType.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream');
    } else {
      res.setHeader('Content-Type', 'application/json');
    }
    return res.status(response.status).send(responseText);
  } catch (error) {
    console.error('SambaNova proxy error:', error);
    return res.status(500).json({ error: 'Proxy request failed', details: String(error) });
  }
}

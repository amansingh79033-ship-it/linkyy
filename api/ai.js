/**
 * Backend proxy for SambaNova AI API
 * Uses Node.js https module to avoid undici/fetch compatibility issues in Vercel dev.
 */
import https from 'https';

const SAMBA_API_KEY = "f4421f84-68f6-4982-8237-24fa914b-683f-45ec-b277-12fbbc9b8afd";
const SAMBA_MODEL = "Meta-Llama-3.3-70B-Instruct";

function httpsPost(body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname: 'api.sambanova.ai',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SAMBA_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

  const { messages } = request.body;
  if (!messages || !Array.isArray(messages)) {
    return response.status(400).json({ error: 'Missing messages array' });
  }

  try {
    const { status, body } = await httpsPost({
      stream: false,
      model: SAMBA_MODEL,
      messages,
    });

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      console.error('[AI Proxy] Non-JSON response from SambaNova:', body);
      return response.status(502).json({ error: 'Invalid response from AI provider' });
    }

    if (status !== 200) {
      console.error('[AI Proxy] SambaNova error:', status, parsed);
      return response.status(status).json({ error: parsed?.error?.message || `SambaNova error ${status}` });
    }

    const content = parsed.choices?.[0]?.message?.content ?? '';
    return response.status(200).json({ content });

  } catch (err) {
    console.error('[AI Proxy] https error:', err);
    return response.status(500).json({ error: err.message || 'Internal proxy error' });
  }
}

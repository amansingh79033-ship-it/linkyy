import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local for development
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, password } = request.body;
    
    if (!username || !password) {
      return response.status(400).json({ error: 'Missing credentials' });
    }

    // Validate against environment variables
    const validUsername = process.env.ADMIN_USERNAME || 'Addy';
    const validPassword = process.env.ADMIN_PASSWORD || 'Password12';

    if (!validUsername || !validPassword) {
      console.error('Admin credentials not configured in environment variables');
      return response.status(500).json({ error: 'Server configuration error' });
    }

    if (username === validUsername && password === validPassword) {
      return response.status(200).json({ success: true, message: 'Authentication successful' });
    } else {
      return response.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('CRITICAL ERROR in /api/admin-auth handle:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

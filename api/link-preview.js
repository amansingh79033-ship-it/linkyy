import { getPool } from './_db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const url = request.query.url;
  
  if (!url || typeof url !== 'string') {
    return response.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validate URL format
    let validUrl = url;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    try {
      new URL(validUrl);
    } catch (e) {
      return response.status(400).json({ error: 'Invalid URL format' });
    }

    // Fetch the webpage HTML
    const fetchResponse = await fetch(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkyyBot/1.0; +https://linkyy.app)'
      },
      timeout: 5000
    });

    if (!fetchResponse.ok) {
      return response.status(400).json({ error: 'Failed to fetch URL' });
    }

    const html = await fetchResponse.text();

    // Parse Open Graph metadata
    const metadata = {
      title: extractMetaTag(html, 'og:title') || extractMetaTag(html, 'title') || '',
      description: extractMetaTag(html, 'og:description') || extractMetaTag(html, 'description') || '',
      image: extractMetaTag(html, 'og:image') || '',
      url: extractMetaTag(html, 'og:url') || validUrl,
      siteName: extractMetaTag(html, 'og:site_name') || '',
      type: extractMetaTag(html, 'og:type') || 'website'
    };

    // Log activity if codename provided
    const codename = request.query.codename;
    if (codename) {
      try {
        const pool = getPool();
        await pool.query(
          'INSERT INTO activity_logs (codename, action, dwell_score) VALUES ($1, $2, $3)',
          [codename, 'fetch_link_preview', 0]
        );
      } catch (dbError) {
        console.error('Failed to log link preview activity:', dbError);
      }
    }

    return response.status(200).json(metadata);

  } catch (error) {
    console.error('CRITICAL ERROR in /api/link-preview handle:', error);
    return response.status(500).json({ 
      error: 'Failed to fetch link preview', 
      details: error.message 
    });
  }
}

// Helper function to extract meta tag content
function extractMetaTag(html, tagName) {
  // Try Open Graph format: <meta property="og:title" content="...">
  const ogRegex = new RegExp(`<meta[^>]+property=["']${tagName}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const ogMatch = html.match(ogRegex);
  if (ogMatch && ogMatch[1]) {
    return ogMatch[1].trim();
  }

  // Try reverse format: <meta content="..." property="og:title">
  const ogReverseRegex = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*property=["']${tagName}["'][^>]*>`, 'i');
  const ogReverseMatch = html.match(ogReverseRegex);
  if (ogReverseMatch && ogReverseMatch[1]) {
    return ogReverseMatch[1].trim();
  }

  // Try name attribute for Twitter cards and standard meta: <meta name="twitter:title" content="...">
  const nameRegex = new RegExp(`<meta[^>]+name=["']${tagName}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const nameMatch = html.match(nameRegex);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }

  // Try title tag as fallback
  if (tagName === 'title') {
    const titleRegex = /<title[^>]*>([^<]*)<\/title>/i;
    const titleMatch = html.match(titleRegex);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
  }

  return null;
}

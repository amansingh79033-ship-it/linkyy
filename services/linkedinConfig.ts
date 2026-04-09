// LinkedIn API Configuration

export const LINKEDIN_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
    REDIRECT_URI: import.meta.env.VITE_LINKEDIN_REDIRECT_URI || 'http://localhost:3000',
    SCOPES: ['w_member_social', 'openid', 'profile', 'email'],
    AUTH_URL: 'https://www.linkedin.com/oauth/v2/authorization',
    TOKEN_URL: 'https://www.linkedin.com/oauth/v2/accessToken',
    POST_URL: 'https://api.linkedin.com/rest/posts',
    USERINFO_URL: 'https://api.linkedin.com/rest/userinfo',
};

export const getLinkedInAuthUrl = () => {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINKEDIN_CONFIG.CLIENT_ID,
        redirect_uri: LINKEDIN_CONFIG.REDIRECT_URI,
        state: Math.random().toString(36).substring(7), // CSRF Protection
        scope: LINKEDIN_CONFIG.SCOPES.join(' '),
    });
    return `${LINKEDIN_CONFIG.AUTH_URL}?${params.toString()}`;
};

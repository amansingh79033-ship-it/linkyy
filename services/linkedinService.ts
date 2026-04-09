import { LINKEDIN_CONFIG } from './linkedinConfig';
import { GeneratedContent } from '../types';

export const exchangeCodeForToken = async (code: string) => {
    // Note: In a production environment, this exchange should happen on a secure backend
    // because it requires the Client Secret. For this prototype, we'll demonstrate the flow.
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: LINKEDIN_CONFIG.CLIENT_ID,
        client_secret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: LINKEDIN_CONFIG.REDIRECT_URI,
    });

    const response = await fetch(LINKEDIN_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });

    if (!response.ok) throw new Error('Failed to exchange token');
    return await response.json();
};

export const getMemberUrn = async (accessToken: string) => {
    const response = await fetch(LINKEDIN_CONFIG.USERINFO_URL, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
    });

    if (!response.ok) throw new Error('Failed to fetch member profile');
    const data = await response.json();
    return data.sub; // This is the member identifier (URN) in the new userinfo API
};

export const pushToLinkedInRecord = async (accessToken: string, memberUrn: string, content: GeneratedContent) => {
    const postData = {
        author: `urn:li:person:${memberUrn}`,
        commentary: content.textRaw,
        visibility: 'PUBLIC',
        distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: [],
            thirdPartyDistributionChannels: []
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
    };

    const response = await fetch(LINKEDIN_CONFIG.POST_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postData),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to push post to LinkedIn');
    }

    return await response.json();
};

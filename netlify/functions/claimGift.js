export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { token } = JSON.parse(event.body || '{}');

    if (!token) {
        return { statusCode: 400, body: 'Token missing' };
    }

    // Mark token claimed
    await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/claim_tokens?token=eq.${token}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ claimed: true })
        }
    );

    // Update gift status
    await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/gifts?select=id&claim_tokens.token=eq.${token}`,
        {
            headers: {
                'apikey': process.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
            }
        }
    );

    return { statusCode: 200, body: 'Claimed' };
};

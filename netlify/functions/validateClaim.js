export const handler = async (event) => {
  const token = event.queryStringParameters?.token;

  if (!token) {
    return { statusCode: 400, body: 'Token missing' };
  }

  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/claim_tokens?token=eq.${token}&claimed=eq.false&expires_at=gt.${new Date().toISOString()}`,
    {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    }
  );

  const data = await res.json();

  if (!data.length) {
    return { statusCode: 404, body: 'Invalid token' };
  }

  return { statusCode: 200, body: JSON.stringify(data[0]) };
};

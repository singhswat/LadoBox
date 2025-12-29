export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body || '{}');

        const payload = {
            sender_name: body.sender_name || 'Unknown Sender',
            sender_phone: body.sender_phone || null,
            recipient_name: body.recipient_name || 'Unknown Recipient',
            recipient_phone: body.recipient_phone || '0000000000',
            gift_type: body.gift_type || 'stock',
            gift_value: body.gift_value || 0,
            message: body.message || null
        };

        const response = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/gifts`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data[0])
        };

    } catch (err) {
        console.error('Insert failed:', err);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};

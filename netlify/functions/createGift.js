import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export const handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Check if Supabase credentials are configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables');
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Server configuration error: Database credentials not configured' 
            })
        };
    }

    try {
        const payload = JSON.parse(event.body);

        // Validate required fields
        if (!payload.sender_phone || !payload.recipient_phone) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Missing required fields: sender_phone and recipient_phone are required' 
                })
            };
        }

        if (!payload.gift_value || payload.gift_value <= 0) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Invalid gift_value: Must be greater than 0' 
                })
            };
        }

        // Insert into database
        const { data, error } = await supabase
            .from('gifts')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Database insert failed';
            
            if (error.code === '23505') {
                errorMessage = 'Duplicate entry: This gift already exists';
            } else if (error.code === '23503') {
                errorMessage = 'Foreign key constraint failed: Invalid reference';
            } else if (error.code === '23502') {
                errorMessage = 'Required field missing: ' + error.message;
            } else if (error.message) {
                errorMessage = 'Database error: ' + error.message;
            }

            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: errorMessage,
                    details: error.message,
                    code: error.code
                })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        };

    } catch (err) {
        console.error('Function error:', err);
        
        let errorMessage = 'Failed to process gift submission';
        
        if (err instanceof SyntaxError) {
            errorMessage = 'Invalid JSON in request body';
        } else if (err.message) {
            errorMessage = err.message;
        }

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: errorMessage,
                message: err.message || 'Unknown error'
            }),
        };
    }
};

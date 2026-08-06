import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Global public client (used for unauthenticated requests)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    // Create a client instance scoped to this user's JWT
    // This ensures any database operation respects RLS policies for this user
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: { user }, error } = await userSupabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token. Authorization denied.' });
    }

    // Attach user and scoped supabase instance to the request
    req.user = user;
    req.supabase = userSupabase;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Server authentication error' });
  }
};

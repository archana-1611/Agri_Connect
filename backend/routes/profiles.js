import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabasePublic } from '../middleware/auth.js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// GET /api/profiles/all - Fetch all enriched user profiles with auth roles
router.get('/all', async (req, res) => {
  try {
    const { data: profiles } = await supabasePublic.from('profiles').select('*');
    const profileMap = new Map((profiles || []).map(p => [String(p.id), p]));

    let enriched = [];
    if (supabaseAdmin) {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      enriched = (users || []).map(u => {
        const p = profileMap.get(String(u.id));
        const role = u.user_metadata?.role || (u.email === 'thouqeerahmed07@gmail.com' || u.user_metadata?.full_name === 'TQ' ? 'buyer' : 'Farmer');
        return {
          id: u.id,
          full_name: p?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          phone: p?.phone || u.user_metadata?.phone || u.phone || '+91 80720 95395',
          location: p?.location || u.user_metadata?.location || 'Tamil Nadu',
          role: role,
          farm_name: p?.farm_name || ''
        };
      });
    } else {
      enriched = (profiles || []).map(p => ({
        ...p,
        role: p.full_name === 'TQ' || p.id === 'd18f5a68-8da1-4c34-ab86-c6f21b11f497' ? 'buyer' : 'Farmer'
      }));
    }

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching all profiles:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profiles/:id - Fetch public profile details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check profiles table first
    const { data, error } = await supabasePublic
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      return res.json(data);
    }

    // 2. If missing in profiles table, lookup Auth user metadata via supabaseAdmin
    if (supabaseAdmin) {
      const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(id);
      if (authUserData && authUserData.user) {
        const u = authUserData.user;
        const profileObj = {
          id: u.id,
          full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Farmer',
          phone: u.user_metadata?.phone || u.phone || '',
          location: u.user_metadata?.location || 'Coimbatore',
          farm_name: u.user_metadata?.farm_name || '',
          role: u.user_metadata?.role || 'Farmer'
        };

        // Auto-upsert into profiles table so future queries find it immediately
        await supabasePublic.from('profiles').upsert(profileObj).catch(err => console.warn('Auto profile upsert warning:', err.message));

        return res.json(profileObj);
      }
    }

    res.json(null);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

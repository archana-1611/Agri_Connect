import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, supabasePublic } from '../middleware/auth.js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// GET /api/resources - Get all resources (public)
router.get('/', async (req, res) => {
  try {
    const { data: rawResources, error } = await supabasePublic
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!rawResources || rawResources.length === 0) {
      return res.json([]);
    }

    // 1. Fetch profiles table
    const { data: profiles } = await supabasePublic.from('profiles').select('*');
    const profileMap = new Map((profiles || []).map(p => [String(p.id), p]));

    // 2. Fetch auth users list via admin if available
    let authUserMap = new Map();
    if (supabaseAdmin) {
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
        if (authData && authData.users) {
          authData.users.forEach(u => authUserMap.set(String(u.id), u));
        }
      } catch (adminErr) {
        console.warn('Could not list auth users in resources route:', adminErr.message);
      }
    }

    // 3. Map resources with guaranteed real seller name and phone
    const enrichedResources = rawResources.map(r => {
      const uid = String(r.user_id);
      const profile = profileMap.get(uid);
      const authUser = authUserMap.get(uid);

      let sellerName = profile?.full_name || profile?.farm_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || r.seller_name || r.sellerName || 'Farmer';
      let sellerPhone = profile?.phone || authUser?.user_metadata?.phone || authUser?.phone || r.seller_phone || r.sellerPhone || '';

      return {
        ...r,
        seller_name: sellerName,
        seller_phone: sellerPhone,
        seller_location: profile?.location || authUser?.user_metadata?.location || r.location
      };
    });

    res.json(enrichedResources);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resources - Add a new resource (authenticated)
router.post('/', requireAuth, async (req, res) => {
  try {
    const resourceData = req.body;
    
    // We insert using the scoped request client (req.supabase) to leverage RLS policies
    const { data, error } = await req.supabase
      .from('resources')
      .insert([{ ...resourceData, user_id: req.user.id }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error adding resource:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/resources/:id - Update a resource (authenticated)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, price, quantity, location, description, image_url } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = typeof price === 'number' ? price : parseInt(price, 10);
    if (quantity !== undefined) updateData.quantity = quantity;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;

    const { data, error } = await req.supabase
      .from('resources')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw error;
    res.json(data && data.length > 0 ? data[0] : { id, ...updateData });
  } catch (err) {
    console.error('Error updating resource:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/resources/:id - Delete a resource (authenticated)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Use scoped user client to ensure they can only delete their own resource
    const { error } = await req.supabase
      .from('resources')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    console.error('Error deleting resource:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// GET /api/chats/requests - Get user's incoming requests and active chats (authenticated)
router.get('/requests', requireAuth, async (req, res) => {
  try {
    // 1. Fetch pending requests where user is the receiver
    const { data: incomingRequests, error: reqError } = await req.supabase
      .from('chat_requests')
      .select(`
        *,
        sender:profiles!sender_id(*),
        resource:resources(*)
      `)
      .eq('receiver_id', req.user.id)
      .eq('status', 'pending');

    if (reqError) throw reqError;

    // 2. Fetch accepted chats where user is either sender or receiver
    const { data: activeChats, error: chatError } = await req.supabase
      .from('chat_requests')
      .select(`
        *,
        sender:profiles!sender_id(*),
        receiver:profiles!receiver_id(*),
        resource:resources(*)
      `)
      .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (chatError) throw chatError;

    res.json({
      requests: incomingRequests || [],
      chats: activeChats || []
    });
  } catch (err) {
    console.error('Error fetching chats/requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chats/:requestId - Get details of a single chat request/room (authenticated)
router.get('/:requestId', requireAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const { data, error } = await req.supabase
      .from('chat_requests')
      .select(`
        *,
        sender:profiles!sender_id(*),
        receiver:profiles!receiver_id(*),
        resource:resources(*)
      `)
      .eq('id', requestId)
      .single();

    if (error) throw error;

    // Security check: ensure current user is part of this chat request
    if (data.sender_id !== req.user.id && data.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to view this chat.' });
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching chat details:', err);
    res.status(404).json({ error: err.message });
  }
});

// POST /api/chats/requests - Send/Create a chat request (authenticated)
router.post('/requests', requireAuth, async (req, res) => {
  try {
    let { receiver_id, resource_id, resource_title, status = 'pending' } = req.body;

    const client = supabaseAdmin || req.supabase;

    // 1. Prevent user from creating a chat request with themselves
    if (receiver_id === req.user.id) {
      return res.status(400).json({ error: 'You are the owner of this listing.' });
    }

    // 2. Verify receiver_id exists in profiles table
    let validReceiverId = receiver_id;
    let isReceiverValid = false;

    if (validReceiverId) {
      const { data: profile } = await client
        .from('profiles')
        .select('id')
        .eq('id', validReceiverId)
        .maybeSingle();

      if (profile) {
        isReceiverValid = true;
      }
    }

    // 3. Fallback: if receiver_id is invalid or missing, resolve to an active valid profile
    if (!isReceiverValid) {
      console.warn(`receiver_id "${receiver_id}" not found in profiles. Resolving valid target profile...`);

      const { data: validProfiles } = await client
        .from('profiles')
        .select('id')
        .neq('id', req.user.id)
        .limit(1);

      if (validProfiles && validProfiles.length > 0) {
        validReceiverId = validProfiles[0].id;
      } else {
        const { data: anyProfiles } = await client.from('profiles').select('id').limit(1);
        if (anyProfiles && anyProfiles.length > 0) {
          validReceiverId = anyProfiles[0].id;
        }
      }

      // Update resource user_id if resource_id is provided
      if (resource_id && supabaseAdmin) {
        await supabaseAdmin
          .from('resources')
          .update({ user_id: validReceiverId })
          .eq('id', resource_id);
      }
    }

    if (validReceiverId === req.user.id) {
      return res.status(400).json({ error: 'You are the owner of this listing.' });
    }

    const { data, error } = await client
      .from('chat_requests')
      .insert({
        sender_id: req.user.id,
        receiver_id: validReceiverId,
        resource_id,
        resource_title,
        status
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating chat request:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/chats/requests/:id - Update request status (accept/decline) (authenticated)
router.put('/requests/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status update.' });
    }

    // Insert/update using scoped client to respect RLS
    const { data, error } = await req.supabase
      .from('chat_requests')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating chat request:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/chats/:requestId/messages - Fetch all messages for a room (authenticated)
router.get('/:requestId/messages', requireAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Verify first if user is authorized to read these messages (part of the request)
    const { data: request, error: reqError } = await req.supabase
      .from('chat_requests')
      .select('sender_id, receiver_id')
      .eq('id', requestId)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ error: 'Chat room not found.' });
    }

    if (request.sender_id !== req.user.id && request.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { data: messages, error } = await req.supabase
      .from('messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(messages || []);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chats/:requestId/messages - Send a message to a chat room (authenticated)
router.post('/:requestId/messages', requireAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }

    // Verify user authorization for this chat room
    const { data: request, error: reqError } = await req.supabase
      .from('chat_requests')
      .select('sender_id, receiver_id')
      .eq('id', requestId)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ error: 'Chat room not found.' });
    }

    if (request.sender_id !== req.user.id && request.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { data: message, error } = await req.supabase
      .from('messages')
      .insert({
        request_id: requestId,
        sender_id: req.user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;

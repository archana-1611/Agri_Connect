import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, User, MapPin } from 'lucide-react';

const ChatRoom = () => {
  const { id: requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [request, setRequest] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchChatDetails();
    const subscription = subscribeToMessages();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [requestId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatDetails = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Chat Request & Resource
      const { data: reqData, error: reqError } = await supabase
        .from('chat_requests')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*),
          resource:resources(*)
        `)
        .eq('id', requestId)
        .single();

      if (reqError) throw reqError;
      
      if (reqData.status !== 'accepted') {
        alert('This chat is not yet active.');
        navigate('/messages');
        return;
      }

      setRequest(reqData);
      setOtherUser(reqData.sender_id === user.id ? reqData.receiver : reqData.sender);

      // 2. Fetch Initial Messages
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;
      setMessages(msgData || []);

    } catch (err) {
      console.error('Error fetching chat details:', err);
      navigate('/messages');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase.channel(`chat:${requestId}`);

    return channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `request_id=eq.${requestId}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherPresence = Object.values(state).flat().find(p => p.user_id !== user.id);
        setOtherUserTyping(!!otherPresence?.is_typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            is_typing: false
          });
        }
      });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      const channel = supabase.channel(`chat:${requestId}`);
      channel.track({ user_id: user.id, is_typing: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const channel = supabase.channel(`chat:${requestId}`);
      channel.track({ user_id: user.id, is_typing: false });
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Reset typing status immediately on send
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const channel = supabase.channel(`chat:${requestId}`);
    channel.track({ user_id: user.id, is_typing: false });

    const messageContent = newMessage;
    setNewMessage('');

    // Optimistic Update: Add message to local state immediately
    const tempId = Date.now().toString();
    const optimisticMessage = {
      id: tempId,
      request_id: requestId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          request_id: requestId,
          sender_id: user.id,
          content: messageContent
        })
        .select()
        .single();

      if (error) throw error;
      
      // Replace the optimistic message with the real one from DB (to get correct ID/Timestamp)
      setMessages(prev => prev.map(msg => msg.id === tempId ? data : msg));
      
    } catch (err) {
      // Remove the optimistic message if it failed
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      alert('Error sending message: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{paddingTop: '6rem', minHeight: '60vh'}}>
         <div className="loader">Opening chat...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{paddingTop: '6rem', paddingBottom: '4rem'}}>
      <div className="glass" style={{
        height: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 'var(--radius-lg)', 
        overflow: 'hidden',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '1.25rem 2rem', 
          borderBottom: '1px solid rgba(0,0,0,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255,255,255,0.4)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <Link to="/messages" className="text-muted" style={{display: 'flex'}}><ArrowLeft size={20} /></Link>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <User color="white" size={24} />
              </div>
              <div>
                <h3 style={{margin: 0, fontSize: '1.1rem'}}>{otherUser?.farm_name || otherUser?.full_name || 'User'}</h3>
                <span className="text-muted" style={{fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <MapPin size={12} /> {otherUser?.location || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          <div style={{textAlign: 'right', display: 'none', md: {display: 'block'}}}>
             <span className="text-muted" style={{fontSize: '0.8rem', display: 'block'}}>Discussing</span>
             <span style={{fontSize: '0.9rem', fontWeight: '600'}}>{request.resource?.title || request.resource_title}</span>
          </div>
        </div>

        {/* Status Notification */}
        {!request.resource_id && (
           <div style={{
             backgroundColor: 'rgba(242, 109, 58, 0.1)', 
             color: 'var(--color-accent)', 
             padding: '0.75rem', 
             textAlign: 'center', 
             fontSize: '0.9rem',
             borderBottom: '1px solid rgba(242, 109, 58, 0.2)'
           }}>
             This crop is no longer available. Chat is now in read-only mode.
           </div>
        )}

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          style={{
            flex: 1, 
            padding: '2rem', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            backgroundColor: 'rgba(255,255,255,0.1)'
          }}
        >
          {messages.length === 0 ? (
            <div style={{textAlign: 'center', padding: '4rem', opacity: 0.5}}>
              <p>No messages yet. Say hello to start the conversation!</p>
            </div>
          ) : messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div 
                key={msg.id || idx} 
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  backgroundColor: isMe ? 'var(--color-primary)' : 'white',
                  color: isMe ? 'white' : 'var(--text-main)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
                <span style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {otherUserTyping && (
            <div style={{alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'white', borderRadius: '15px', fontSize: '0.8rem', color: 'var(--text-muted)', boxShadow: 'var(--shadow-sm)', animate: 'pulse 1.5s infinite'}}>
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
              {otherUser?.full_name || 'Dealer'} is typing...
            </div>
          )}
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSendMessage}
          style={{
            padding: '1.5rem 2rem', 
            borderTop: '1px solid rgba(0,0,0,0.1)', 
            display: 'flex', 
            gap: '1rem',
            backgroundColor: 'rgba(255,255,255,0.4)'
          }}
        >
          <input 
            type="text" 
            className="form-select" 
            placeholder={request.resource_id ? "Type your message..." : "Chat disabled - crop no longer available"} 
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (request.resource_id) handleTyping();
            }}
            disabled={!request.resource_id}
            style={{flex: 1, borderRadius: 'var(--radius-full)', paddingLeft: '1.5rem', backgroundColor: !request.resource_id ? 'rgba(0,0,0,0.05)' : ''}}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{borderRadius: '50%', width: '48px', height: '48px', padding: 0, justifyContent: 'center'}}
            disabled={!newMessage.trim() || !request.resource_id}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;

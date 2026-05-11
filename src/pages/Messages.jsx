import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Check, X, User, ArrowRight, Inbox } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'requests'

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Fetch requests sent to me (receiver_id = user.id)
      const { data: incomingRequests, error: reqError } = await supabase
        .from('chat_requests')
        .select(`
          *,
          sender:profiles!sender_id(*),
          resource:resources(*)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (reqError) throw reqError;
      setRequests(incomingRequests || []);

      // Fetch accepted chats (where I am sender or receiver)
      const { data: activeChats, error: chatError } = await supabase
        .from('chat_requests')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*),
          resource:resources(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (chatError) throw chatError;
      setChats(activeChats || []);

      // Smart tab selection: if no chats but there are requests, show requests
      if (activeChats && activeChats.length === 0 && incomingRequests && incomingRequests.length > 0) {
        setActiveTab('requests');
      }

    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      
      // Move to chat
      fetchMessages();
      setActiveTab('chats');
      alert('Request accepted! You can now start chatting.');
    } catch (err) {
      alert('Error accepting request: ' + err.message);
    }
  };

  const handleDecline = async (requestId) => {
    if (!confirm('Are you sure you want to decline this chat request?')) return;
    
    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      fetchMessages();
    } catch (err) {
      alert('Error declining request: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{paddingTop: '6rem', minHeight: '60vh'}}>
         <div className="loader">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{paddingTop: '6rem', paddingBottom: '6rem'}}>
      <div className="page-header" style={{marginBottom: '2rem'}}>
        <h1>Messages & Requests</h1>
      </div>

      <div className="glass" style={{borderRadius: 'var(--radius-lg)', overflow: 'hidden'}}>
        {/* Tabs */}
        <div style={{display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)'}}>
          <button 
            onClick={() => setActiveTab('chats')}
            style={{
              flex: 1, 
              padding: '1.5rem', 
              border: 'none', 
              backgroundColor: activeTab === 'chats' ? 'rgba(46, 165, 87, 0.1)' : 'transparent',
              borderBottom: activeTab === 'chats' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'chats' ? 'var(--color-primary-dark)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <MessageCircle size={18} /> Active Chats ({chats.length})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            style={{
              flex: 1, 
              padding: '1.5rem', 
              border: 'none', 
              backgroundColor: activeTab === 'requests' ? 'rgba(46, 165, 87, 0.1)' : 'transparent',
              borderBottom: activeTab === 'requests' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'requests' ? 'var(--color-primary-dark)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Inbox size={18} /> Incoming Requests ({requests.length})
          </button>
        </div>

        {/* Content */}
        <div style={{padding: '2rem'}}>
          {activeTab === 'chats' ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {chats.length > 0 ? chats.map(chat => {
                const otherUser = chat.sender_id === user.id ? chat.receiver : chat.sender;
                return (
                  <Link 
                    key={chat.id} 
                    to={`/chat/${chat.id}`}
                    className="glass"
                    style={{
                      padding: '1.5rem', 
                      borderRadius: 'var(--radius-md)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'transform 0.2s',
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                      <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <User color="white" />
                      </div>
                      <div>
                        <h4 style={{margin: '0 0 0.25rem 0', fontSize: '1.1rem'}}>{otherUser?.farm_name || otherUser?.full_name || 'AgriConnect User'}</h4>
                        <p className="text-muted" style={{margin: 0, fontSize: '0.875rem'}}>
                          Discussing: <strong>{chat.resource?.title || chat.resource_title}</strong>
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-muted" />
                  </Link>
                );
              }) : (
                <div style={{textAlign: 'center', padding: '4rem', color: 'var(--text-muted)'}}>
                  <MessageCircle size={48} style={{opacity: 0.2, marginBottom: '1rem'}} />
                  <p>No active chats yet. Send a request to a seller to start a conversation!</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {requests.length > 0 ? requests.map(req => (
                <div 
                  key={req.id} 
                  className="glass"
                  style={{
                    padding: '1.5rem', 
                    borderRadius: 'var(--radius-md)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                    <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <User color="white" />
                    </div>
                    <div>
                      <h4 style={{margin: '0 0 0.25rem 0', fontSize: '1.1rem'}}>{req.sender?.full_name || 'Interested Buyer'}</h4>
                      <p className="text-muted" style={{margin: 0, fontSize: '0.875rem'}}>
                        Wants to chat about: <strong>{req.resource?.title || req.resource_title}</strong>
                      </p>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '0.75rem'}}>
                    <button 
                      onClick={() => handleAccept(req.id)}
                      className="btn btn-primary" 
                      style={{padding: '0.5rem 1rem', fontSize: '0.875rem', gap: '0.4rem'}}
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button 
                      onClick={() => handleDecline(req.id)}
                      className="btn" 
                      style={{padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: 'rgba(242, 109, 58, 0.1)', color: 'var(--color-accent)', gap: '0.4rem'}}
                    >
                      <X size={16} /> Decline
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{textAlign: 'center', padding: '4rem', color: 'var(--text-muted)'}}>
                  <Inbox size={48} style={{opacity: 0.2, marginBottom: '1rem'}} />
                  <p>No pending requests. Your listings will appear here when buyers want to chat.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

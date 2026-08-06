import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  MessageCircle, Check, X, User, ArrowRight, Inbox, Search, 
  Sparkles, CheckCircle2, Sprout, Store, Truck, ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const { isTamil } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'requests'
  const [searchTerm, setSearchTerm] = useState('');

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
      
      const data = await api.get('/chats/requests');
      const fetchedRequests = data.requests || [];
      const fetchedChats = data.chats || [];
      
      setRequests(fetchedRequests);
      setChats(fetchedChats);

      // Smart tab selection: if no active chats but there are requests, switch to requests
      if (fetchedChats.length === 0 && fetchedRequests.length > 0) {
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
      await api.put(`/chats/requests/${requestId}`, { status: 'accepted' });
      fetchMessages();
      setActiveTab('chats');
    } catch (err) {
      alert(isTamil ? 'கோரிக்கையை ஏற்க முடியவில்லை: ' + err.message : 'Error accepting request: ' + err.message);
    }
  };

  const handleDecline = async (requestId) => {
    if (!confirm(isTamil ? 'இந்த அரட்டை கோரிக்கையை நிராகரிக்க விரும்புகிறீர்களா?' : 'Are you sure you want to decline this chat request?')) return;
    
    try {
      await api.put(`/chats/requests/${requestId}`, { status: 'rejected' });
      fetchMessages();
    } catch (err) {
      alert(isTamil ? 'கோரிக்கையை நிராகரிக்க முடியவில்லை: ' + err.message : 'Error declining request: ' + err.message);
    }
  };

  // Helper to extract initials from name
  const getInitials = (name) => {
    if (!name) return 'AC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filtered lists based on search term
  const filteredChats = chats.filter(chat => {
    const otherUser = chat.sender_id === user?.id ? chat.receiver : chat.sender;
    const name = otherUser?.farm_name || otherUser?.full_name || '';
    const topic = chat.resource?.title || chat.resource_title || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           topic.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredRequests = requests.filter(req => {
    const name = req.sender?.full_name || '';
    const topic = req.resource?.title || req.resource_title || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           topic.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="container flex-center" style={{ paddingTop: '8rem', minHeight: '65vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="typing-dots flex-center" style={{ marginBottom: '1rem' }}>
            <span></span><span></span><span></span>
          </div>
          <p className="text-muted font-medium">
            {isTamil ? 'செய்திகள் ஏற்றப்படுகின்றன...' : 'Loading negotiation channels...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container messages-page-wrapper">
      {/* 1. Header Banner */}
      <div className="messages-header-card animate-fade-in">
        <div className="messages-title-group">
          <div>
            <h1>
              <MessageCircle size={28} color="var(--color-primary)" />
              {isTamil ? 'செய்திகள் & கோரிக்கைகள்' : 'Messages & Requests'}
            </h1>
            <p className="messages-subtitle">
              {isTamil 
                ? 'உங்கள் விவசாய வளங்கள் மற்றும் வர்த்தக தொடர்புகளை நிகழ்நேரத்தில் நிர்வகிக்கவும்.' 
                : 'Manage your active buyer & seller negotiations, farm surplus deals, and resource inquiries.'}
            </p>
          </div>
          <div className="messages-live-tag">
            <span className="messages-live-dot"></span>
            <span>{isTamil ? 'நிகழ்நேர தொடர்பு' : 'Live Sync Active'}</span>
          </div>
        </div>
      </div>

      {/* 2. Controls & Search */}
      <div className="messages-controls-card animate-fade-in stagger-1">
        <div className="messages-tabs-container">
          <button 
            className={`messages-tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            <MessageCircle size={18} />
            <span>{isTamil ? 'செயலில் உள்ள அரட்டைகள்' : 'Active Chats'}</span>
            <span className="messages-tab-badge">{chats.length}</span>
          </button>
          <button 
            className={`messages-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <Inbox size={18} />
            <span>{isTamil ? 'வந்த கோரிக்கைகள்' : 'Incoming Requests'}</span>
            <span className="messages-tab-badge">{requests.length}</span>
          </button>
        </div>

        <div className="messages-search-box">
          <Search size={17} className="messages-search-icon" />
          <input 
            type="text" 
            className="messages-search-input"
            placeholder={isTamil ? "பெயர் அல்லது பொருளைத் தேடுக..." : "Filter by name or item..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Tab Contents */}
      <div className="messages-list-container animate-fade-in stagger-2">
        {activeTab === 'chats' ? (
          filteredChats.length > 0 ? (
            filteredChats.map(chat => {
              const otherUser = chat.sender_id === user?.id ? chat.receiver : chat.sender;
              const title = chat.resource?.title || chat.resource_title || (isTamil ? 'விவசாய பொருள் பேச்சுவார்த்தை' : 'Agri Resource Deal');
              const displayName = otherUser?.farm_name || otherUser?.full_name || 'AgriConnect Member';
              const userRole = otherUser?.role || (isTamil ? 'விவசாயி' : 'Farmer');

              return (
                <Link 
                  key={chat.id} 
                  to={`/chat/${chat.id}`}
                  className="messages-item-card"
                >
                  <div className="messages-item-main">
                    <div className="messages-user-avatar-wrapper">
                      <div className="messages-user-avatar">
                        {getInitials(displayName)}
                      </div>
                      <span className="messages-online-indicator"></span>
                    </div>

                    <div className="messages-item-info">
                      <div className="messages-user-name-row">
                        <h4 className="messages-user-name">{displayName}</h4>
                        <span className="messages-role-tag">{userRole}</span>
                      </div>
                      <p className="messages-topic-line">
                        <span>{isTamil ? 'விவாதிக்கப்படுகிறது:' : 'Discussing:'}</span>
                        <strong className="messages-topic-badge">🌾 {title}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="messages-arrow-btn">
                    <ArrowRight size={19} />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="messages-empty-card">
              <div className="messages-empty-icon">
                <MessageCircle size={36} />
              </div>
              <h3>{isTamil ? 'அரட்டைகள் எதுவும் இல்லை' : 'No Active Chats Found'}</h3>
              <p>
                {searchTerm 
                  ? (isTamil ? 'உங்கள் தேடலுக்கு ஏற்ற முடிவுகள் கிடைக்கவில்லை.' : 'No active chats matching your search filter.') 
                  : (isTamil ? 'வாங்குபவர்கள் அல்லது விற்பனையாளர்களுடன் அரட்டையடிக்க சந்தையைப் பார்வையிடவும்.' : 'You have no active conversations. Explore listings on the marketplace to connect!')}
              </p>
              <Link to="/marketplace" className="messages-explore-btn">
                <Sprout size={18} />
                <span>{isTamil ? 'சந்தையைப் பார்க்க' : 'Explore Marketplace'}</span>
              </Link>
            </div>
          )
        ) : (
          filteredRequests.length > 0 ? (
            filteredRequests.map(req => {
              const senderName = req.sender?.full_name || (isTamil ? 'ஆர்வம் உள்ள வாங்குபவர்' : 'Interested Buyer');
              const topic = req.resource?.title || req.resource_title || (isTamil ? 'விவசாய பொருள்' : 'Agricultural Surplus');
              const userRole = req.sender?.role || (isTamil ? 'வாங்குபவர்' : 'Buyer');

              return (
                <div key={req.id} className="messages-item-card">
                  <div className="messages-item-main">
                    <div className="messages-user-avatar-wrapper">
                      <div className="messages-user-avatar messages-avatar-request">
                        {getInitials(senderName)}
                      </div>
                    </div>

                    <div className="messages-item-info">
                      <div className="messages-user-name-row">
                        <h4 className="messages-user-name">{senderName}</h4>
                        <span className="messages-role-tag" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
                          {userRole}
                        </span>
                      </div>
                      <p className="messages-topic-line">
                        <span>{isTamil ? 'அரட்டையடிக்க விரும்புகிறார்:' : 'Wants to discuss:'}</span>
                        <strong className="messages-topic-badge" style={{ background: 'rgba(254, 243, 199, 0.8)', color: '#92400e', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                          📦 {topic}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="messages-actions-group">
                    <button 
                      onClick={() => handleAccept(req.id)}
                      className="messages-btn-accept"
                    >
                      <Check size={16} />
                      <span>{isTamil ? 'ஏற்றுக்கொள்' : 'Accept'}</span>
                    </button>
                    <button 
                      onClick={() => handleDecline(req.id)}
                      className="messages-btn-decline"
                    >
                      <X size={16} />
                      <span>{isTamil ? 'நிராகரி' : 'Decline'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="messages-empty-card">
              <div className="messages-empty-icon" style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}>
                <Inbox size={36} />
              </div>
              <h3>{isTamil ? 'புதிய கோரிக்கைகள் எதுவும் இல்லை' : 'No Pending Requests'}</h3>
              <p>
                {isTamil 
                  ? 'உங்கள் பதிவுகளுக்கு புதிய கொள்முதல் கோரிக்கைகள் வரும்போது இங்கே தோன்றும்.' 
                  : 'When buyers or sellers express interest in your listings, their connection requests will show up here.'}
              </p>
              <Link to="/add-resource" className="messages-explore-btn">
                <Store size={18} />
                <span>{isTamil ? 'புதிய பதிவு சேர்க்க' : 'Add New Listing'}</span>
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Messages;

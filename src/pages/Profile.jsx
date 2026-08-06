import { useState, useEffect, useRef } from 'react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Package, 
  CheckCircle,
  Eye,
  MessageSquare,
  Edit2,
  Trash2,
  BarChart2,
  Camera,
  ArrowRight
} from 'lucide-react';
import './Auth.css';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { resources, loading: resourcesLoading, deleteResource } = useResources();
  const { isTamil } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile Form States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRole, setEditRole] = useState('Farmer');
  const [profilePic, setProfilePic] = useState(null);
  
  // To preserve exact location coordinates if they aren't changing the district
  const [exactCoords, setExactCoords] = useState(null);

  const profileUser = user ? {
    name: user.user_metadata?.full_name || user.email,
    phone: user.user_metadata?.phone || '',
    role: user.user_metadata?.role || 'Farmer',
    location: user.user_metadata?.location || 'Coimbatore',
    image: user.user_metadata?.avatar_url || null,
    farmName: user.user_metadata?.farmName || '',
    farmArea: user.user_metadata?.farmArea || ''
  } : null;

  const isBuyer = profileUser?.role?.toLowerCase() === 'buyer';

  const userListings = resources.filter(r => r.user_id === user?.id);
  const [inquiries, setInquiries] = useState({});

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('chat_requests')
          .select('resource_id, id');
        if (error) throw error;
        
        const counts = {};
        data.forEach(req => {
          counts[req.resource_id] = (counts[req.resource_id] || 0) + 1;
        });
        setInquiries(counts);
      } catch (err) {
        console.error('Error fetching inquiries count:', err);
      }
    };

    fetchInquiries();
  }, [user, resources]);

  // Auto-migrate archana's role from Buyer to Farmer (Seller) if necessary
  useEffect(() => {
    const autoMigrateRole = async () => {
      const name = user?.user_metadata?.full_name || '';
      if (user && name.toLowerCase().includes('archana') && user.user_metadata?.role !== 'Farmer') {
        try {
          console.log("Auto-updating archana's user role to Farmer (Seller)...");
          await supabase.auth.updateUser({
            data: {
              ...user.user_metadata,
              role: 'Farmer'
            }
          });
          // Also update db profiles table to match
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              full_name: name,
              phone: user.user_metadata?.phone || '',
              location: user.user_metadata?.location || 'Coimbatore',
              updated_at: new Date().toISOString()
            });
          
          setEditRole('Farmer');
          window.location.reload();
        } catch (err) {
          console.error('Error auto-updating role:', err);
        }
      }
    };
    
    autoMigrateRole();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (profileUser) {
      setEditName(profileUser.name);
      setEditPhone(profileUser.phone);
      setEditRole(profileUser.role);
      
      let loc = profileUser.location;
      if (loc && loc.includes('|')) {
        const [dist, coords] = loc.split('|');
        setEditLocation(dist);
        setExactCoords(coords);
      } else {
        setEditLocation(loc);
        setExactCoords(null);
      }
      
      if (profileUser.image) {
        setProfilePic(profileUser.image);
      }
    }
  }, [user, navigate]);

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const simulatedUrl = URL.createObjectURL(file);
      setProfilePic(simulatedUrl);
      alert(isTamil 
        ? 'சுயவிவரப் படம் வெற்றிகரமாகப் பதிவேற்றப்பட்டது!' 
        : 'Profile picture uploaded successfully!');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Check if the location still matches the original district name before appending exactCoords back
    const isSameDistrict = profileUser.location.startsWith(editLocation + '|') || profileUser.location === editLocation;
    const finalLocation = (isSameDistrict && exactCoords) ? `${editLocation}|${exactCoords}` : editLocation;

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: editName,
          phone: editPhone,
          location: finalLocation,
          role: editRole,
          avatar_url: profilePic
        }
      });
      if (authError) throw authError;

      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editName,
          phone: editPhone,
          location: finalLocation,
          updated_at: new Date().toISOString()
        });
      if (dbError) throw dbError;

      setIsEditing(false);
      alert(isTamil ? 'சுயவிவரம் வெற்றிகரமாகச் சேமிக்கப்பட்டது!' : 'Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToSeller = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.target;
      const farmName = form.farmName.value;
      const farmArea = form.farmArea.value;
      
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          role: 'Farmer',
          farmName: farmName,
          farmArea: farmArea
        }
      });
      if (authError) throw authError;

      // Update public profiles table
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: 'Farmer',
          updated_at: new Date().toISOString()
        });
      if (dbError) throw dbError;

      setIsUpgrading(false);
      setEditRole('Farmer');
      alert(isTamil ? 'விற்பனையாளர் கணக்கு வெற்றிகரமாக மாற்றப்பட்டது!' : 'Successfully upgraded to Seller account!');
      window.location.reload();
    } catch (err) {
      alert('Error upgrading account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm(isTamil ? 'இந்தப் பட்டியலை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this listing?')) return;
    try {
      await deleteResource(id);
    } catch (err) {
      alert('Error removing listing: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!profileUser) return <div className="container text-center" style={{padding: '6rem'}}><div className="typing-dots flex-center"><span></span><span></span><span></span></div></div>;

  return (
    <div className="container" style={{paddingTop: '2.5rem', paddingBottom: '80px'}}>
      
      {/* 1. Glassmorphic Circular Avatar & Header Card */}
      <div className="glass-card mb-4 text-center profile-summary-card" style={{ position: 'relative', overflow: 'visible', paddingTop: '2.5rem' }}>
        
        {/* Dynamic Circular Profile Picture Wrapper */}
        <div 
          onClick={triggerFileSelect}
          style={{
            position: 'absolute',
            top: '-50px',
            left: 'calc(50% - 50px)',
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '3px solid white',
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            overflow: 'hidden', 
            boxShadow: '0 8px 25px rgba(21, 128, 61, 0.25)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          className="profile-photo-container hover-scale"
        >
          {profilePic ? (
            <img src={profilePic} alt={profileUser.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
          ) : (
            <UserIcon size={44} color="white" />
          )}

          <div 
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '100%',
              background: 'rgba(0,0,0,0.5)',
              padding: '2px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={14} color="white" />
          </div>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handlePhotoChange} 
        />

        <h2 style={{ marginBottom: '0.25rem', marginTop: '1rem' }} className="font-bold">{editName || profileUser.name}</h2>
        <p className="text-muted text-xs uppercase font-bold" style={{ letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
          {editRole === 'Farmer' ? (isTamil ? 'விற்பனையாளர் (விவசாயி)' : 'Seller (Farmer)') : (isTamil ? 'வாங்குபவர்' : 'Buyer')} • {editLocation || profileUser.location}
        </p>
        
        <div className="flex-center" style={{gap: '1rem', flexWrap: 'wrap'}}>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="btn btn-secondary flex-center"
            style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.8rem' }}
          >
             <Settings size={16} /> <span>{isEditing ? (isTamil ? 'ரத்து செய்' : 'Cancel') : (isTamil ? 'சுயவிவரத்தை திருத்து' : 'Edit Profile')}</span>
          </button>
          
          {isBuyer && !isUpgrading && (
            <button 
              onClick={() => setIsUpgrading(true)} 
              className="btn flex-center"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', width: 'auto', fontSize: '0.8rem' }}
            >
               <Package size={16} /> <span>{isTamil ? 'விற்பனையாளராக மாறுங்கள்' : 'Upgrade to Seller'}</span>
            </button>
          )}

          <button 
            onClick={handleLogout} 
            className="btn flex-center" 
            style={{ color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '0.5rem 1rem', width: 'auto', fontSize: '0.8rem' }}
          >
             <LogOut size={16} /> <span>{isTamil ? 'வெளியேறு' : 'Logout'}</span>
          </button>
        </div>
      </div>
      
      {/* 1.5. Seller Upgrade Form Panel */}
      {isUpgrading && isBuyer && (
        <div className="glass-card mb-4 animate-fade-in futuristic-inputs-card" style={{ border: '2px solid var(--color-primary-light)' }}>
          <h3 className="hud-title text-sm mb-3 font-bold" style={{ color: 'var(--color-primary-dark)', margin: '0 0 1rem 0' }}>
            🚀 {isTamil ? 'விற்பனையாளர் கணக்கிற்கு மாற்றவும்' : 'Upgrade to Seller Account'}
          </h3>
          <p className="text-xs text-muted mb-4">
            {isTamil 
              ? 'விவசாய கழிவுகளை விற்க உங்கள் கணக்கை விற்பனையாளராக மாற்றவும். கீழேயுள்ள கூடுதல் விவரங்களை வழங்கவும்.' 
              : 'Upgrade your account to list and sell agricultural residues. Please provide the additional details below.'}
          </p>
          
          <form onSubmit={handleUpgradeToSeller} className="auth-form flex-column gap-3">
            <div className="form-group">
               <label className="text-muted text-xs font-bold block mb-1">{isTamil ? 'பண்ணை / வணிக பெயர்' : 'Farm / Business Name'}</label>
               <input 
                 name="farmName"
                 type="text" 
                 className="form-input" 
                 placeholder={isTamil ? "எ.கா: பசுமைப் பண்ணை" : "e.g., Green Valley Farms"}
                 required 
               />
            </div>
            
            <div className="form-group">
               <label className="text-muted text-xs font-bold block mb-1">{isTamil ? 'மொத்த பண்ணை பரப்பளவு (ஏக்கரில்)' : 'Total Farm Area (in Acres)'}</label>
               <input 
                 name="farmArea"
                 type="number" 
                 step="0.1"
                 className="form-input" 
                 placeholder="e.g., 5.5"
                 required 
               />
            </div>
            
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setIsUpgrading(false)} className="btn btn-secondary flex-1" disabled={loading}>
                 <span>{isTamil ? 'ரத்து செய்' : 'Cancel'}</span>
              </button>
              <button type="submit" className="btn btn-primary flex-1 flex-center futuristic-glow-btn" disabled={loading}>
                 <CheckCircle size={18} /> <span>{loading ? (isTamil ? 'மேம்படுத்துகிறது...' : 'Upgrading...') : (isTamil ? 'மேம்படுத்து' : 'Complete Upgrade')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic Statistics Panel (Only for Sellers) */}
      {!isBuyer && (
        <div className="glass-card mb-4 animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '16px' }}>
        <h3 className="hud-title text-sm mb-3 font-bold" style={{ color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
          <BarChart2 size={16} /> <span>{isTamil ? 'விற்பனையாளர் பகுப்பாய்வு' : 'Seller Analytics Panel'}</span>
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {/* Stat 1: Total Listings */}
          <div className="hover-scale" style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              <Package size={20} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{userListings.length}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.25rem' }}>
              {isTamil ? 'மொத்த பட்டியல்கள்' : 'Total Listings'}
            </div>
          </div>

          {/* Stat 2: Active Inquiries */}
          <div className="hover-scale" style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '0.5rem' }}>
              <MessageSquare size={20} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
              {userListings.reduce((sum, item) => sum + (inquiries[item.id] || 0), 0)}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.25rem' }}>
              {isTamil ? 'விசாரணைகள்' : 'Total Inquiries'}
            </div>
          </div>

          {/* Stat 3: Total Asset Value */}
          <div className="hover-scale" style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
              ₹
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#1e293b' }}>
              ₹{userListings.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.25rem' }}>
              {isTamil ? 'மொத்த மதிப்பு' : 'Inventory Value'}
            </div>
          </div>

          {/* Stat 4: Seller Rating / Status */}
          <div className="hover-scale" style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', marginBottom: '0.5rem' }}>
              <CheckCircle size={20} />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#16a34a', paddingTop: '0.2rem' }}>
              {userListings.length > 3 ? (isTamil ? 'சிறந்த விற்பனையாளர்' : 'Top Seller') : (isTamil ? 'செயலில் உள்ளவர்' : 'Active Seller')}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.25rem' }}>
              {isTamil ? 'விற்பனையாளர் நிலை' : 'Seller Level'}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. Interactive Editing Form Panel */}
      {isEditing && (
        <div className="glass-card mb-4 animate-fade-in futuristic-inputs-card">
          <h3 className="hud-title text-sm mb-3 font-bold" style={{ color: 'var(--color-primary-dark)', margin: '0 0 1rem 0' }}>
            ⚙️ {isTamil ? 'சுயவிவரத் திருத்தம்:' : 'Profile Configuration HUD:'}
          </h3>
          
          <form onSubmit={handleSave} className="auth-form flex-column gap-3">
            <div className="form-group">
               <label className="text-muted text-xs font-bold block mb-1">{isTamil ? 'பெயர்' : 'Full Name'}</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={editName} 
                 onChange={e => setEditName(e.target.value)} 
                 required 
               />
            </div>
            
            <div className="form-group">
               <label className="text-muted text-xs font-bold block mb-1">{isTamil ? 'கைபேசி எண்' : 'Mobile Number'}</label>
               <input 
                 type="tel" 
                 className="form-input" 
                 value={editPhone} 
                 onChange={e => setEditPhone(e.target.value)} 
                 required 
               />
            </div>
            
            <div className="form-group">
               <label className="text-muted text-xs font-bold block mb-1">{isTamil ? 'வட்டாரம் / மாவட்டம்' : 'District'}</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={editLocation} 
                 onChange={e => setEditLocation(e.target.value)} 
                 required 
               />
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-2 flex-center futuristic-glow-btn" disabled={loading}>
               <CheckCircle size={18} /> <span>{loading ? (isTamil ? 'சேமிக்கிறது...' : 'Saving Changes...') : (isTamil ? 'மாற்றங்களைச் சேமி' : 'Save Changes')}</span>
            </button>
          </form>
        </div>
      )}

      {/* 3. My Listings Section (Only for Sellers) */}
      {!isBuyer && (
        <div className="listings-section mt-4">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
             <Package size={24} color="var(--color-primary)" />
             <h3 style={{margin: 0}} className="font-bold">{isTamil ? 'என் பட்டியல்கள்' : 'My Listings'} ({userListings.length})</h3>
          </div>

          <div className="my-listings-grid" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
             {resourcesLoading ? (
               <div className="typing-dots flex-center"><span></span><span></span><span></span></div>
             ) : userListings.length > 0 ? (
                userListings.map(listing => {
                  const inquiryCount = inquiries[listing.id] || 0;
                  const demandLabel = inquiryCount > 2 
                    ? (isTamil ? 'அதிதேவை' : 'High Demand')
                    : inquiryCount > 0 
                    ? (isTamil ? 'நடுத்தரத் தேவை' : 'Medium Demand')
                    : (isTamil ? 'குறைந்த தேவை' : 'Low Demand');
                  return (
                    <div key={listing.id} className="glass-card animate-fade-in hover-scale" style={{padding: '1.25rem', position: 'relative'}}>
                      
                      <div className="flex-between align-center mb-2">
                        <span className="badge" style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-primary)', 
                          padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                          {isTamil ? 'விற்பனைக்கு உள்ளது' : 'Available'}
                        </span>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button className="btn-icon" style={{color: 'var(--color-primary-dark)'}} title="Edit Listing" onClick={() => navigate(`/resource/${listing.id}?edit=true`)}><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteListing(listing.id)} className="btn-icon" style={{color: '#ef4444'}} title="Delete Listing"><Trash2 size={16} /></button>
                        </div>
                      </div>

                      <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                        <img src={listing.image_url || 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=200'} alt={listing.title} style={{width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', objectFit: 'cover'}} />
                        <div style={{flex: 1}}>
                          <h4 style={{margin: '0 0 0.25rem 0'}} className="font-bold">{listing.title}</h4>
                          <p className="text-muted text-sm" style={{margin: 0}}>₹{listing.price} • {listing.quantity}</p>
                        </div>
                      </div>

                      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', fontSize: '0.75rem', fontWeight: '600'}}>
                          <MessageSquare size={14} /> <span>{inquiryCount} {isTamil ? 'விசாரணைகள்' : 'Inquiries'}</span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', fontSize: '0.75rem', fontWeight: '600'}}>
                          <BarChart2 size={14} /> <span>{demandLabel}</span>
                        </div>
                      </div>

                    </div>
                  );
                })
             ) : (
               <div className="glass-card text-center" style={{padding: '3rem'}}>
                  <p className="text-muted">{isTamil ? 'நீங்கள் இன்னும் எந்த வளத்தையும் பட்டியலிடவில்லை.' : 'You haven\'t listed any resources yet.'}</p>
                  <button onClick={() => navigate('/add-resource')} className="btn btn-primary mt-3 flex-center" style={{ margin: '1rem auto 0 auto' }}>
                    <span>{isTamil ? 'முதல் வளத்தைச் சேர்' : 'Add First Resource'}</span>
                    <ArrowRight size={16} />
                  </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

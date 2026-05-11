import { useState, useEffect } from 'react';
import { useResources } from '../context/ResourceContext';
import ResourceCard from '../components/ResourceCard';
import { User as UserIcon, Settings, LogOut, Package, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { resources, loading: resourcesLoading, deleteResource } = useResources();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editFarmName, setEditFarmName] = useState('');
  const [editPractices, setEditPractices] = useState('');

  // Create a profile object from the Supabase user metadata
  const profileUser = user ? {
    name: user.user_metadata?.full_name || user.email,
    phone: user.user_metadata?.phone || '',
    role: user.user_metadata?.role || 'user',
    location: user.user_metadata?.location || 'Not specified',
    farm_name: user.user_metadata?.farm_name || '',
    practices: user.user_metadata?.practices || '',
    image: null 
  } : null;

  // Filter listings by current user
  const userListings = resources.filter(r => r.user_id === user?.id);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (profileUser) {
      // Initialize edit form with current data
      setEditName(profileUser.name);
      setEditPhone(profileUser.phone);
      setEditLocation(profileUser.location);
      setEditFarmName(profileUser.farm_name);
      setEditPractices(profileUser.practices);

      // Auto-sync to profiles table if it doesn't exist yet
      const syncProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (error || !data) {
            await supabase.from('profiles').upsert({
              id: user.id,
              full_name: profileUser.name,
              farm_name: profileUser.farm_name,
              practices: profileUser.practices,
              location: profileUser.location,
              phone: profileUser.phone,
              updated_at: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Profile auto-sync failed:', err);
        }
      };
      
      syncProfile();
    }
  }, [user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: editName,
          phone: editPhone,
          location: editLocation,
          farm_name: editFarmName,
          practices: editPractices
        }
      });
      
      if (authError) throw authError;

      // 2. Sync to public.profiles table for shared visibility
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editName,
          farm_name: editFarmName,
          practices: editPractices,
          location: editLocation,
          phone: editPhone,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await deleteResource(id);
      alert('Listing removed successfully');
    } catch (err) {
      alert('Error removing listing: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!profileUser) return <div className="container text-center" style={{padding: '6rem'}}><p>Loading profile...</p></div>;

  return (
    <div className="container" style={{paddingTop: '6rem', paddingBottom: '6rem'}}>
      <div className="page-header" style={{padding: '0 0 2rem 0', marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.1)'}}>
        <h1>My Profile</h1>
      </div>

      <div style={{display: 'flex', flexWrap: 'wrap', gap: '2rem'}}>
        {/* Sidebar */}
        <aside style={{flex: '1 1 300px', maxWidth: '350px'}}>
           <div className="glass" style={{padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
              <div style={{width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: 'var(--shadow-md)'}}>
                 {profileUser.image ? <img src={profileUser.image} alt={profileUser.name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <UserIcon size={50} color="white" />}
              </div>
              <h2 style={{marginBottom: '0.5rem'}}>{profileUser.name}</h2>
              <p className="text-muted" style={{textTransform: 'capitalize', marginBottom: '1.5rem'}}>{profileUser.role} • {profileUser.location}</p>
              
              <button onClick={() => setIsEditing(!isEditing)} className="btn btn-secondary w-100" style={{marginBottom: '1rem'}}>
                 <Settings size={18} /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
              
              <button onClick={handleLogout} className="btn w-100" style={{color: 'var(--color-accent)', backgroundColor: 'rgba(242, 109, 58, 0.1)'}}>
                 <LogOut size={18} /> Logout
              </button>
           </div>
        </aside>

        {/* Main Content Area */}
        <div style={{flex: '1 1 500px'}}>
           {isEditing ? (
             <div className="glass animate-fade-in" style={{padding: '2rem', borderRadius: 'var(--radius-md)'}}>
                <h3 style={{marginBottom: '1.5rem'}}>Edit Profile Information</h3>
                <form onSubmit={handleSave} className="auth-form">
                   <div className="form-group" style={{display: 'flex', gap: '1rem'}}>
                      <div style={{flex: 1}}>
                        <label className="text-muted" style={{display:'block', marginBottom:'0.5rem', fontSize:'0.875rem'}}>Full Name</label>
                        <input type="text" className="form-select" value={editName} onChange={e => setEditName(e.target.value)} required style={{paddingLeft:'1rem'}} />
                      </div>
                      <div style={{flex: 1}}>
                        <label className="text-muted" style={{display:'block', marginBottom:'0.5rem', fontSize:'0.875rem'}}>Mobile Number</label>
                        <input type="text" className="form-select" value={editPhone} onChange={e => setEditPhone(e.target.value)} required style={{paddingLeft:'1rem'}} />
                      </div>
                   </div>

                   <div className="form-group">
                      <label className="text-muted" style={{display:'block', marginBottom:'0.5rem', fontSize:'0.875rem'}}>Location</label>
                      <input type="text" className="form-select" value={editLocation} onChange={e => setEditLocation(e.target.value)} required style={{paddingLeft:'1rem'}} />
                   </div>

                   {/* Business Seller Fields */}
                   <div className="form-group" style={{marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.1)'}}>
                      <h4 style={{marginBottom: '1rem'}}>Business / Seller Details</h4>
                      <label className="text-muted" style={{display:'block', marginBottom:'0.5rem', fontSize:'0.875rem'}}>Farm / Business Name</label>
                      <input type="text" className="form-select" value={editFarmName} onChange={e => setEditFarmName(e.target.value)} style={{paddingLeft:'1rem'}} />
                   </div>
                   
                   <div className="form-group">
                      <label className="text-muted" style={{display:'block', marginBottom:'0.5rem', fontSize:'0.875rem'}}>About Your Practices</label>
                      <textarea className="form-select" value={editPractices} onChange={e => setEditPractices(e.target.value)} rows="3" style={{paddingLeft:'1rem', paddingTop: '0.875rem', resize: 'vertical', minHeight: '80px'}}></textarea>
                   </div>

                   <button type="submit" className="btn btn-primary mt-4" disabled={loading} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <CheckCircle size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                   </button>
                </form>
             </div>
           ) : (
             <div className="animate-fade-in">
                {/* Profile Details Display (when not editing) */}
                <div className="glass" style={{padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem'}}>
                  <h3 style={{marginBottom: '1.5rem'}}>About Your Business</h3>
                  {profileUser.farm_name ? (
                    <>
                      <div style={{marginBottom: '1rem'}}>
                        <span className="text-muted" style={{display: 'block', fontSize: '0.875rem'}}>Farm / Business Name</span>
                        <span style={{fontSize: '1.125rem', fontWeight: '500'}}>{profileUser.farm_name}</span>
                      </div>
                      <div>
                        <span className="text-muted" style={{display: 'block', fontSize: '0.875rem'}}>Farming Practices</span>
                        <p style={{marginTop: '0.25rem'}}>{profileUser.practices || 'No practices listed.'}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted">You haven't set up your business profile yet. Click "Edit Profile" to add your farm details.</p>
                  )}
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'}}>
                   <Package size={24} color="var(--color-primary)" />
                   <h3 style={{margin: 0}}>My active listings ({userListings.length})</h3>
                </div>
                
                <div className="grid-cards" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'}}>
                    {resourcesLoading ? (
                      <p>Loading your listings...</p>
                    ) : userListings.length > 0 ? (
                      userListings.map(listing => (
                         <ResourceCard key={listing.id} data={listing} onRemove={handleDeleteListing} />
                      ))
                   ) : (
                     <div className="glass" style={{padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', gridColumn: 'span 12'}}>
                        <p className="text-muted">You don't have any active listings yet.</p>
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

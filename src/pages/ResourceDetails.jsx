import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useState, useEffect } from 'react';
import { MapPin, Tag, Phone, User as UserIcon, ArrowLeft, MessageCircle, Check, Trash2, Edit2, Sparkles, X } from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import './Auth.css'; 

const ResourceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resources, loading: resourcesLoading, deleteResource, updateResource, refreshResources } = useResources();
  
  const [seller, setSeller] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetchingSeller, setFetchingSeller] = useState(true);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');

  const resource = resources.find(r => String(r.id) === String(id));
  const isOwner = Boolean(user && resource && (
    String(user.id) === String(resource.user_id) ||
    (user.user_metadata?.full_name && resource.seller_name && user.user_metadata.full_name.trim().toLowerCase() === resource.seller_name.trim().toLowerCase())
  ));

  useEffect(() => {
    if (resource && searchParams.get('edit') === 'true') {
      openEditModal();
    }
  }, [resource, searchParams]);

  useEffect(() => {
    const fetchSellerAndRequest = async () => {
      if (!resource) return;
      
      try {
        setFetchingSeller(true);
        // 1. Fetch Seller Profile
        const sellerData = await api.get(`/profiles/${resource.user_id}`);
        setSeller(sellerData);

        // 2. Fetch existing chat request if user is logged in
        if (user && user.id !== resource.user_id) {
          const chatsData = await api.get('/chats/requests');
          const existingRequest = [
            ...(chatsData.requests || []),
            ...(chatsData.chats || [])
          ].find(r => r.resource_id === resource.id && r.sender_id === user.id);

          if (existingRequest) {
            setChatRequest(existingRequest);
          }
        }
      } catch (err) {
        console.error('Error in fetchSellerAndRequest:', err);
      } finally {
        setFetchingSeller(false);
      }
    };

    fetchSellerAndRequest();
  }, [resource, user]);

  const openEditModal = () => {
    if (resource) {
      setEditTitle(resource.title || '');
      setEditCategory(resource.category || '');
      setEditPrice(resource.price || '');
      setEditQuantity(resource.quantity || '');
      setEditLocation(resource.location || '');
      setEditDescription(resource.description || '');
      setEditImage(resource.image_url || resource.image || '');
      setIsEditing(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedData = {
        title: editTitle,
        category: editCategory,
        price: parseFloat(editPrice) || 0,
        quantity: editQuantity,
        location: editLocation,
        description: editDescription,
        image_url: editImage
      };
      await updateResource(id, updatedData);
      
      if (resource) {
        resource.title = editTitle;
        resource.category = editCategory;
        resource.price = parseFloat(editPrice) || 0;
        resource.quantity = editQuantity;
        resource.location = editLocation;
        resource.description = editDescription;
        resource.image_url = editImage;
      }

      setIsEditing(false);
      alert('Listing updated successfully!');
      if (refreshResources) await refreshResources();
    } catch (err) {
      alert('Error updating listing: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChatRequest = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (chatRequest) {
      if (chatRequest.status === 'accepted') {
        navigate(`/chat/${chatRequest.id}`);
      } else {
        alert('Chat request is pending seller approval.');
      }
      return;
    }

    try {
      setRequestLoading(true);
      const data = await api.post('/chats/requests', {
        receiver_id: resource.user_id,
        resource_id: resource.id,
        resource_title: resource.title,
      });

      setChatRequest(data);
      alert('Chat request sent to seller!');
    } catch (err) {
      alert('Error sending chat request: ' + err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    
    try {
      setDeleting(true);
      await deleteResource(id);
      alert('Listing deleted successfully');
      navigate('/marketplace');
    } catch (err) {
      alert('Error deleting listing: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (resourcesLoading || fetchingSeller) {
    return (
      <div className="container flex-center" style={{paddingTop: '6rem', minHeight: '60vh'}}>
         <div className="loader">Loading details...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container" style={{paddingTop: '6rem', minHeight: '60vh'}}>
         <h2>Resource not found</h2>
         <Link to="/marketplace" className="btn btn-primary" style={{marginTop: '1rem'}}>Back to Marketplace</Link>
      </div>
    );
  }

  // AI Insights: Similar Resources
  const similarResources = resources
    .filter(r => r.category === resource.category && r.id !== resource.id)
    .slice(0, 3);

  return (
    <div className="container" style={{paddingTop: '6rem', paddingBottom: '6rem'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/marketplace" className="text-muted" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
        {isOwner && (
          <button 
            onClick={openEditModal}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem', gap: '0.5rem', display: 'inline-flex', alignItems: 'center', fontSize: '0.9rem', borderRadius: '8px', backgroundColor: '#15803d', borderColor: '#15803d' }}
          >
            <Edit2 size={16} /> Edit Listing
          </button>
        )}
      </div>

      <div className="glass" style={{borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          {/* Image Section */}
          <div style={{flex: '1 1 100%', maxWidth: '600px'}}>
             <img src={resource.image_url || resource.image || 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=800'} alt={resource.title} style={{width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px'}} />
          </div>

          {/* Details Section */}
          <div style={{flex: '1 1 300px', padding: '3rem'}}>
             <div style={{display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(46, 165, 87, 0.1)', color: 'var(--color-primary-dark)', borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'capitalize'}}>
               {resource.category}
             </div>
             
             <h1 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>{resource.title}</h1>
             <p className="text-muted" style={{fontSize: '1.125rem', marginBottom: '2rem', lineHeight: '1.8'}}>
               {resource.description || 'Premium quality agricultural resource available.'}
             </p>

             <div style={{display: 'flex', gap: '2rem', marginBottom: '2rem'}}>
                <div>
                   <span className="text-muted" style={{display: 'block', fontSize: '0.875rem'}}>Price</span>
                   <span style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-dark)'}}>₹{Math.round(Number(resource.price))}</span>
                </div>
                <div>
                   <span className="text-muted" style={{display: 'block', fontSize: '0.875rem'}}>Quantity</span>
                   <span style={{fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Tag size={18} /> {resource.quantity}</span>
                </div>
             </div>

             <div style={{marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)'}}>
                <MapPin size={20} /> <span style={{fontSize: '1.125rem'}}>{resource.location}</span>
             </div>

             {/* Seller Info Component */}
             {(seller || resource.user_id) && (
               <div style={{borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '2rem'}}>
                  <h3 style={{marginBottom: '1rem', fontSize: '1.25rem'}}>Seller Information</h3>
                  <div className="glass" style={{padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.3)'}}>
                     <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                           {seller?.image ? <img src={seller.image} alt={seller.full_name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <UserIcon size={24} color="white" />}
                        </div>
                        <div>
                           <h4 style={{fontSize: '1.1rem', margin: '0'}}>
                             {seller?.farm_name || seller?.full_name || resource?.seller_name || (isOwner ? (user?.user_metadata?.full_name || user?.email?.split('@')[0]) : null) || 'AgriConnect Seller'}
                           </h4>
                           <span className="text-muted" style={{fontSize: '0.8rem'}}>{seller?.location || resource.location}</span>
                        </div>
                     </div>
                     
                     {seller?.practices && (
                        <div style={{marginBottom: '1.5rem'}}>
                           <p className="text-muted" style={{fontSize: '0.9rem', lineHeight: '1.5'}}>{seller.practices}</p>
                        </div>
                     )}

                     {!isOwner && (
                        <div style={{display: 'flex', gap: '1rem'}}>
                           <button 
                              onClick={handleChatRequest} 
                              disabled={requestLoading || (chatRequest && chatRequest.status === 'pending')}
                              className={`btn ${chatRequest?.status === 'accepted' ? 'btn-secondary' : 'btn-primary'}`} 
                              style={{flex: 1, gap: '0.5rem'}}
                           >
                              {chatRequest?.status === 'accepted' ? (
                                 <><MessageCircle size={18} /> Open Chat</>
                              ) : chatRequest?.status === 'pending' ? (
                                 <><Check size={18} /> Request Sent</>
                              ) : (
                                 <><MessageCircle size={18} /> Chat with Seller</>
                              )}
                           </button>
                           {(seller?.phone || resource?.seller_phone) && (
                              <a href={`tel:${seller?.phone || resource?.seller_phone}`} className="btn btn-secondary" style={{padding: '0.75rem'}}>
                                 <Phone size={18} />
                              </a>
                           )}
                        </div>
                     )}
                     {isOwner && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                           <p className="text-muted text-center" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>This is your listing</p>
                           <button 
                              onClick={openEditModal} 
                              className="btn btn-primary w-100" 
                              style={{gap: '0.5rem', justifyContent: 'center', backgroundColor: '#15803d', borderColor: '#15803d'}}
                           >
                              <Edit2 size={18} /> Edit Listing
                           </button>
                           <button 
                              onClick={handleDelete} 
                              disabled={deleting}
                              className="btn w-100" 
                              style={{backgroundColor: 'rgba(242, 109, 58, 0.1)', color: 'var(--color-accent)', gap: '0.5rem', justifyContent: 'center'}}
                           >
                              <Trash2 size={18} /> {deleting ? 'Deleting...' : 'Delete Listing'}
                           </button>
                        </div>
                     )}
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* AI Insights: Similar Resources */}
      {similarResources.length > 0 && (
        <div className="similar-resources mt-5 animate-fade-in stagger-3" style={{marginTop: '4rem'}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem'}}>
              <Sparkles size={24} color="var(--color-primary)" />
              <h3 style={{fontSize: '1.5rem', margin: 0}}>Similar Resources</h3>
           </div>
           <div className="grid-cards" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'}}>
              {similarResources.map(product => (
                <ResourceCard key={product.id} data={product} />
              ))}
           </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', maxWidth: '520px', width: '100%',
            padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>✏️ Edit Published Listing</h3>
              <button onClick={() => setIsEditing(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Title</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Category</label>
                <select 
                  value={editCategory} 
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: 'white', boxSizing: 'border-box' }}
                >
                  {['Tapioca Stalks', 'Paddy Straw', 'Rice Husk', 'Bagasse', 'Sugarcane Trash', 'Coconut Husk', 'Coconut Shell', 'Banana Stem', 'Banana Leaves', 'Corn Stalks', 'Corn Cobs', 'Groundnut Shells', 'Cotton Stalks', 'Millet Straw', 'Wheat Straw', 'Sesame Stalks', 'Castor Stalks', 'Palm Fronds', 'Arecanut Husk', 'Cashew Shells', 'Organic Compost'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Price (₹)</label>
                  <input 
                    type="number" 
                    value={editPrice} 
                    onChange={(e) => setEditPrice(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Quantity</label>
                  <input 
                    type="text" 
                    value={editQuantity} 
                    onChange={(e) => setEditQuantity(e.target.value)} 
                    placeholder="e.g. 60 kg or 10 Tons"
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Location</label>
                <input 
                  type="text" 
                  value={editLocation} 
                  onChange={(e) => setEditLocation(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Description</label>
                <textarea 
                  rows={3} 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Image URL</label>
                <input 
                  type="text" 
                  value={editImage} 
                  onChange={(e) => setEditImage(e.target.value)} 
                  placeholder="Image URL..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
                {editImage && (
                  <img src={editImage} alt="Preview" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem' }} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#15803d', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetails;

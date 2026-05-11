import { useParams, Link, useNavigate } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { MapPin, Tag, Phone, User as UserIcon, ArrowLeft, MessageCircle, Check, Trash2 } from 'lucide-react';
import './Auth.css'; 

const ResourceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resources, loading: resourcesLoading, deleteResource } = useResources();
  
  const [seller, setSeller] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetchingSeller, setFetchingSeller] = useState(true);

  const resource = resources.find(r => r.id === id);

  useEffect(() => {
    const fetchSellerAndRequest = async () => {
      if (!resource) return;
      
      try {
        setFetchingSeller(true);
        // 1. Fetch Seller Profile
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', resource.user_id)
          .single();

        if (sellerError && sellerError.code !== 'PGRST116') {
          console.error('Error fetching seller:', sellerError);
        } else {
          setSeller(sellerData);
        }

        // 2. Fetch existing chat request if user is logged in
        if (user && user.id !== resource.user_id) {
          const { data: requestData, error: requestError } = await supabase
            .from('chat_requests')
            .select('*')
            .eq('sender_id', user.id)
            .eq('receiver_id', resource.user_id)
            .eq('resource_id', resource.id)
            .single();

          if (!requestError) {
            setChatRequest(requestData);
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
      const { data, error } = await supabase
        .from('chat_requests')
        .insert({
          sender_id: user.id,
          receiver_id: resource.user_id,
          resource_id: resource.id,
          resource_title: resource.title, // Save title for history
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
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

  const isOwner = user?.id === resource.user_id;

  return (
    <div className="container" style={{paddingTop: '6rem', paddingBottom: '6rem'}}>
      <Link to="/marketplace" className="text-muted" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem'}}>
        <ArrowLeft size={16} /> Back to Marketplace
      </Link>

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
                   <span style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-dark)'}}>₹{Number(resource.price).toFixed(2)}</span>
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
                           <h4 style={{fontSize: '1.1rem', margin: '0'}}>{seller?.farm_name || seller?.full_name || 'AgriConnect Seller'}</h4>
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
                           {seller?.phone && (
                              <a href={`tel:${seller.phone}`} className="btn btn-secondary" style={{padding: '0.75rem'}}>
                                 <Phone size={18} />
                              </a>
                           )}
                        </div>
                     )}
                     {isOwner && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                           <p className="text-muted text-center" style={{fontSize: '0.875rem', marginBottom: '0.5rem'}}>This is your listing</p>
                           <button 
                              onClick={handleDelete} 
                              disabled={deleting}
                              className="btn w-100" 
                              style={{backgroundColor: 'rgba(242, 109, 58, 0.1)', color: 'var(--color-accent)', gap: '0.5rem'}}
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
    </div>
  );
};

export default ResourceDetails;

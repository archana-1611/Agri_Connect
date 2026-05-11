import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Reusing forms CSS

const AddResource = ({ onSuccess }) => {
  const { user } = useAuth();
  const { addResource, refreshResources } = useResources();
  const navigate = useNavigate();
  const [isSellerProfileSetup, setIsSellerProfileSetup] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Seller Setup form state
  const [farmName, setFarmName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationSetup, setLocationSetup] = useState('');
  const [practices, setPractices] = useState('');

  // Resource form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.user_metadata?.seller_setup_complete) {
      setIsSellerProfileSetup(true);
    } else {
      setFarmName(user.user_metadata?.farm_name || user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone || '');
      setLocationSetup(user.user_metadata?.location || '');
      setPractices(user.user_metadata?.practices || '');
    }
  }, [user, navigate]);

  const handleSellerSetupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          seller_setup_complete: true,
          farm_name: farmName,
          phone: phone,
          location: locationSetup,
          practices: practices
        }
      });
      
      if (authError) throw authError;

      // 2. Sync to public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email,
          farm_name: farmName,
          practices: practices,
          location: locationSetup,
          phone: phone,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      setIsSellerProfileSetup(true);
    } catch (err) {
      alert('Error saving seller profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    
    try {
      // In a real app, we'd upload the image to Supabase Storage here.
      // For now, we'll use a placeholder or the base64 preview if small enough.
      const resourceData = {
        title,
        category,
        price: parseFloat(price),
        quantity,
        location,
        description,
        image_url: preview || 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=600'
      };
      
      await addResource(resourceData);
      await refreshResources(); // Ensure marketplace is updated

      // Set flag for Home page notification
      localStorage.setItem('agri_crop_added', 'true');
      
      // Reset form
      setTitle('');
      setCategory('');
      setPrice('');
      setQuantity('');
      setLocation('');
      setDescription('');
      setPreview(null);

      alert('Resource published successfully! You can see it in the marketplace.');
      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Error publishing resource: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (!isSellerProfileSetup) {
    return (
      <div className="auth-page container">
        <div className="auth-card glass animate-fade-in" style={{maxWidth: '600px', margin: '0 auto'}}>
          <h2 className="text-center">Seller Setup</h2>
          <p className="text-center text-muted mb-4">
            Before you start selling, please provide some basic information about your farm or business.
          </p>
          
          <form onSubmit={handleSellerSetupSubmit} className="auth-form">
            <div className="form-group">
              <label className="text-muted">Farm / Business Name</label>
              <input type="text" className="form-select" placeholder="e.g. Green Valley Farms" required value={farmName} onChange={e => setFarmName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="text-muted">Contact Number</label>
              <input type="tel" className="form-select" placeholder="+91 98765 43210" required value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="text-muted">Primary Location</label>
              <input type="text" className="form-select" placeholder="City, State" required value={locationSetup} onChange={e => setLocationSetup(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="text-muted">About Your Practices (Optional)</label>
              <textarea className="form-select" placeholder="Tell buyers a little bit about your farming methods..." rows="3" value={practices} onChange={e => setPractices(e.target.value)}></textarea>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-4" disabled={loading}>
              <CheckCircle size={18} /> {loading ? 'Saving...' : 'Complete Setup & Start Selling'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page container">
      <div className="auth-card glass animate-fade-in" style={{maxWidth: '600px'}}>
        <h2 className="text-center">Add New Resource</h2>
        <p className="text-center text-muted mb-4">
          List your items for sale or equipment for rent.
        </p>

        <form onSubmit={handleResourceSubmit} className="auth-form">
          <div className="form-group">
            <label className="text-muted">Resource Title</label>
            <input 
              type="text" 
              className="form-select" 
              placeholder="e.g. Organic Wheat Residue" 
              required 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group" style={{display: 'flex', gap: '1rem'}}>
             <div style={{flex: 1}}>
                <label className="text-muted">Category</label>
                <select className="form-select" required value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="crop residue">Crop Residue</option>
                  <option value="tools">Tools & Equipment</option>
                  <option value="seeds">Seeds</option>
                </select>
             </div>
             <div style={{flex: 1}}>
                <label className="text-muted">Price (₹)</label>
                <input 
                  type="number" 
                  className="form-select" 
                  placeholder="0.00" 
                  required 
                  step="0.01" 
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
             </div>
          </div>

          <div className="form-group" style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 1}}>
               <label className="text-muted">Quantity</label>
               <input 
                 type="text" 
                 className="form-select" 
                 placeholder="e.g. 50 kg" 
                 required 
                 value={quantity}
                 onChange={e => setQuantity(e.target.value)}
               />
            </div>
            <div style={{flex: 1}}>
               <label className="text-muted">Location</label>
               <input 
                 type="text" 
                 className="form-select" 
                 placeholder="e.g. Punjab, India" 
                 required 
                 value={location}
                 onChange={e => setLocation(e.target.value)}
               />
            </div>
          </div>

          <div className="form-group">
            <label className="text-muted">Description</label>
            <textarea 
              className="form-select" 
              placeholder="Detailed description of the resource..." 
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{paddingTop: '0.875rem'}}
            ></textarea>
          </div>

          <div className="form-group">
             <label className="text-muted">Upload Image</label>
             <div 
               className="image-upload-box"
               style={{
                 position: 'relative',
                 border: '2px dashed rgba(0,0,0,0.1)',
                 borderRadius: 'var(--radius-md)',
                 padding: '2rem',
                 textAlign: 'center',
                 cursor: 'pointer',
                 backgroundColor: 'var(--bg-main)',
                 overflow: 'hidden',
                 minHeight: '120px',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
                {preview ? (
                  <img src={preview} alt="Preview" style={{width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)'}} />
                ) : (
                  <>
                     <ImageIcon size={48} color="var(--text-muted)" style={{opacity: 0.5, marginBottom: '1rem'}} />
                     <p className="text-muted">Click to upload image</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} 
                />
             </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4" disabled={publishing}>
            <Upload size={18} /> {publishing ? 'Publishing...' : 'Publish Resource'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddResource;

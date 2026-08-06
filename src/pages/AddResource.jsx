import { useState } from 'react';
import { Upload, Image as ImageIcon, MapPin, Sparkles, Navigation, ChevronDown } from 'lucide-react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddResource.css';

const AddResource = () => {
  const { addResource, refreshResources } = useResources();
  const { user } = useAuth();
  const navigate = useNavigate();
  const locationState = useLocation().state;
  
  const [preview, setPreview] = useState(locationState?.prefillImage || null);
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Resource form state - prefilled automatically if coming from AI Crop Predictor
  const [title, setTitle] = useState(locationState?.prefillTitle || '');
  const [category, setCategory] = useState(locationState?.prefillCategory || '');
  const [price, setPrice] = useState(locationState?.prefillPrice ? String(locationState.prefillPrice) : '');
  const [quantity, setQuantity] = useState(locationState?.prefillQuantity || '');
  const isPrefilledFromAi = Boolean(locationState?.prefillFromAi);
  
  // Default to the user's exact profile location if available
  const [location, setLocation] = useState(user?.user_metadata?.location || '');
  
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Auto-detect GPS Location
  const handleDetectLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      // Fallback to IP
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          setLocation(data.city ? `${data.city}, ${data.region}` : 'Location Not Found');
          setIsGettingLocation(false);
        })
        .catch(() => {
          setLocation(''); // Ultimate fallback: empty
          setIsGettingLocation(false);
          alert('Could not auto-detect location. Please enter manually.');
        });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then(res => res.json())
          .then(data => {
            const city = data.city || data.locality || data.district || '';
            const state = data.principalSubdivision || data.region || '';
            const displayStr = city ? `${city}, ${state}` : `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
            setLocation(`${displayStr}|${latitude},${longitude}`);
            setIsGettingLocation(false);
          })
          .catch(() => {
            setLocation(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}|${latitude},${longitude}`);
            setIsGettingLocation(false);
          });
      },
      (error) => {
        console.warn("GPS Error", error);
        // Fallback to IP
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            setLocation(data.city ? `${data.city}, ${data.region}` : 'Location Not Found');
            setIsGettingLocation(false);
          })
          .catch(() => {
            setLocation('');
            setIsGettingLocation(false);
            alert('Could not auto-detect location. Please enter manually.');
          });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
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
    setLoading(true);
    
    try {
      const resourceData = {
        title,
        category,
        price: parseInt(price, 10),
        quantity,
        location,
        description: '', // Optional in this simple UI
        image_url: preview || 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=600',
        seller_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer',
        seller_phone: user?.user_metadata?.phone || user?.phone || ''
      };
      
      await addResource(resourceData);
      await refreshResources();

      localStorage.setItem('agri_crop_added', 'true');
      
      alert('Resource added successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert('Error publishing resource: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-resource-container">
      <div className="add-resource-card animate-fade-in">
        
        <div className="text-center mb-5">
          <h2 className="add-resource-title">
            Add Harvest Resource
          </h2>
          <p className="text-muted text-sm">
            List crop residues or surplus organic harvest products for sale
          </p>
        </div>

        <form onSubmit={handleResourceSubmit} className="add-resource-form">
          <div className="add-resource-grid">
            
            {/* Left Column: Image Upload & Info */}
            <div className="upload-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h4 className="column-title">
                Residue Crop Image
              </h4>

              <div className="image-upload-box">
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                ) : (
                  <>
                     <div className="upload-icon-wrapper">
                       <ImageIcon size={36} color="var(--color-primary)" />
                     </div>
                     <p className="font-bold" style={{ color: 'var(--color-primary-dark)', fontSize: '0.9rem', margin: 0 }}>Tap or drag to upload photo</p>
                     <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Supports JPG, PNG up to 5MB</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                />
              </div>

              <div className="recycle-tip-box">
                <h5 className="recycle-tip-title">
                  💡 Environmental Recycle Tip
                </h5>
                <p className="recycle-tip-text">
                  Listing crop residues like Straw and Husk avoids open burning. Doing so helps decrease environmental pollution and reduces CO₂ footprint!
                </p>
              </div>
            </div>

            {/* Right Column: Listing Fields */}
            <div className="fields-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {isPrefilledFromAi && (
                <div style={{
                  background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
                  border: '1.5px solid #22c55e',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#15803d',
                  fontSize: '0.88rem',
                  fontWeight: 700
                }}>
                  <Sparkles size={22} color="#16a34a" />
                  <span>✨ AI Crop Prediction Details Auto-Filled! Review and publish your surplus listing.</span>
                </div>
              )}

              <h4 className="column-title">
                Product Listing Details
              </h4>

              {/* 1. Resource Name */}
              <div className="form-group-row">
                <label>
                  Resource Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Organic Paddy Straw" 
                  required 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="form-input-field"
                />
              </div>

              {/* 2. Category */}
              <div className="form-group-row">
                  <label>
                    Category
                  </label>
                  <div className="input-container-relative">
                    <input type="hidden" required value={category} />
                    <div 
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="form-input-field"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        cursor: 'pointer',
                        userSelect: 'none',
                        lineHeight: '40px'
                      }}
                    >
                      <span style={{ color: category ? 'var(--color-primary-dark)' : '#64748b' }}>
                        {category || 'Select Category'}
                      </span>
                      <ChevronDown size={16} className="text-muted" style={{ transform: showCategoryDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {showCategoryDropdown && (
                      <>
                        <div 
                          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
                          onClick={() => setShowCategoryDropdown(false)} 
                        />
                        <div 
                          className="glass-card" 
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            backgroundColor: '#ffffff',
                            border: '1.5px solid rgba(21, 128, 61, 0.15)',
                            borderRadius: '12px',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: 'var(--shadow-lg)',
                            padding: '4px 0'
                          }}
                        >
                          {[
                            "Paddy Straw",
                            "Rice Husk",
                            "Bagasse",
                            "Sugarcane Trash",
                            "Coconut Husk",
                            "Coconut Shell",
                            "Banana Stem",
                            "Banana Leaves",
                            "Corn Stalks",
                            "Corn Cobs",
                            "Groundnut Shells",
                            "Cotton Stalks",
                            "Millet Straw",
                            "Wheat Straw",
                            "Sesame Stalks",
                            "Tapioca Stalks",
                            "Castor Stalks",
                            "Palm Fronds",
                            "Arecanut Husk",
                            "Cashew Shells",
                            "Sunflower Stalks",
                            "Mango Leaves",
                            "Neem Cake",
                            "Groundnut Cake",
                            "Cocoa Pods"
                          ].map((cat) => (
                            <div
                              key={cat}
                              onClick={() => {
                                setCategory(cat);
                                setShowCategoryDropdown(false);
                              }}
                              style={{
                                padding: '10px 16px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                color: 'var(--color-primary-dark)',
                                backgroundColor: category === cat ? 'rgba(21, 128, 61, 0.08)' : 'transparent',
                                transition: 'background-color 0.15s',
                                fontWeight: category === cat ? '700' : '500',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => { if (category !== cat) e.target.style.backgroundColor = '#f4fcf8'; }}
                              onMouseLeave={(e) => { if (category !== cat) e.target.style.backgroundColor = 'transparent'; }}
                            >
                              {cat}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
              </div>

              {/* 3. Quantity */}
              <div className="form-group-row">
                 <label>
                   Quantity
                 </label>
                 <input 
                   type="text" 
                   placeholder="e.g. 50 kg" 
                   required 
                   value={quantity}
                   onChange={e => setQuantity(e.target.value)}
                   className="form-input-field"
                 />
              </div>

              {/* 4. Price */}
              <div className="form-group-row">
                 <label>
                   Price (₹)
                 </label>
                 <input 
                   type="number" 
                   placeholder="0" 
                   required 
                   step="1" 
                   value={price}
                   onChange={e => setPrice(e.target.value)}
                   className="form-input-field"
                 />
              </div>

              {/* 5. Pickup Location */}
              <div className="form-group-row">
                 <label>
                   Pickup Location
                 </label>
                 <div className="input-container-relative">
                    <MapPin size={18} className="input-left-icon" />
                    <input 
                      type="text" 
                      placeholder="Enter location" 
                      className="form-input-field" 
                      value={location.split('|')[0]} 
                      onChange={(e) => setLocation(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={handleDetectLocation}
                      className="input-right-btn"
                      title="Detect Location"
                    >
                      {isGettingLocation ? <div className="typing-dots"><span></span><span></span><span></span></div> : <Navigation size={18} />}
                    </button>
                 </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn-premium" 
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish Resource'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResource;

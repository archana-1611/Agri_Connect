import { useState } from 'react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import { Search, Filter, MapPin, Package, TrendingUp, Users, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { resources, loading, deleteResource } = useResources();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  // Show ONLY user's own resources
  const myResources = resources.filter(r => r.user_id === user?.id);

  // Extract unique categories and locations from ALL resources (or just mine?)
  // Let's stick to unique categories from ALL for better filtering experience
  const categories = [...new Set(resources.map(r => r.category))];
  const locations = [...new Set(resources.map(r => r.location))];

  const filteredResources = myResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === '' || resource.category === category;
    const matchesLocation = location === '' || resource.location === location;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleRemove = async (id) => {
    try {
      await deleteResource(id);
    } catch (err) {
      alert('Failed to remove: ' + err.message);
    }
  };

  if (loading) {
     return (
       <div className="dashboard-page flex-center" style={{minHeight: '60vh'}}>
         <div className="loader">Loading your dashboard...</div>
       </div>
     );
  }

  // Calculate metrics
  const totalResources = resources.length;
  const totalMyResources = myResources.length;
  const activeCategories = categories.length;

  return (
    <div className="dashboard-page container" style={{paddingTop: '6rem', paddingBottom: '6rem'}}>
      <div className="dashboard-header flex-between align-center" style={{marginBottom: '2rem'}}>
        <div>
          <h1 className="animate-fade-in"><span className="text-gradient">Hello,</span> Welcome Back</h1>
          <p className="animate-fade-in stagger-1 text-muted">Here is the overview of available agricultural resources.</p>
        </div>
        <Link to="/add-resource" className="btn btn-primary animate-fade-in stagger-1">
          <PlusCircle size={18} /> Add New Resource
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="dashboard-metrics grid-cards animate-fade-in stagger-1" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '3rem'}}>
         <div className="metric-card glass">
            <div className="metric-icon" style={{backgroundColor: 'rgba(46, 165, 87, 0.15)', color: 'var(--color-primary-dark)'}}>
               <Package size={24} />
            </div>
            <div>
               <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>Available Resources</p>
               <h3 style={{fontSize: '1.75rem', margin: 0}}>{totalResources}</h3>
            </div>
         </div>

         <div className="metric-card glass">
            <div className="metric-icon" style={{backgroundColor: 'rgba(240, 195, 65, 0.15)', color: 'var(--color-secondary)'}}>
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>Categories</p>
               <h3 style={{fontSize: '1.75rem', margin: 0}}>{activeCategories}</h3>
            </div>
         </div>

         <div className="metric-card glass">
            <div className="metric-icon" style={{backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6'}}>
               <Users size={24} />
            </div>
            <div>
               <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>My Listings</p>
               <h3 style={{fontSize: '1.75rem', margin: 0}}>{totalMyResources}</h3>
            </div>
         </div>
      </div>

      <div className="dashboard-content">
        {/* Sidebar Filters */}
        <aside className="dashboard-sidebar glass animate-fade-in stagger-2">
          <div className="filter-group">
            <h3><Filter size={18} /> Filters</h3>
          </div>
          
          <div className="filter-group">
            <h4>Category</h4>
            <div className="custom-select-wrapper">
               <select className="form-select custom-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                 <option value="">All Categories</option>
                 {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
               </select>
            </div>
          </div>

          <div className="filter-group">
            <h4>Location</h4>
            <div className="input-with-icon" style={{position: 'relative'}}>
               <MapPin size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1}} />
               <select className="form-select custom-select" value={location} onChange={(e) => setLocation(e.target.value)} style={{paddingLeft: '3rem'}}>
                  <option value="">All Locations</option>
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
               </select>
            </div>
          </div>
        </aside>

        {/* Main Resource List */}
        <div className="dashboard-main animate-fade-in stagger-3">
          <div className="search-bar glass" style={{marginBottom: '2rem'}}>
            <Search className="search-icon" size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search available resources by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{width: '100%', border: 'none', outline: 'none', background: 'transparent', padding: '1rem', color: 'var(--text-main)'}}
            />
          </div>

          <div className="grid-cards" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'}}>
            {filteredResources.length > 0 ? (
              filteredResources.map(resource => (
                <ResourceCard key={resource.id} data={resource} onRemove={handleRemove} />
              ))
            ) : (
              <div className="no-results glass" style={{gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)'}}>
                <h3>No resources found</h3>
                <p className="text-muted">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

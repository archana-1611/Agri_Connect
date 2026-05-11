import { useState } from 'react';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import { Search, Filter, ShoppingBag, Store } from 'lucide-react';
import AddResource from './AddResource';
import './Marketplace.css';

const Marketplace = () => {
  const { user } = useAuth();
  const { resources, loading, deleteResource } = useResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('buy');

  const filteredProducts = resources.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleRemove = async (id) => {
    try {
      await deleteResource(id);
    } catch (err) {
      alert('Failed to remove resource: ' + err.message);
    }
  };

  const categories = ['All', 'crop residue', 'seeds', 'tools'];

  if (loading && activeTab === 'buy') {
    return (
      <div className="marketplace-page flex-center" style={{minHeight: '60vh'}}>
        <div className="loader">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <div className="page-header" style={{paddingBottom: '2rem'}}>
        <div className="container text-center">
          <h1 className="animate-fade-in">Fresh <span className="text-gradient">Marketplace</span></h1>
          <p className="animate-fade-in stagger-1 text-muted" style={{marginBottom: '2rem'}}>
            {activeTab === 'buy' 
              ? 'Buy directly from local farmers and support sustainable agriculture.' 
              : 'List your products and reach thousands of buyers instantly.'}
          </p>
          
          <div className="marketplace-tabs flex-center animate-fade-in stagger-2" style={{gap: '1rem'}}>
            <button 
              className={`btn ${activeTab === 'buy' ? 'btn-primary' : 'btn-secondary glass'}`}
              onClick={() => setActiveTab('buy')}
              style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
            >
              <ShoppingBag size={18} /> Buy Products
            </button>
            <button 
              className={`btn ${activeTab === 'sell' ? 'btn-primary' : 'btn-secondary glass'}`}
              onClick={() => setActiveTab('sell')}
              style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
            >
              <Store size={18} /> Sell Products
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'buy' ? (
        <div className="container marketplace-container mt-4" style={{marginTop: '2rem'}}>
          {/* Sidebar Filters */}
          <aside className="filters-sidebar glass animate-fade-in stagger-2">
            <div className="filter-group">
              <h3><Filter size={18} /> Filters</h3>
            </div>
            
            <div className="filter-group">
              <h4>Category</h4>
              <ul className="category-list">
                {categories.map(cat => (
                  <li key={cat}>
                    <button 
                      className={`category-btn ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <div className="marketplace-content animate-fade-in stagger-3">
            <div className="search-bar glass">
              <Search className="search-icon" size={20} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search for organic products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid-cards">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ResourceCard 
                    key={product.id} 
                    data={product} 
                    onRemove={user?.id === product.user_id ? handleRemove : null} 
                  />
                ))
              ) : (
                <div className="no-results">
                  <h3>No products found.</h3>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="sell-section animate-fade-in">
          {/* Inline AddResource form styling adjustment so it fits nicely under the header */}
          <div style={{marginTop: '-2rem'}}>
             <AddResource onSuccess={() => setActiveTab('buy')} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

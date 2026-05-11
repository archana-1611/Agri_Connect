import { useState } from 'react';
import { useResources } from '../context/ResourceContext';
import ResourceCard from '../components/ResourceCard';
import { Search, Info } from 'lucide-react';
import './Rentals.css';

const Rentals = () => {
  const { resources, loading } = useResources();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only tools for rentals
  const rentals = resources.filter(r => r.category === 'tools');
  
  const filteredRentals = rentals.filter(rental => 
    rental.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="rentals-page flex-center" style={{minHeight: '60vh'}}>
        <div className="loader">Loading machinery...</div>
      </div>
    );
  }

  return (
    <div className="rentals-page">
      <div className="page-header rentals-header">
        <div className="container">
          <h1 className="animate-fade-in"><span className="text-gradient">Equipment</span> Rentals</h1>
          <p className="animate-fade-in stagger-1 text-muted">Rent machinery, tools, and land from local providers to optimize your farming operations.</p>
        </div>
      </div>

      <div className="container">
        <div className="info-banner glass animate-fade-in stagger-2">
          <Info size={24} color="var(--color-secondary)" />
          <div>
            <h4>Why Rent?</h4>
            <p>Save money on expensive agricultural machinery by renting on-demand. All our providers are verified.</p>
          </div>
        </div>

        <div className="search-bar glass animate-fade-in stagger-3">
          <Search className="search-icon" size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search for tractors, tillers, pumps..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid-cards animate-fade-in stagger-3">
          {filteredRentals.length > 0 ? (
            filteredRentals.map(rental => (
              <ResourceCard key={rental.id} data={rental} />
            ))
          ) : (
            <div className="no-results">
              <h3>No equipment found.</h3>
              <p>Try different search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rentals;

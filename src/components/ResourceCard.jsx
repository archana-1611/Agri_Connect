import { MapPin, Tag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ResourceCard.css';

const ResourceCard = ({ data, onRemove }) => {
  return (
    <div className="resource-card animate-fade-in">
      <div className="card-img-wrapper">
        <img src={data.image_url || data.image || 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=600'} alt={data.title} className="card-img" />
        <div className="card-badge">{data.category}</div>
        {onRemove && (
          <button 
            className="btn btn-icon btn-danger remove-btn" 
            onClick={() => onRemove(data.id)}
            style={{position: 'absolute', top: '10px', right: '10px', zIndex: 10, padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', cursor: 'pointer'}}
            title="Remove Resource"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{data.title}</h3>
        </div>
        
        <div className="card-details">
          <div className="card-location">
            <Tag size={14} /> Qty: {data.quantity}
          </div>
          <div className="card-location">
             <MapPin size={14} /> {data.location}
          </div>
        </div>
        
        <div className="card-footer">
          <div className="card-price">
            ₹{Math.round(Number(data.price))}
          </div>
          <Link to={`/resource/${data.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;

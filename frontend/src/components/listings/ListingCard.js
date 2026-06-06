import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

const ListingCard = ({ listing }) => {
  const formatPrice = (price, type) => {
    const num = parseFloat(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const typeLabel = type => ({ BUY: 'For Buy', SELL: 'For Sale', RENT: 'For Rent' }[type] || type);
  const typeBadge = type => ({ BUY: 'badge-buy', SELL: 'badge-sell', RENT: 'badge-rent' }[type] || '');

  const primaryImage = listing.images?.[0]?.fileUrl;

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-card-img">
        {primaryImage ? (
          <img src={primaryImage} alt={listing.title} loading="lazy" />
        ) : (
          <div className="no-image">🏠</div>
        )}
        <span className={`badge ${typeBadge(listing.listingType)}`}>
          {typeLabel(listing.listingType)}
        </span>
        {listing.images?.length > 1 && (
          <span className="img-count">📷 {listing.images.length}</span>
        )}
      </div>
      <div className="listing-card-body">
        <div className="listing-price">
          {formatPrice(listing.price)}
          {listing.listingType === 'RENT' && <span>/mo</span>}
        </div>
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-location">📍 {listing.city}, {listing.state}</p>
        <div className="listing-meta">
          {listing.bedrooms && (
            <span>🛏 {listing.bedrooms} Bed</span>
          )}
          {listing.bathrooms && (
            <span>🚿 {listing.bathrooms} Bath</span>
          )}
          {listing.areaSqFt && (
            <span>📐 {listing.areaSqFt} sqft</span>
          )}
        </div>
        <div className="listing-footer">
          <span className="property-type-tag">{listing.propertyType}</span>
          <span className="view-count">👁 {listing.viewCount}</span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;

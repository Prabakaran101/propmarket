import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ListingDetailPage.css';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    listingsAPI.getById(id)
      .then(res => {
        if (res.data.success) setListing(res.data.data);
      })
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsAPI.delete(id);
      toast.success('Listing deleted');
      navigate('/my-listings');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatPrice = (price, type) => {
    const num = parseFloat(price);
    const formatted = num >= 10000000
      ? `₹${(num / 10000000).toFixed(2)} Cr`
      : num >= 100000
        ? `₹${(num / 100000).toFixed(2)} L`
        : `₹${num.toLocaleString('en-IN')}`;
    return type === 'RENT' ? `${formatted}/month` : formatted;
  };

  const amenities = listing ? [
    { label: 'Furnished', value: listing.furnished, icon: '🛋️' },
    { label: 'Parking', value: listing.parking, icon: '🚗' },
    { label: 'Gym', value: listing.gym, icon: '💪' },
    { label: 'Swimming Pool', value: listing.swimmingPool, icon: '🏊' },
    { label: '24/7 Security', value: listing.security, icon: '🔒' },
    { label: 'Power Backup', value: listing.powerBackup, icon: '⚡' },
    { label: 'Lift', value: listing.lift, icon: '🛗' },
    { label: 'Water Supply', value: listing.waterSupply, icon: '💧' },
  ].filter(a => a.value) : [];

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!listing) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><h2>Listing not found</h2></div>;

  const isOwner = user?.id === listing.owner?.id;
  const typeBadgeClass = { BUY: 'badge-buy', SELL: 'badge-sell', RENT: 'badge-rent' }[listing.listingType];

  return (
    <div className="detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/listings">Listings</Link> / <span>{listing.title}</span>
        </nav>

        <div className="detail-layout">
          {/* LEFT: Images + Details */}
          <div className="detail-main">
            {/* Image Gallery */}
            <div className="gallery">
              <div className="gallery-main">
                {listing.images?.length > 0 ? (
                  <img src={listing.images[activeImg]?.fileUrl} alt={listing.title} />
                ) : (
                  <div className="no-image-lg">🏠</div>
                )}
                <span className={`badge ${typeBadgeClass}`} style={{ position: 'absolute', top: 16, left: 16 }}>
                  {listing.listingType}
                </span>
              </div>
              {listing.images?.length > 1 && (
                <div className="gallery-thumbs">
                  {listing.images.map((img, i) => (
                    <div
                      key={img.id}
                      className={`thumb ${i === activeImg ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={img.fileUrl} alt={`View ${i + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="detail-header-card">
              <div className="detail-title-row">
                <div>
                  <h1 className="detail-title">{listing.title}</h1>
                  <p className="detail-location">📍 {listing.address}, {listing.city}, {listing.state} {listing.pincode}</p>
                </div>
                <div className="detail-price">{formatPrice(listing.price, listing.listingType)}</div>
              </div>

              <div className="detail-stats">
                {listing.bedrooms && <div className="stat-chip">🛏 {listing.bedrooms} Bedrooms</div>}
                {listing.bathrooms && <div className="stat-chip">🚿 {listing.bathrooms} Bathrooms</div>}
                {listing.areaSqFt && <div className="stat-chip">📐 {listing.areaSqFt} sqft</div>}
                {listing.floor && <div className="stat-chip">🏢 Floor {listing.floor}/{listing.totalFloors}</div>}
                {listing.parkingSpots && <div className="stat-chip">🚗 {listing.parkingSpots} Parking</div>}
                {listing.yearBuilt && <div className="stat-chip">📅 Built {listing.yearBuilt}</div>}
                <div className="stat-chip">👁 {listing.viewCount} Views</div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="detail-card">
                <h2>About this Property</h2>
                <p className="description-text">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="detail-card">
                <h2>Amenities</h2>
                <div className="amenities-list">
                  {amenities.map(a => (
                    <div key={a.label} className="amenity-tag">
                      <span>{a.icon}</span> {a.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="detail-card owner-actions">
                <h2>Manage Your Listing</h2>
                <div className="action-buttons">
                  <Link to={`/edit-listing/${listing.id}`} className="btn btn-primary">
                    ✏️ Edit Listing
                  </Link>
                  {listing.status === 'ACTIVE' ? (
                    <button
                      className="btn btn-outline"
                      onClick={() => listingsAPI.updateStatus(id, 'INACTIVE')
                        .then(() => { toast.success('Listing deactivated'); window.location.reload(); })}
                    >
                      ⏸ Deactivate
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline"
                      onClick={() => listingsAPI.updateStatus(id, 'ACTIVE')
                        .then(() => { toast.success('Listing activated'); window.location.reload(); })}
                    >
                      ▶️ Activate
                    </button>
                  )}
                  {listing.listingType !== 'BUY' && (
                    <button
                      className="btn btn-outline"
                      onClick={() => listingsAPI.updateStatus(id, listing.listingType === 'RENT' ? 'RENTED' : 'SOLD')
                        .then(() => { toast.success('Status updated'); window.location.reload(); })}
                    >
                      ✅ Mark as {listing.listingType === 'RENT' ? 'Rented' : 'Sold'}
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={handleDelete}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Contact sidebar */}
          <div className="detail-sidebar">
            <div className="contact-card">
              <div className="owner-info">
                <div className="owner-avatar">
                  {listing.owner?.profileImage ? (
                    <img src={listing.owner.profileImage} alt={listing.owner.fullName} />
                  ) : (
                    <span>{listing.owner?.fullName?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="owner-label">Posted by</p>
                  <strong className="owner-name">{listing.owner?.fullName}</strong>
                </div>
              </div>

              {user ? (
                <>
                  {!showContact ? (
                    <button className="btn btn-accent btn-lg w-full" onClick={() => setShowContact(true)}>
                      📞 Show Contact
                    </button>
                  ) : (
                    <div className="contact-info">
                      {listing.owner?.phone && (
                        <a href={`tel:${listing.owner.phone}`} className="contact-item">
                          📞 {listing.owner.phone}
                        </a>
                      )}
                      <a href={`mailto:${listing.owner?.email}`} className="contact-item">
                        ✉️ {listing.owner?.email}
                      </a>
                    </div>
                  )}
                  <a
                    href={`https://wa.me/${listing.owner?.phone?.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in your property: ${listing.title}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-success btn-lg w-full"
                    style={{ marginTop: 10, background: '#16a34a', color: 'white', display: 'block', textAlign: 'center' }}
                  >
                    💬 WhatsApp
                  </a>
                </>
              ) : (
                <div className="login-prompt">
                  <p>Login to see contact details</p>
                  <Link to="/login" state={{ from: `/listings/${id}` }} className="btn btn-primary w-full">
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* Listing Summary */}
            <div className="summary-card">
              <h3>Summary</h3>
              <div className="summary-row">
                <span>Type</span>
                <strong>{listing.listingType}</strong>
              </div>
              <div className="summary-row">
                <span>Property</span>
                <strong>{listing.propertyType}</strong>
              </div>
              <div className="summary-row">
                <span>City</span>
                <strong>{listing.city}</strong>
              </div>
              <div className="summary-row">
                <span>Status</span>
                <span className={`badge badge-${listing.status.toLowerCase()}`}>{listing.status}</span>
              </div>
              <div className="summary-row">
                <span>Posted</span>
                <strong>{new Date(listing.createdAt).toLocaleDateString('en-IN')}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;

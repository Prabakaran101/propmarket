import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './MyListingsPage.css';

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(0);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await listingsAPI.getMyListings({ page, size: 10 });
      if (res.data.success) {
        setListings(res.data.data.content);
        setPagination({ totalElements: res.data.data.totalElements, totalPages: res.data.data.totalPages });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyListings(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await listingsAPI.delete(id);
      toast.success('Listing deleted');
      fetchMyListings();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await listingsAPI.updateStatus(id, status);
      toast.success('Status updated');
      fetchMyListings();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const statusBadge = (status) => {
    const map = { ACTIVE: 'badge-active', SOLD: 'badge-sold', RENTED: 'badge-sell', INACTIVE: 'badge-inactive' };
    return map[status] || '';
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1>My Listings</h1>
              <p>{pagination.totalElements} properties posted</p>
            </div>
            <Link to="/post-ad" className="btn btn-accent">+ Post New Ad</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 64 }}>🏚</div>
            <h3>No listings yet</h3>
            <p>Post your first property ad and start reaching buyers!</p>
            <Link to="/post-ad" className="btn btn-accent" style={{ marginTop: 20 }}>Post Free Ad</Link>
          </div>
        ) : (
          <>
            <div className="my-listings-table">
              {listings.map(listing => (
                <div key={listing.id} className="listing-row">
                  <div className="listing-row-img">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0].fileUrl} alt={listing.title} />
                    ) : (
                      <div className="no-img-sm">🏠</div>
                    )}
                  </div>
                  <div className="listing-row-info">
                    <Link to={`/listings/${listing.id}`} className="listing-row-title">
                      {listing.title}
                    </Link>
                    <p className="listing-row-meta">
                      📍 {listing.city}, {listing.state} &nbsp;|&nbsp;
                      💰 {formatPrice(listing.price)} &nbsp;|&nbsp;
                      👁 {listing.viewCount} views
                    </p>
                    <div className="listing-row-tags">
                      <span className={`badge badge-${listing.listingType.toLowerCase()}`}>
                        {listing.listingType}
                      </span>
                      <span className={`badge ${statusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {listing.propertyType}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Posted: {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="listing-row-actions">
                    <Link to={`/listings/${listing.id}`} className="btn btn-outline btn-sm">View</Link>
                    <Link to={`/edit-listing/${listing.id}`} className="btn btn-primary btn-sm">Edit</Link>

                    {listing.status === 'ACTIVE' && listing.listingType === 'SELL' && (
                      <button className="btn btn-sm" style={{ background: '#16a34a', color: 'white' }}
                        onClick={() => handleStatusChange(listing.id, 'SOLD')}>
                        Mark Sold
                      </button>
                    )}
                    {listing.status === 'ACTIVE' && listing.listingType === 'RENT' && (
                      <button className="btn btn-sm" style={{ background: '#ca8a04', color: 'white' }}
                        onClick={() => handleStatusChange(listing.id, 'RENTED')}>
                        Mark Rented
                      </button>
                    )}
                    {listing.status === 'ACTIVE' ? (
                      <button className="btn btn-outline btn-sm"
                        onClick={() => handleStatusChange(listing.id, 'INACTIVE')}>
                        Deactivate
                      </button>
                    ) : listing.status === 'INACTIVE' ? (
                      <button className="btn btn-outline btn-sm"
                        onClick={() => handleStatusChange(listing.id, 'ACTIVE')}>
                        Activate
                      </button>
                    ) : null}

                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(listing.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
                <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  ← Previous
                </button>
                <span style={{ fontSize: 14, color: 'var(--text-muted)', alignSelf: 'center' }}>
                  Page {page + 1} of {pagination.totalPages}
                </span>
                <button className="btn btn-outline btn-sm" disabled={page >= pagination.totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;

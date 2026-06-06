import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import ListingCard from '../components/listings/ListingCard';
import './ListingsPage.css';

const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG'];

const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(0);

  const [filters, setFilters] = useState({
    listingType: searchParams.get('listingType') || '',
    propertyType: searchParams.get('propertyType') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    keyword: searchParams.get('keyword') || '',
    sortBy: 'newest',
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 12, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await listingsAPI.search(params);
      if (res.data.success) {
        setListings(res.data.data.content);
        setPagination({
          totalElements: res.data.data.totalElements,
          totalPages: res.data.data.totalPages,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ listingType: '', propertyType: '', city: '', minPrice: '', maxPrice: '', bedrooms: '', keyword: '', sortBy: 'newest' });
    setPage(0);
  };

  return (
    <div className="listings-page">
      <div className="listings-header">
        <div className="container">
          <h1>Property Listings</h1>
          <p>{pagination.totalElements} properties found</p>

          {/* Type tabs */}
          <div className="type-tabs">
            {['', 'BUY', 'RENT', 'SELL'].map(type => (
              <button
                key={type}
                className={`type-tab ${filters.listingType === type ? 'active' : ''}`}
                onClick={() => handleFilterChange('listingType', type)}
              >
                {type || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container listings-body">
        {/* Filters sidebar */}
        <aside className="filters-panel">
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="clear-btn" onClick={clearFilters}>Clear all</button>
          </div>

          <div className="filter-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Keyword..."
              value={filters.keyword}
              onChange={e => handleFilterChange('keyword', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Mumbai, Delhi"
              value={filters.city}
              onChange={e => handleFilterChange('city', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="form-label">Property Type</label>
            <select
              className="form-control"
              value={filters.propertyType}
              onChange={e => handleFilterChange('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Bedrooms</label>
            <select
              className="form-control"
              value={filters.bedrooms}
              onChange={e => handleFilterChange('bedrooms', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Min Price (₹)</label>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              value={filters.minPrice}
              onChange={e => handleFilterChange('minPrice', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="form-label">Max Price (₹)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={e => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-control"
              value={filters.sortBy}
              onChange={e => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </aside>

        {/* Listings grid */}
        <main className="listings-main">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 64 }}>🏚</div>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or search in a different location</p>
            </div>
          ) : (
            <>
              <div className="listing-grid">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Previous
                  </button>
                  <span className="page-info">
                    Page {page + 1} of {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page >= pagination.totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ListingsPage;

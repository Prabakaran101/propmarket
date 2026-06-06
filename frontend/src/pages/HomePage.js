import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import ListingCard from '../components/listings/ListingCard';
import './HomePage.css';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listingsAPI.search({ page: 0, size: 6, sortBy: 'newest' })
      .then(res => {
        if (res.data.success) setFeatured(res.data.data.content || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('keyword', searchQuery);
    if (searchCity) params.set('city', searchCity);
    if (searchType) params.set('listingType', searchType);
    navigate(`/listings?${params.toString()}`);
  };

  const stats = [
    { label: 'Properties Listed', value: '10,000+' },
    { label: 'Happy Buyers', value: '5,000+' },
    { label: 'Cities Covered', value: '50+' },
    { label: 'Verified Sellers', value: '2,000+' },
  ];

  const categories = [
    { label: 'Buy', type: 'BUY', icon: '🏡', desc: 'Find your dream home' },
    { label: 'Rent', type: 'RENT', icon: '🔑', desc: 'Explore rental options' },
    { label: 'Sell', type: 'SELL', icon: '💰', desc: 'List your property' },
  ];

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Perfect<br /><span>Property</span></h1>
          <p className="hero-subtitle">Buy, sell or rent homes, apartments, and commercial spaces across India</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <input
              type="text"
              className="form-control"
              placeholder="City"
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
            />
            <select
              className="form-control"
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="BUY">Buy</option>
              <option value="RENT">Rent</option>
              <option value="SELL">Sell</option>
            </select>
            <button type="submit" className="btn btn-accent btn-lg">Search</button>
          </form>
        </div>
        <div className="hero-overlay" />
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">What are you looking for?</h2>
          <div className="categories-grid">
            {categories.map(cat => (
              <div
                key={cat.type}
                className="category-card"
                onClick={() => navigate(`/listings?listingType=${cat.type}`)}
              >
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.label}</h3>
                <p>{cat.desc}</p>
                <span className="category-link">Browse →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Listings</h2>
            <a href="/listings" className="view-all-link">View all →</a>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="listing-grid">
              {featured.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Post Your Property?</h2>
            <p>Reach thousands of potential buyers and renters across India</p>
            <a href="/post-ad" className="btn btn-accent btn-lg">Post Free Ad</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3>🏠 PropMarket</h3>
              <p>India's trusted real estate marketplace</p>
            </div>
            <div>
              <h4>Properties</h4>
              <ul>
                <li><a href="/listings?listingType=BUY">Buy</a></li>
                <li><a href="/listings?listingType=RENT">Rent</a></li>
                <li><a href="/listings?listingType=SELL">Sell</a></li>
              </ul>
            </div>
            <div>
              <h4>Account</h4>
              <ul>
                <li><a href="/login">Login</a></li>
                <li><a href="/register">Register</a></li>
                <li><a href="/post-ad">Post Ad</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <p>support@propmarket.in</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 PropMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

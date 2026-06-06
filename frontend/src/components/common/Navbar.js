import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏠</span>
          <span className="brand-text">PropMarket</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/listings?listingType=BUY" className={`nav-link ${location.search.includes('BUY') ? 'active' : ''}`}>
            Buy
          </Link>
          <Link to="/listings?listingType=RENT" className={`nav-link ${location.search.includes('RENT') ? 'active' : ''}`}>
            Rent
          </Link>
          <Link to="/listings?listingType=SELL" className={`nav-link ${location.search.includes('SELL') ? 'active' : ''}`}>
            Sell
          </Link>
          <Link to="/listings" className={`nav-link ${location.pathname === '/listings' && !location.search ? 'active' : ''}`}>
            All Listings
          </Link>
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/post-ad" className="btn btn-accent btn-sm">
                + Post Ad
              </Link>
              <div className="profile-menu" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} />
                  ) : (
                    <span>{user.fullName?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                {profileOpen && (
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <strong>{user.fullName}</strong>
                      <small>{user.email}</small>
                    </div>
                    <Link to="/my-listings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      📋 My Listings
                    </Link>
                    <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      👤 Profile
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

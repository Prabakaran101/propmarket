import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import PostAdPage from './pages/PostAdPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />

          {/* Protected Routes */}
          <Route path="/post-ad" element={
            <ProtectedRoute><PostAdPage /></ProtectedRoute>
          } />
          <Route path="/edit-listing/:id" element={
            <ProtectedRoute><EditListingPage /></ProtectedRoute>
          } />
          <Route path="/my-listings" element={
            <ProtectedRoute><MyListingsPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <h1 style={{ fontSize: 80, color: 'var(--border)' }}>404</h1>
              <h2>Page Not Found</h2>
              <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
                The page you're looking for doesn't exist.
              </p>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          } />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;

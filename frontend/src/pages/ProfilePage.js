import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      updateUser(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authAPI.uploadProfileImage(formData);
      if (res.data.success) {
        updateUser({ profileImage: res.data.data });
        toast.success('Profile photo updated!');
      }
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setImgLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>My Profile</h1>
          <p>Manage your account settings</p>
        </div>
      </div>

      <div className="container profile-body">
        <div className="profile-layout">
          {/* Avatar section */}
          <div className="profile-avatar-card">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-lg">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.fullName} />
                ) : (
                  <span>{user?.fullName?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <label className="avatar-upload-btn" title="Change photo">
                {imgLoading ? '⏳' : '📷'}
                <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
              </label>
            </div>
            <h2 className="profile-name">{user?.fullName}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="badge badge-active">{user?.role}</span>
          </div>

          {/* Edit form */}
          <div className="profile-form-card">
            <h2>Edit Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="fullName" className="form-control"
                  value={form.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={user?.email} disabled
                  style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
                <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-control"
                  placeholder="+91 98765 43210"
                  value={form.phone} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

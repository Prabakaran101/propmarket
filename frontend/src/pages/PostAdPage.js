import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './PostAdPage.css';

const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG'];
const STATES = ['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Maharashtra','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];

const PostAdPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', listingType: 'SELL', propertyType: 'HOUSE',
    address: '', city: '', state: '', pincode: '',
    bedrooms: '', bathrooms: '', areaSqFt: '', floor: '', totalFloors: '', parkingSpots: '', yearBuilt: '',
    furnished: false, parking: false, gym: false, swimmingPool: false,
    security: false, powerBackup: false, lift: false, waterSupply: true,
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const data = { ...form };
      // Convert empty strings to null
      Object.keys(data).forEach(k => {
        if (data[k] === '') data[k] = null;
      });
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      images.forEach(img => formData.append('images', img));

      const res = await listingsAPI.create(formData);
      if (res.data.success) {
        toast.success('Listing posted successfully!');
        navigate(`/listings/${res.data.data.id}`);
      } else {
        toast.error(res.data.message || 'Failed to post listing');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-ad-page">
      <div className="page-header">
        <div className="container">
          <h1>Post Your Property Ad</h1>
          <p>Reach lakhs of buyers and renters across India — Free!</p>
        </div>
      </div>

      <div className="container post-ad-body">
        <form onSubmit={handleSubmit} className="post-ad-form">

          {/* Section 1: Basic Info */}
          <div className="form-section">
            <h2>📋 Basic Information</h2>

            <div className="form-row-3">
              <div className="form-group span-2">
                <label className="form-label">Ad Title *</label>
                <input type="text" name="title" className="form-control"
                  placeholder="e.g. 3BHK Flat for Sale in Bandra West"
                  value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <select name="listingType" className="form-control" value={form.listingType} onChange={handleChange}>
                  <option value="SELL">Sell</option>
                  <option value="BUY">Buy</option>
                  <option value="RENT">Rent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <select name="propertyType" className="form-control" value={form.propertyType} onChange={handleChange}>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input type="number" name="price" className="form-control"
                  placeholder="e.g. 5000000" value={form.price} onChange={handleChange} required min="1" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows={4}
                placeholder="Describe your property — location advantages, nearby facilities, condition, etc."
                value={form.description} onChange={handleChange} />
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="form-section">
            <h2>📍 Location</h2>
            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <input type="text" name="address" className="form-control"
                placeholder="House/Flat No, Street, Area" value={form.address} onChange={handleChange} required />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input type="text" name="city" className="form-control"
                  placeholder="Mumbai" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <select name="state" className="form-control" value={form.state} onChange={handleChange} required>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input type="text" name="pincode" className="form-control"
                  placeholder="400001" value={form.pincode} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 3: Property Details */}
          <div className="form-section">
            <h2>🏗️ Property Details</h2>
            <div className="form-row-4">
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <input type="number" name="bedrooms" className="form-control"
                  placeholder="3" min="0" value={form.bedrooms} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <input type="number" name="bathrooms" className="form-control"
                  placeholder="2" min="0" value={form.bathrooms} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Area (sqft)</label>
                <input type="number" name="areaSqFt" className="form-control"
                  placeholder="1200" value={form.areaSqFt} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Year Built</label>
                <input type="number" name="yearBuilt" className="form-control"
                  placeholder="2020" value={form.yearBuilt} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input type="number" name="floor" className="form-control"
                  placeholder="3" value={form.floor} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Floors</label>
                <input type="number" name="totalFloors" className="form-control"
                  placeholder="10" value={form.totalFloors} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Parking Spots</label>
                <input type="number" name="parkingSpots" className="form-control"
                  placeholder="1" value={form.parkingSpots} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div className="form-section">
            <h2>✨ Amenities</h2>
            <div className="amenities-grid">
              {[
                { name: 'furnished', label: '🛋️ Furnished' },
                { name: 'parking', label: '🚗 Parking' },
                { name: 'gym', label: '💪 Gym' },
                { name: 'swimmingPool', label: '🏊 Swimming Pool' },
                { name: 'security', label: '🔒 24/7 Security' },
                { name: 'powerBackup', label: '⚡ Power Backup' },
                { name: 'lift', label: '🛗 Lift/Elevator' },
                { name: 'waterSupply', label: '💧 Water Supply' },
              ].map(item => (
                <label key={item.name} className={`amenity-checkbox ${form[item.name] ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={form[item.name]}
                    onChange={handleChange}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Section 5: Photos */}
          <div className="form-section">
            <h2>📷 Photos</h2>
            <p className="section-hint">Add up to 10 photos (JPG, PNG, WebP — max 10MB each)</p>

            <div className="image-upload-zone" onClick={() => document.getElementById('imgInput').click()}>
              <input
                id="imgInput"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageChange}
              />
              <div className="upload-placeholder">
                <span>📸</span>
                <p>Click to upload photos</p>
                <small>{images.length}/10 photos added</small>
              </div>
            </div>

            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((url, i) => (
                  <div key={i} className="preview-item">
                    <img src={url} alt={`Preview ${i + 1}`} />
                    <button type="button" className="remove-img" onClick={() => removeImage(i)}>✕</button>
                    {i === 0 && <span className="primary-badge">Main</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>
              {loading ? 'Posting...' : '🚀 Post Ad Free'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostAdPage;

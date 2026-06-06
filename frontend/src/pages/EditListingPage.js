import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './PostAdPage.css';

const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG'];
const STATES = ['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Maharashtra','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', listingType: 'SELL', propertyType: 'HOUSE',
    address: '', city: '', state: '', pincode: '',
    bedrooms: '', bathrooms: '', areaSqFt: '', floor: '', totalFloors: '', parkingSpots: '', yearBuilt: '',
    furnished: false, parking: false, gym: false, swimmingPool: false,
    security: false, powerBackup: false, lift: false, waterSupply: true,
  });

  useEffect(() => {
    listingsAPI.getById(id)
      .then(res => {
        if (res.data.success) {
          const l = res.data.data;
          setForm({
            title: l.title || '', description: l.description || '',
            price: l.price || '', listingType: l.listingType || 'SELL',
            propertyType: l.propertyType || 'HOUSE',
            address: l.address || '', city: l.city || '',
            state: l.state || '', pincode: l.pincode || '',
            bedrooms: l.bedrooms || '', bathrooms: l.bathrooms || '',
            areaSqFt: l.areaSqFt || '', floor: l.floor || '',
            totalFloors: l.totalFloors || '', parkingSpots: l.parkingSpots || '',
            yearBuilt: l.yearBuilt || '',
            furnished: l.furnished || false, parking: l.parking || false,
            gym: l.gym || false, swimmingPool: l.swimmingPool || false,
            security: l.security || false, powerBackup: l.powerBackup || false,
            lift: l.lift || false, waterSupply: l.waterSupply !== false,
          });
          setExistingImages(l.images || []);
        }
      })
      .catch(() => toast.error('Failed to load listing'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length + existingImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    setNewImages(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId) => {
    try {
      await listingsAPI.deleteImage(imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const data = { ...form };
      Object.keys(data).forEach(k => { if (data[k] === '') data[k] = null; });
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      newImages.forEach(img => formData.append('images', img));

      const res = await listingsAPI.update(id, formData);
      if (res.data.success) {
        toast.success('Listing updated successfully!');
        navigate(`/listings/${id}`);
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="post-ad-page">
      <div className="page-header">
        <div className="container">
          <h1>Edit Listing</h1>
          <p>Update your property details</p>
        </div>
      </div>

      <div className="container post-ad-body">
        <form onSubmit={handleSubmit} className="post-ad-form">
          <div className="form-section">
            <h2>📋 Basic Information</h2>
            <div className="form-row-3">
              <div className="form-group span-2">
                <label className="form-label">Ad Title *</label>
                <input type="text" name="title" className="form-control"
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
                  value={form.price} onChange={handleChange} required min="1" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows={4}
                value={form.description} onChange={handleChange} />
            </div>
          </div>

          <div className="form-section">
            <h2>📍 Location</h2>
            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <input type="text" name="address" className="form-control"
                value={form.address} onChange={handleChange} required />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input type="text" name="city" className="form-control" value={form.city} onChange={handleChange} required />
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
                <input type="text" name="pincode" className="form-control" value={form.pincode} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>🏗️ Property Details</h2>
            <div className="form-row-4">
              {[
                { name: 'bedrooms', label: 'Bedrooms' },
                { name: 'bathrooms', label: 'Bathrooms' },
                { name: 'areaSqFt', label: 'Area (sqft)' },
                { name: 'yearBuilt', label: 'Year Built' },
                { name: 'floor', label: 'Floor' },
                { name: 'totalFloors', label: 'Total Floors' },
                { name: 'parkingSpots', label: 'Parking Spots' },
              ].map(field => (
                <div key={field.name} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input type="number" name={field.name} className="form-control"
                    value={form[field.name]} onChange={handleChange} />
                </div>
              ))}
            </div>
          </div>

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
                  <input type="checkbox" name={item.name} checked={form[item.name]} onChange={handleChange} />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>📷 Photos</h2>
            {existingImages.length > 0 && (
              <>
                <p className="section-hint">Current photos (click ✕ to remove)</p>
                <div className="image-previews" style={{ marginBottom: 16 }}>
                  {existingImages.map((img, i) => (
                    <div key={img.id} className="preview-item">
                      <img src={img.fileUrl} alt={`Existing ${i + 1}`} />
                      <button type="button" className="remove-img" onClick={() => deleteExistingImage(img.id)}>✕</button>
                      {i === 0 && <span className="primary-badge">Main</span>}
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="section-hint">Add new photos</p>
            <div className="image-upload-zone" onClick={() => document.getElementById('imgInput').click()}>
              <input id="imgInput" type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
              <div className="upload-placeholder">
                <span>📸</span>
                <p>Click to add more photos</p>
                <small>{existingImages.length + newImages.length}/10 photos total</small>
              </div>
            </div>

            {newPreviews.length > 0 && (
              <div className="image-previews">
                {newPreviews.map((url, i) => (
                  <div key={i} className="preview-item">
                    <img src={url} alt={`New ${i + 1}`} />
                    <button type="button" className="remove-img" onClick={() => removeNewImage(i)}>✕</button>
                    <span className="primary-badge" style={{ background: 'var(--accent)' }}>New</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListingPage;

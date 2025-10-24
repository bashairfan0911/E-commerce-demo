import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../api';

function Profile({ userId, onLogout }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await getUserProfile(userId);
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        state: response.data.state || '',
        zip: response.data.zip || '',
        country: response.data.country || 'United States'
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(userId, formData);
      alert('✅ Profile updated successfully!');
      setEditing(false);
      loadProfile();
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('❌ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>My Profile</h2>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '3rem', 
          borderRadius: '20px', 
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '1rem' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>My Profile</h2>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '2.5rem',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Profile Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          marginBottom: '2rem',
          paddingBottom: '2rem',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {profile?.name?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
              {profile?.name}
            </h3>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>{profile?.email}</p>
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {!editing && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    onLogout();
                    navigate('/login');
                  }
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Profile Form */}
        {editing ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                Email (cannot be changed)
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  background: '#f5f5f5',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: saving ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  boxShadow: saving ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                {saving ? '⏳ Saving...' : '✓ Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  loadProfile();
                }}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#e0e0e0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h4 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              Contact Information
            </h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {formData.phone && (
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
                  <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Phone</div>
                  <div style={{ color: '#333', fontSize: '1.1rem', fontWeight: '500' }}>📞 {formData.phone}</div>
                </div>
              )}
              {formData.address && (
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
                  <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Address</div>
                  <div style={{ color: '#333', fontSize: '1.1rem', fontWeight: '500', lineHeight: '1.6' }}>
                    📍 {formData.address}<br />
                    {formData.city && formData.state && `${formData.city}, ${formData.state} ${formData.zip}`}<br />
                    {formData.country}
                  </div>
                </div>
              )}
              {!formData.phone && !formData.address && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <p>No additional information added yet.</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Click "Edit Profile" to add your contact details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;

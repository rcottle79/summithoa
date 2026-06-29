import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { CheckIcon } from '../components/Icons';

export default function Profile() {
  const { currentUser, updateProfile } = useContext(HOAContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...currentUser });
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);

  // Hardcoded premium avatar illustrations to choose from
  const defaultAvatars = [
    '/avatar-male.png',
    '/avatar-female.png'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (url) => {
    setAvatarPreview(url);
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header-area">
        <h1>My Resident Profile</h1>
        <p className="subtitle">Manage the personal information shown in the community directory.</p>
      </div>

      <div className="profile-layout">
        {/* Profile Card View */}
        <div className="profile-card-section glass-panel">
          <div className="profile-card-hero">
            <img 
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt={currentUser.name} 
              className="large-avatar"
            />
            <h2>{currentUser.name}</h2>
            <span className="badge badge-success">{currentUser.role}</span>
          </div>

          <div className="profile-details-list">
            <div className="detail-item">
              <span className="detail-label">Street Address</span>
              <span className="detail-val">{currentUser.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-val">{currentUser.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone Number</span>
              <span className="detail-val">{currentUser.phone}</span>
            </div>
            {currentUser.bio && (
              <div className="detail-item bio-item">
                <span className="detail-label">About Me</span>
                <span className="detail-val">{currentUser.bio}</span>
              </div>
            )}
          </div>

          {!isEditing && (
            <button className="btn btn-primary edit-profile-btn" onClick={() => setIsEditing(true)}>
              Edit Profile Detail
            </button>
          )}
        </div>

        {/* Profile Editing Form */}
        {isEditing && (
          <div className="profile-edit-section glass-panel">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    minLength="2"
                    maxLength="50"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Street Address <span className="required">*</span></label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 123 Maple St, Apt 4B"
                  />
                  <span className="field-hint">Your community street address.</span>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autocomplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    autocomplete="tel"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Community Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="Resident">Resident</option>
                  <option value="Board Member">Board Member</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Resident Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  className="form-control"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength="250"
                  placeholder="Share a bit about yourself with the neighbors..."
                ></textarea>
                <span className="field-hint">{250 - (formData.bio ? formData.bio.length : 0)} characters remaining.</span>
              </div>

              {/* Avatar Selector */}
              <div className="form-group">
                <label>Profile Picture</label>
                <div className="avatar-selection-area">
                  <div className="avatar-presets">
                    {defaultAvatars.map((url, i) => (
                      <div 
                        key={i} 
                        className={`avatar-preset-wrapper ${avatarPreview === url ? 'selected' : ''}`}
                        onClick={() => handleAvatarSelect(url)}
                      >
                        <img src={url} alt={`Preset Avatar ${i+1}`} className="preset-img" />
                        {avatarPreview === url && <div className="avatar-select-overlay"><CheckIcon size={16} /></div>}
                      </div>
                    ))}
                  </div>
                  <div className="avatar-file-upload">
                    <span className="upload-label">Or upload custom image:</span>
                    <input 
                      type="file" 
                      id="custom-avatar-file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="visually-hidden"
                    />
                    <label htmlFor="custom-avatar-file" className="btn btn-secondary upload-btn">
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 968px) {
          .profile-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* Profile Card */
        .profile-card-section {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 1.5rem;
        }

        .profile-card-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .large-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--accent-primary);
          margin-bottom: 1rem;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        }

        .profile-card-hero h2 {
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }

        .profile-details-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .detail-item.bio-item {
          flex-direction: column;
          gap: 0.25rem;
          border-bottom: none;
        }

        .detail-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .detail-val {
          color: var(--text-primary);
          font-weight: 600;
          word-break: break-all;
          text-align: right;
        }

        .detail-item.bio-item .detail-val {
          text-align: left;
          font-weight: 400;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .edit-profile-btn {
          width: 100%;
        }

        /* Editing Form */
        .profile-form {
          margin-top: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        .required {
          color: var(--accent-danger);
        }

        .field-hint {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        /* Avatar Picker */
        .avatar-selection-area {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .avatar-presets {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .avatar-preset-wrapper {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          overflow: hidden;
          border: 2px solid transparent;
          transition: var(--transition-fast);
        }

        .avatar-preset-wrapper:hover {
          transform: scale(1.05);
        }

        .avatar-preset-wrapper.selected {
          border-color: var(--accent-primary);
        }

        .preset-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-select-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .avatar-file-upload {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .upload-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .upload-btn {
          min-height: 36px !important;
          padding: 0.5rem 1rem !important;
          font-size: 0.85rem !important;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

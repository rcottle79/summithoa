import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { SearchIcon, PhoneIcon, EmailIcon, PlusIcon } from '../components/Icons';
import Modal from '../components/Modal';
import { formatPhoneNumber } from '../utils/phoneFormatter';

export default function Contractors() {
  const { contractors, addContractor, rateContractor, currentUser } = useContext(HOAContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const getAverageRating = (ratings) => {
    if (!ratings) return { avg: 0, count: 0 };
    const values = Object.values(ratings);
    if (values.length === 0) return { avg: 0, count: 0 };
    const sum = values.reduce((a, b) => a + b, 0);
    return { avg: (sum / values.length).toFixed(1), count: values.length };
  };

  const renderStars = (avgRating) => {
    const stars = [];
    const roundedAvg = Math.round(avgRating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          style={{ 
            color: i <= roundedAvg ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)', 
            fontSize: '1rem',
            marginRight: '1px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    category: 'Concrete',
    address: '',
    website: '',
    pocFirstName: '',
    pocLastName: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Concrete', 'Electrician', 'General Contractor', 'Painter', 'Plumber', 'Roofer'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (isSubmitting) return;

    if (!formData.companyName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.category) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addContractor(
        formData.companyName.trim(),
        formData.email.trim(),
        formData.phone.trim(),
        formData.category,
        formData.address.trim(),
        formData.website.trim(),
        formData.pocFirstName.trim(),
        formData.pocLastName.trim()
      );
      
      // Reset Form and close
      setFormData({
        companyName: '',
        email: '',
        phone: '',
        category: 'Concrete',
        address: '',
        website: '',
        pocFirstName: '',
        pocLastName: ''
      });
      setIsFormOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to submit contractor recommendation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter contractors based on search term and category
  const filteredContractors = contractors.filter(c => {
    const company = c.companyName || '';
    const pocFirst = c.pocFirstName || '';
    const pocLast = c.pocLastName || '';
    const category = c.category || '';
    const address = c.address || '';
    const website = c.website || '';

    const matchesSearch = 
      company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pocFirst.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pocLast.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      categoryFilter === 'All' || 
      category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="contractors-container animate-fade-in">
      <div className="contractors-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1>Recommended Contractors</h1>
          <p className="subtitle">View and recommend verified local contractors shared by your neighbors.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsFormOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusIcon size={18} /> Recommend Contractor
        </button>
      </div>

      <div className="directory-controls glass-panel">
        <div className="search-bar-wrapper">
          <SearchIcon className="search-icon" size={18} />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by company, category, POC name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {['All', ...categories].map(filter => (
            <button
              key={filter}
              className={`filter-btn ${categoryFilter === filter ? 'active' : ''}`}
              onClick={() => setCategoryFilter(filter)}
            >
              {filter === 'All' ? 'All Categories' : filter}
            </button>
          ))}
        </div>
      </div>

       {filteredContractors.length > 0 ? (
        <div className="directory-grid">
          {filteredContractors.map(c => {
            const avgInfo = getAverageRating(c.ratings);
            return (
              <div 
                key={c.id} 
                className="resident-card glass-card"
                onClick={() => setSelectedContractor(c)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div className="card-avatar-wrapper" style={{ background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--accent-primary)' }}>
                  {c.category === 'Electrician' ? '⚡' : 
                   c.category === 'Plumber' ? '🚰' : 
                   c.category === 'Roofer' ? '🏠' : 
                   c.category === 'General Contractor' ? '🔨' : 
                   c.category === 'Painter' ? '🎨' : '🧱'}
                </div>
                <h3 className="card-name" style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>{c.companyName}</h3>
                <div className="card-unit" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.category}</div>
                
                {/* Star Rating Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
                  {avgInfo.count > 0 ? (
                    <>
                      <div style={{ display: 'flex' }}>{renderStars(avgInfo.avg)}</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({avgInfo.avg})</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No ratings yet</span>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', alignItems: 'center' }}>
                  {c.pocFirstName && c.pocLastName && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      POC: {c.pocFirstName} {c.pocLastName}
                    </span>
                  )}
                  <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                    Recommended
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No recommended contractors found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Contractor Recommendation Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Recommend a Local Contractor"
      >
        <form onSubmit={handleFormSubmit} className="ticket-form">
          {formError && <div className="error-toast" style={{ marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>{formError}</div>}

          <div className="form-group">
            <label htmlFor="companyName">Company Name <span className="required">*</span></label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              className="form-control"
              placeholder="e.g. Summit Spark Electric"
              value={formData.companyName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="category">Category <span className="required">*</span></label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                placeholder="e.g. 5550123456"
                value={formData.phone}
                onChange={handleInputChange}
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="e.g. contact@company.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="pocFirstName">POC First Name</label>
              <input
                type="text"
                id="pocFirstName"
                name="pocFirstName"
                className="form-control"
                placeholder="e.g. Jane"
                value={formData.pocFirstName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pocLastName">POC Last Name</label>
              <input
                type="text"
                id="pocLastName"
                name="pocLastName"
                className="form-control"
                placeholder="e.g. Doe"
                value={formData.pocLastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              className="form-control"
              placeholder="e.g. 123 Main St, City, State"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website URL</label>
            <input
              type="url"
              id="website"
              name="website"
              className="form-control"
              placeholder="e.g. https://www.company.com"
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Recommendation'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Contractor Details Modal */}
      <Modal
        isOpen={!!selectedContractor}
        onClose={() => setSelectedContractor(null)}
        title="Contractor Details"
      >
        {selectedContractor && (() => {
          const avgInfo = getAverageRating(selectedContractor.ratings);
          const userRating = selectedContractor.ratings?.[currentUser.id] || 0;
          return (
            <div className="resident-details-modal">
              <div className="modal-profile-header">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {selectedContractor.category === 'Electrician' ? '⚡' : 
                   selectedContractor.category === 'Plumber' ? '🚰' : 
                   selectedContractor.category === 'Roofer' ? '🏠' : 
                   selectedContractor.category === 'General Contractor' ? '🔨' : 
                   selectedContractor.category === 'Painter' ? '🎨' : '🧱'}
                </div>
                <h3>{selectedContractor.companyName}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-success">{selectedContractor.category}</span>
                  {avgInfo.count > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <span style={{ display: 'flex' }}>{renderStars(avgInfo.avg)}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{avgInfo.avg} ({avgInfo.count} {avgInfo.count === 1 ? 'rating' : 'ratings'})</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>(No ratings yet)</span>
                  )}
                </div>
              </div>

              <div className="modal-details-body">
                {selectedContractor.pocFirstName && (
                  <div className="modal-detail-row">
                    <span className="label">Primary POC</span>
                    <span className="value">{selectedContractor.pocFirstName} {selectedContractor.pocLastName}</span>
                  </div>
                )}
                <div className="modal-detail-row">
                  <span className="label">Email</span>
                  <span className="value">{selectedContractor.email}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{formatPhoneNumber(selectedContractor.phone)}</span>
                </div>
                {selectedContractor.address && (
                  <div className="modal-detail-row">
                    <span className="label">Address</span>
                    <span className="value">{selectedContractor.address}</span>
                  </div>
                )}
                {selectedContractor.website && (
                  <div className="modal-detail-row">
                    <span className="label">Website</span>
                    <span className="value">
                      <a href={selectedContractor.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                        {selectedContractor.website}
                      </a>
                    </span>
                  </div>
                )}
                {selectedContractor.recommendedBy && (
                  <div className="modal-detail-row" style={{ borderBottom: 'none' }}>
                    <span className="label">Recommended By</span>
                    <span className="value">{selectedContractor.recommendedBy} {selectedContractor.dateAdded && `on ${selectedContractor.dateAdded}`}</span>
                  </div>
                )}

                {/* Interactive Star Rating picker for resident */}
                <div className="modal-detail-row" style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '1.25rem', borderBottom: 'none' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {userRating > 0 ? "Your Rating" : "Have you hired this contractor? Rate them:"}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => rateContractor(selectedContractor.id, star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.75rem',
                          padding: '0',
                          color: star <= (hoverRating || userRating) ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
                          transition: 'transform 0.1s ease',
                          transform: star === hoverRating ? 'scale(1.2)' : 'scale(1)'
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      You rated this contractor {userRating} stars. Click another star to change.
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <a href={`mailto:${selectedContractor.email}`} className="btn btn-primary action-link" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                  <EmailIcon size={18} /> Email Contractor
                </a>
                <a href={`tel:${selectedContractor.phone.replace(/\D/g, '')}`} className="btn btn-secondary action-link" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                  <PhoneIcon size={18} /> Call Contractor
                </a>
              </div>
            </div>
          );
        })()}
      </Modal>

      <style>{`
        /* Controls layout */
        .directory-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-bar-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 2.75rem !important;
        }

        .filter-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius-sm);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          font-size: 0.875rem;
        }

        .filter-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-color-hover);
          background: rgba(255, 255, 255, 0.05);
        }

        .filter-btn.active {
          background: var(--accent-primary);
          color: var(--text-inverse);
          border-color: var(--accent-primary);
        }

        /* Grid */
        .directory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .resident-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
        }

        .card-avatar-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 1rem;
          border: 2px solid var(--accent-primary);
        }

        .card-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-name {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .card-unit {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        /* Modal details */
        .resident-details-modal {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .modal-profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .modal-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--accent-primary);
          margin-bottom: 0.75rem;
        }

        .modal-profile-header h3 {
          margin-bottom: 0.5rem;
        }

        .modal-details-body {
          width: 100%;
          margin-bottom: 2rem;
        }

        .modal-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.95rem;
        }

        .modal-detail-row.bio-row {
          flex-direction: column;
          gap: 0.5rem;
          border-bottom: none;
        }

        .modal-detail-row .label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .modal-detail-row .value {
          color: var(--text-primary);
          font-weight: 600;
        }

        .bio-text {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.9rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          width: 100%;
        }

        .action-link {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

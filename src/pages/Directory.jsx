import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { SearchIcon, PhoneIcon, EmailIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function Directory() {
  const { residents } = useContext(HOAContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedResident, setSelectedResident] = useState(null);

  // Filter residents safely
  const filteredResidents = residents.filter(res => {
    // Only display approved accounts in the public directory
    if (!res.approved) return false;

    const name = res.name || '';
    const address = res.address || '';
    
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'All' || 
      (roleFilter === 'Board' && res.role === 'Board Member') ||
      (roleFilter === 'Resident' && res.role === 'Resident') ||
      (roleFilter === 'Admin' && res.role === 'Admin');

    return matchesSearch && matchesRole;
  });

  return (
    <div className="directory-container animate-fade-in">
      <div className="directory-header">
        <h1>Residents Directory</h1>
        <p className="subtitle">Connect with neighbors and board members in our community.</p>
      </div>

      <div className="directory-controls glass-panel">
        <div className="search-bar-wrapper">
          <SearchIcon className="search-icon" size={18} />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name or street address (e.g. Jenkins or 3C)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {['All', 'Resident', 'Board', 'Admin'].map(filter => (
            <button
              key={filter}
              className={`filter-btn ${roleFilter === filter ? 'active' : ''}`}
              onClick={() => setRoleFilter(filter)}
            >
              {filter === 'Board' ? 'Board Members' : filter === 'Admin' ? 'Administrators' : `${filter}s`}
            </button>
          ))}
        </div>
      </div>

      {filteredResidents.length > 0 ? (
        <div className="directory-grid">
          {filteredResidents.map(res => (
            <div 
              key={res.id} 
              className="resident-card glass-card"
              onClick={() => setSelectedResident(res)}
            >
              <div className="card-avatar-wrapper">
                <img 
                  src={res.avatar || '/avatar-male.png'} 
                  alt={res.name} 
                  className="card-avatar"
                />
              </div>
              <h3 className="card-name">{res.name}</h3>
              <div className="card-unit">{res.address}</div>
              <span className={`badge ${
                res.role === 'Board Member' ? 'badge-success' : 
                res.role === 'Admin' ? 'badge-danger' : 'badge-info'
              }`}>
                {res.role}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <p>No residents found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Resident Detail Modal */}
      <Modal
        isOpen={!!selectedResident}
        onClose={() => setSelectedResident(null)}
        title="Resident Information"
      >
        {selectedResident && (
          <div className="resident-details-modal">
            <div className="modal-profile-header">
              <img 
                src={selectedResident.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt={selectedResident.name} 
                className="modal-avatar"
              />
              <h3>{selectedResident.name}</h3>
              <span className="badge badge-success">{selectedResident.role}</span>
            </div>

            <div className="modal-details-body">
              <div className="modal-detail-row">
                <span className="label">Street Address</span>
                <span className="value">{selectedResident.address}</span>
              </div>
              <div className="modal-detail-row">
                <span className="label">Email</span>
                <span className="value">{selectedResident.email}</span>
              </div>
              <div className="modal-detail-row">
                <span className="label">Phone</span>
                <span className="value">{selectedResident.phone}</span>
              </div>
              {selectedResident.bio && (
                <div className="modal-detail-row bio-row">
                  <span className="label">About Neighbor</span>
                  <p className="bio-text">{selectedResident.bio}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <a href={`mailto:${selectedResident.email}`} className="btn btn-primary action-link">
                <EmailIcon size={18} /> Email Resident
              </a>
              <a href={`tel:${selectedResident.phone}`} className="btn btn-secondary action-link">
                <PhoneIcon size={18} /> Call Resident
              </a>
            </div>
          </div>
        )}
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

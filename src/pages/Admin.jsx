import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { SupportIcon, DirectoryIcon, SearchIcon, CloseIcon, ArcIcon, NotificationIcon } from '../components/Icons';
import Modal from '../components/Modal';

const defaultAvatars = [
  '/avatar-male.png',
  '/avatar-female.png'
];

export default function Admin() {
  const { 
    currentUser,
    tickets,
    residents, 
    bookings, 
    updateTicketStatus, 
    deleteTicket, 
    changeResidentRole,
    approveResident,
    denyResident,
    deleteResident,
    updateProfile,
    arcRequests,
    updateArcRequestStatus,
    announcements,
    deleteAnnouncement
  } = useContext(HOAContext);

  const [activeSubTab, setActiveSubTab] = useState('tickets'); // 'tickets' or 'residents'
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All');
  const [ticketUrgencyFilter, setTicketUrgencyFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  
  // Resident Search
  const [residentSearch, setResidentSearch] = useState('');

  // ARC Review State
  const [selectedArcRequest, setSelectedArcRequest] = useState(null);
  const [arcReviewerNotes, setArcReviewerNotes] = useState('');

  // Edit Resident State
  const [editingResident, setEditingResident] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    address: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    role: ''
  });

  // Analytics Calculations
  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'Open').length,
    inProgressTickets: tickets.filter(t => t.status === 'In Progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'Resolved').length,
    totalResidents: residents.filter(r => r.approved !== false).length,
    pendingApprovals: residents.filter(r => r.approved === false).length,
    totalBookings: bookings.length
  };

  // Filter Support Tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(ticketSearch.toLowerCase()) || 
      ticket.author.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.location.toLowerCase().includes(ticketSearch.toLowerCase());
    
    const matchesStatus = ticketStatusFilter === 'All' || ticket.status === ticketStatusFilter;
    const matchesUrgency = ticketUrgencyFilter === 'All' || ticket.urgency === ticketUrgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const activeResidents = residents.filter(res => res.approved !== false);
  const pendingResidents = residents.filter(res => res.approved === false);

  // Filter Residents
  const filteredResidents = activeResidents.filter(res => {
    return (
      res.name.toLowerCase().includes(residentSearch.toLowerCase()) ||
      res.address.toLowerCase().includes(residentSearch.toLowerCase()) ||
      res.email.toLowerCase().includes(residentSearch.toLowerCase())
    );
  });

  const handleStatusChange = (ticketId, nextStatus, comment = '') => {
    updateTicketStatus(ticketId, nextStatus, comment);
    setAdminComment('');
    setSelectedTicket(null);
  };

  const handleDeleteClick = (ticketId) => {
    if (confirm("Are you sure you want to permanently delete this support ticket? This action cannot be undone.")) {
      deleteTicket(ticketId);
    }
  };

  const handleRoleChange = (residentId, newRole) => {
    changeResidentRole(residentId, newRole);
  };

  const handleEditResidentClick = (res) => {
    setEditingResident(res);
    setEditFormData({
      id: res.id,
      name: res.name,
      address: res.address,
      email: res.email,
      phone: res.phone,
      bio: res.bio || '',
      avatar: res.avatar,
      role: res.role,
      approved: res.approved
    });
  };

  const handleEditFormSubmit = (e) => {
    e.preventDefault();
    updateProfile(editFormData);
    setEditingResident(null);
  };

  const handleOpenArcReview = (req) => {
    setSelectedArcRequest(req);
    setArcReviewerNotes(req.reviewerNotes || '');
  };

  const handleSaveArcReview = (status) => {
    updateArcRequestStatus(selectedArcRequest.id, status, arcReviewerNotes);
    setSelectedArcRequest(null);
    alert(`ARC Request updated to ${status} successfully.`);
  };

  return (
    <div className="admin-portal-container animate-fade-in">
      <div className="admin-header-area">
        <h1>Administrative Portal</h1>
        <p className="subtitle">HOA Portal Dashboard. Manage community service requests and update resident roles.</p>
      </div>

      {/* Analytics widgets grid */}
      <div className="admin-stats-grid">
        <div className="stat-box glass-panel">
          <div className="stat-value">{stats.totalTickets}</div>
          <div className="stat-label">Total Support Tickets</div>
          <div className="stat-sub">
            <span className="bullet open"></span> {stats.openTickets} Open • 
            <span className="bullet progressing"></span> {stats.inProgressTickets} Progress
          </div>
        </div>

        <div className="stat-box glass-panel">
          <div className="stat-value">{stats.totalResidents}</div>
          <div className="stat-label">Active Members</div>
          <div className="stat-sub">
            {stats.pendingApprovals > 0 ? (
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                ⚠️ {stats.pendingApprovals} Pending Approval
              </span>
            ) : (
              "All registered profiles active"
            )}
          </div>
        </div>

        <div className="stat-box glass-panel">
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-label">Clubhouse Reservations</div>
          <div className="stat-sub">Upcoming bookings scheduled</div>
        </div>
      </div>

      {/* Switch Sub Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeSubTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('tickets')}
        >
          <SupportIcon size={16} /> Manage Support Tickets
        </button>
        <button 
          className={`admin-tab-btn ${activeSubTab === 'residents' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('residents')}
        >
          <DirectoryIcon size={16} /> Manage Residents & Roles
        </button>
        <button 
          className={`admin-tab-btn ${activeSubTab === 'arc' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('arc')}
        >
          <ArcIcon size={16} /> Manage ARC Requests
        </button>
        <button 
          className={`admin-tab-btn ${activeSubTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('announcements')}
        >
          <NotificationIcon size={16} /> Manage Announcements
        </button>
      </div>

      {/* SUBTAB: Tickets Management */}
      {activeSubTab === 'tickets' && (
        <div className="admin-tickets-section glass-panel animate-fade-in">
          <div className="section-title-bar">
            <h2>Support Ticket Records</h2>
            <p className="section-desc">Resolve common area maintenance requests and track staff assignment.</p>
          </div>

          {/* Ticket Filters */}
          <div className="admin-filters-bar">
            <div className="search-bar-wrapper">
              <SearchIcon className="search-icon" size={16} />
              <input
                type="text"
                className="form-control filter-search"
                placeholder="Search ticket title, author, or location..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
              />
            </div>

            <div className="select-filters">
              <div className="filter-select-group">
                <label htmlFor="admin-status-filter">Status:</label>
                <select
                  id="admin-status-filter"
                  className="form-control select-control"
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="filter-select-group">
                <label htmlFor="admin-urgency-filter">Urgency:</label>
                <select
                  id="admin-urgency-filter"
                  className="form-control select-control"
                  value={ticketUrgencyFilter}
                  onChange={(e) => setTicketUrgencyFilter(e.target.value)}
                >
                  <option value="All">All Urgency</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ticket Records Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket Summary</th>
                  <th>Urgency</th>
                  <th>Location</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="admin-tr">
                    <td className="td-title">
                      <div className="title-text">{ticket.title}</div>
                      <div className="category-meta">{ticket.category} • Submitted {ticket.date}</div>
                    </td>
                    <td>
                      <span className={`urgency-pill urgency-${ticket.urgency.toLowerCase()}`}>
                        {ticket.urgency}
                      </span>
                    </td>
                    <td>{ticket.location}</td>
                    <td>{ticket.author}</td>
                    <td>
                      <span className={`badge ${
                        ticket.status === 'Open' ? 'badge-success' : 
                        ticket.status === 'In Progress' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="actions-td">
                      <button 
                        className="btn btn-secondary action-btn-mini"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Manage
                      </button>
                      <button 
                        className="btn btn-danger action-btn-mini delete-btn"
                        onClick={() => handleDeleteClick(ticket.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-table-td">No tickets found matching current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: Residents & Roles Management */}
      {activeSubTab === 'residents' && (
        <div className="admin-residents-section glass-panel animate-fade-in">
          <div className="section-title-bar">
            <h2>Residents & Access Permissions</h2>
            <p className="section-desc">Manage resident accounts and promote users to board or admin status.</p>
          </div>

          {/* Pending Approval List (Admins only) */}
          {pendingResidents.length > 0 && (
            <div className="pending-approvals-box" style={{ marginBottom: '2.5rem', border: '1px dashed rgba(245, 158, 11, 0.4)', borderRadius: 'var(--border-radius-sm)', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.02)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#f59e0b', margin: '0 0 0.5rem 0' }}>
                <span className="bullet progressing"></span> Pending Registration Approvals ({pendingResidents.length})
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
                The following new users have registered but cannot log in until their residency address is verified and approved.
              </p>
              
              <div className="table-responsive-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Resident Profile</th>
                      <th>Address</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingResidents.map(res => (
                      <tr key={res.id} className="admin-tr">
                        <td className="td-profile-cell">
                          <img src={res.avatar} alt={res.name} className="table-avatar" />
                          <div className="profile-text">
                            <span className="profile-name">{res.name}</span>
                          </div>
                        </td>
                        <td>{res.address}</td>
                        <td>{res.email}</td>
                        <td>{res.phone}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-success" 
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: '32px' }}
                              onClick={() => approveResident(res.id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: '32px' }}
                              onClick={() => {
                                if (confirm(`Deny and permanently delete registration request for ${res.name}?`)) {
                                  denyResident(res.id);
                                }
                              }}
                            >
                              Deny
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="admin-filters-bar single-search">
            <div className="search-bar-wrapper">
              <SearchIcon className="search-icon" size={16} />
              <input
                type="text"
                className="form-control filter-search"
                placeholder="Search resident name, address, or email address..."
                value={residentSearch}
                onChange={(e) => setResidentSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Resident Profile</th>
                  <th>Address</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Role Scope</th>
                  <th style={{ textAlign: 'right' }}>Profile Settings</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map(res => (
                  <tr key={res.id} className="admin-tr">
                    <td className="td-profile-cell">
                      <img src={res.avatar} alt={res.name} className="table-avatar" />
                      <div className="profile-text">
                        <span className="profile-name">{res.name}</span>
                        {res.id === currentUser.id && <span className="current-user-tag">You</span>}
                      </div>
                    </td>
                    <td>{res.address}</td>
                    <td>{res.email}</td>
                    <td>{res.phone}</td>
                    <td>
                      <select
                        className="form-control table-select"
                        value={res.role}
                        onChange={(e) => handleRoleChange(res.id, e.target.value)}
                        disabled={res.id === currentUser.id || currentUser.role !== 'Admin'}
                      >
                        <option value="Resident">Resident</option>
                        <option value="Board Member">Board Member</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                     <td style={{ textAlign: 'right' }}>
                       <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                         <button 
                           className="btn btn-secondary"
                           style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                           onClick={() => handleEditResidentClick(res)}
                           disabled={currentUser.role !== 'Admin'}
                         >
                           Edit Profile
                         </button>
                         <button 
                           className="btn btn-danger"
                           style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                           onClick={() => {
                             if (confirm(`Are you sure you want to permanently delete resident ${res.name}?`)) {
                               deleteResident(res.id);
                             }
                           }}
                           disabled={res.id === currentUser.id || currentUser.role !== 'Admin'}
                         >
                           Delete
                         </button>
                       </div>
                     </td>
                  </tr>
                ))}
                {filteredResidents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-table-td">No residents found matching "{residentSearch}".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: ARC Requests Management */}
      {activeSubTab === 'arc' && (
        <div className="admin-arc-section glass-panel animate-fade-in">
          <div className="section-title-bar">
            <h2>Architectural Review Board (ARC) Requests</h2>
            <p className="section-desc">
              {currentUser.role === 'Admin' 
                ? 'Review, approve, or deny property alteration requests filed by residents.'
                : 'View pending and completed architectural alteration requests (View Only).'}
            </p>
          </div>

          <div className="table-responsive-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Submission Date</th>
                  <th>Resident</th>
                  <th>Address</th>
                  <th>Modification Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {arcRequests.map(req => (
                  <tr key={req.id} className="admin-tr">
                    <td>{req.date}</td>
                    <td>{req.residentName}</td>
                    <td>{req.address}</td>
                    <td>
                      <strong>{req.projectType}</strong>
                    </td>
                    <td>
                      <span className={`status-pill status-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => handleOpenArcReview(req)}
                      >
                        {currentUser.role === 'Admin' ? 'Process Review' : 'View Request'}
                      </button>
                    </td>
                  </tr>
                ))}
                {arcRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-table-td">No architectural review requests have been submitted.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: Manage Announcements */}
      {activeSubTab === 'announcements' && (
        <div className="admin-announcements-section glass-panel animate-fade-in">
          <div className="section-title-bar">
            <h2>Community Announcements</h2>
            <p className="section-desc">
              {currentUser.role === 'Admin' 
                ? 'Manage notices and delete outdated website feed announcements.'
                : 'View published website announcements feed (View Only).'}
            </p>
          </div>

          <div className="table-responsive-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date Posted</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Flyer Image</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map(ann => (
                  <tr key={ann.id} className="admin-tr">
                    <td>{ann.date}</td>
                    <td>
                      <span className={`badge ${
                        ann.category === 'Urgent' ? 'badge-danger' : 
                        ann.category === 'Maintenance' ? 'badge-warning' :
                        ann.category === 'Event' ? 'badge-success' : 'badge-info'
                      }`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {ann.category}
                      </span>
                    </td>
                    <td>
                      <strong>{ann.title}</strong>
                    </td>
                    <td>{ann.author}</td>
                    <td>
                      {ann.image ? (
                        <img 
                          src={ann.image} 
                          alt="Flyer thumbnail" 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-danger"
                        style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete the announcement "${ann.title}"?`)) {
                            deleteAnnouncement(ann.id);
                          }
                        }}
                        disabled={currentUser.role !== 'Admin'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-table-td">No announcements have been published.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resident Details Editing Modal */}
      {editingResident && (
        <Modal 
          isOpen={!!editingResident} 
          onClose={() => setEditingResident(null)} 
          title={`Edit Profile: ${editingResident.name}`}
        >
          <form onSubmit={handleEditFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="edit-res-name">Full Name <span className="required">*</span></label>
              <input 
                type="text" 
                id="edit-res-name" 
                className="form-control" 
                value={editFormData.name} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-res-address">Street Address <span className="required">*</span></label>
              <input 
                type="text" 
                id="edit-res-address" 
                className="form-control" 
                value={editFormData.address} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-res-email">Email Address <span className="required">*</span></label>
              <input 
                type="email" 
                id="edit-res-email" 
                className="form-control" 
                value={editFormData.email} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-res-phone">Phone Number <span className="required">*</span></label>
              <input 
                type="text" 
                id="edit-res-phone" 
                className="form-control" 
                value={editFormData.phone} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-res-bio">About Bio</label>
              <textarea 
                id="edit-res-bio" 
                className="form-control" 
                style={{ minHeight: '60px' }}
                value={editFormData.bio} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            {/* Avatar Selector */}
            <div className="form-group">
              <label>Profile Picture</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="presets-horizontal" style={{ display: 'flex', gap: '0.5rem' }}>
                  {defaultAvatars.map((url, i) => (
                    <div 
                      key={i} 
                      className={`preset-wrapper ${editFormData.avatar === url ? 'selected' : ''}`}
                      style={{
                        position: 'relative',
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        border: editFormData.avatar === url ? '2px solid var(--accent-primary)' : '2px solid transparent'
                      }}
                      onClick={() => setEditFormData(prev => ({ ...prev, avatar: url }))}
                    >
                      <img src={url} alt={`Preset ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Or upload custom image:</span>
                  <input 
                    type="file" 
                    id="edit-res-avatar-file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditFormData(prev => ({ ...prev, avatar: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="visually-hidden"
                  />
                  <label htmlFor="edit-res-avatar-file" className="btn btn-secondary" style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Choose Photo
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-modal-action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingResident(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Ticket Details Management Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Admin Support Ticket Manager"
      >
        {selectedTicket && (
          <div className="admin-ticket-modal">
            <div className="ticket-detail-meta">
              <span className={`badge ${
                selectedTicket.status === 'Open' ? 'badge-success' : 
                selectedTicket.status === 'In Progress' ? 'badge-warning' : 'badge-danger'
              }`}>
                Current: {selectedTicket.status}
              </span>
              <span className={`urgency-pill urgency-${selectedTicket.urgency.toLowerCase()}`}>
                Urgency: {selectedTicket.urgency}
              </span>
            </div>

            <h3 className="admin-ticket-title">{selectedTicket.title}</h3>
            
            <div className="admin-ticket-specs">
              <div><strong>Category:</strong> {selectedTicket.category}</div>
              <div><strong>Location:</strong> {selectedTicket.location}</div>
              <div><strong>Filer:</strong> {selectedTicket.author} (Submitted {selectedTicket.date})</div>
            </div>

            <div className="admin-ticket-desc">
              <strong>Description:</strong>
              <p>{selectedTicket.description}</p>
            </div>

            {/* Comments Stream */}
            <div className="modal-comments-log">
              <h4>Response History</h4>
              <div className="comments-stream-list">
                {selectedTicket.comments.map((comment, index) => (
                  <div key={index} className="comment-bubble">
                    <div className="comment-meta">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">{comment.date}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))}
                {selectedTicket.comments.length === 0 && (
                  <div className="no-comments">No official responses recorded.</div>
                )}
              </div>
            </div>

            {/* Quick action form */}
            <div className="admin-action-box glass-panel">
              <h4>Update Ticket Status & Add Staff Comments</h4>
              
              <div className="form-group">
                <label htmlFor="modal-admin-comment">Comment Text (Log update details for the resident)</label>
                <textarea
                  id="modal-admin-comment"
                  className="form-control modal-admin-textarea"
                  placeholder="e.g. Electrician scheduled for Tuesday morning."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                ></textarea>
              </div>

              <div className="admin-modal-action-buttons">
                {selectedTicket.status !== 'Open' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleStatusChange(selectedTicket.id, 'Open', adminComment)}
                  >
                    Set Open
                  </button>
                )}
                {selectedTicket.status !== 'In Progress' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleStatusChange(selectedTicket.id, 'In Progress', adminComment)}
                  >
                    Set In Progress
                  </button>
                )}
                {selectedTicket.status !== 'Resolved' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStatusChange(selectedTicket.id, 'Resolved', adminComment)}
                  >
                    Resolve Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ARC Request Review Modal */}
      {selectedArcRequest && (
        <Modal 
          isOpen={!!selectedArcRequest}
          onClose={() => setSelectedArcRequest(null)}
          title={currentUser.role === 'Admin' ? 'ARC Architectural Board Review Desk' : 'ARC Architectural Request Details'}
        >
          <div className="arc-review-modal-content">
            <div className="review-resident-details">
              <h3>Filer Contact Details</h3>
              <div className="prefill-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Resident Name:</strong> {selectedArcRequest.residentName}</div>
                <div><strong>Street Address:</strong> {selectedArcRequest.address}</div>
                <div><strong>Email:</strong> {selectedArcRequest.email}</div>
                <div><strong>Phone Number:</strong> {selectedArcRequest.phone}</div>
              </div>
            </div>

            <hr className="divider" style={{ border: 0, height: '1px', background: 'var(--border-color)', margin: '1.25rem 0' }} />

            <div className="review-project-details">
              <h3>Modification Details</h3>
              <div><strong>Date Filed:</strong> {selectedArcRequest.date}</div>
              <div><strong>Modification Type:</strong> {selectedArcRequest.projectType}</div>
              <div style={{ marginTop: '0.75rem' }}>
                <strong>Project Specifications & Details:</strong>
                <p className="modal-description-box" style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.9rem', lineHeight: '1.5', marginTop: '0.35rem' }}>
                  {selectedArcRequest.description}
                </p>
              </div>

              {selectedArcRequest.documents && selectedArcRequest.documents.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Uploaded Blueprint Documents:</strong>
                  <div className="attached-files-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {selectedArcRequest.documents.map((doc, idx) => (
                      <a 
                        key={idx} 
                        href="#" 
                        className="file-chip" 
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Downloading simulated blueprint document: "${doc.name}"`);
                        }}
                        style={{ cursor: 'pointer', textDecoration: 'none', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}
                      >
                        <span className="file-name">💾 {doc.name} ({doc.size}) - Click to Download</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="divider" style={{ border: 0, height: '1px', background: 'var(--border-color)', margin: '1.25rem 0' }} />

            <div className="review-action-section">
              <h3>Board Determination Review</h3>
              
              {currentUser.role === 'Board Member' && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--border-radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#f59e0b', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <span>📋</span>
                  <span><strong>Reviewer Comment Mode:</strong> Board members can append notes and comments. Only administrators can approve or deny requests.</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="reviewer-notes">ARC Reviewer Notes & Comments</label>
                <textarea
                  id="reviewer-notes"
                  className="form-control"
                  placeholder="State terms, variances, or reasons for determination..."
                  value={arcReviewerNotes}
                  onChange={(e) => setArcReviewerNotes(e.target.value)}
                  rows="3"
                ></textarea>
              </div>

              <div className="review-modal-action-buttons" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                {currentUser.role === 'Admin' ? (
                  <>
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleSaveArcReview('Approved')}
                      style={{ flex: 1, minHeight: '38px', fontSize: '0.85rem' }}
                    >
                      Approve Modification
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleSaveArcReview('Denied')}
                      style={{ flex: 1, minHeight: '38px', fontSize: '0.85rem' }}
                    >
                      Deny Request
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleSaveArcReview(selectedArcRequest.status)}
                    style={{ flex: 1, minHeight: '38px', fontSize: '0.85rem' }}
                  >
                    Save Notes & Comments
                  </button>
                )}
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedArcRequest(null)}
                  style={{ flex: 1, minHeight: '38px', fontSize: '0.85rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        /* Stats dashboard */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-box {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--accent-primary);
          line-height: 1.1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .bullet.open { background-color: var(--accent-primary); }
        .bullet.progressing { background-color: var(--accent-secondary); }

        /* Admin Navigation Tabs */
        .admin-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .admin-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.75rem 1.25rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: var(--transition-fast);
        }

        .admin-tab-btn:hover {
          color: var(--text-primary);
        }

        .admin-tab-btn.active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
        }

        /* Filter layout */
        .admin-filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .admin-filters-bar.single-search .search-bar-wrapper {
          width: 100%;
        }

        .admin-filters-bar .search-bar-wrapper {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .filter-search {
          padding-left: 2.75rem !important;
        }

        .select-filters {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .select-control {
          min-height: 38px !important;
          padding: 0.5rem 1rem !important;
          font-size: 0.85rem !important;
          background: rgba(0, 0, 0, 0.3) !important;
        }

        /* Responsive Table styling */
        .table-responsive-wrapper {
          width: 100%;
          overflow-x: auto;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        .admin-table th {
          background: rgba(0, 0, 0, 0.4);
          padding: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 2px solid var(--border-color);
        }

        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .admin-tr:hover {
          background: rgba(255, 255, 255, 0.01);
        }

        .td-title .title-text {
          font-weight: 600;
          color: var(--text-primary);
        }

        .td-title .category-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .actions-header {
          text-align: right;
        }

        .actions-td {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .action-btn-mini {
          min-height: 32px !important;
          padding: 0.25rem 0.75rem !important;
          font-size: 0.8rem !important;
        }

        .action-btn-mini.delete-btn:hover {
          background: var(--accent-danger-hover);
        }

        .empty-table-td {
          text-align: center;
          padding: 3rem !important;
          color: var(--text-muted);
          font-style: italic;
        }

        /* Resident management sub-tab specifics */
        .td-profile-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .table-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--accent-primary);
        }

        .profile-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .profile-name {
          font-weight: 600;
        }

        .current-user-tag {
          font-size: 0.65rem;
          background: var(--accent-primary-glow);
          color: var(--accent-primary);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.1rem 0.4rem;
          border-radius: 9999px;
          text-transform: uppercase;
          font-weight: 700;
        }

        .table-select {
          min-height: 32px !important;
          padding: 0.25rem 0.5rem !important;
          font-size: 0.85rem !important;
          width: 140px;
          background: rgba(0, 0, 0, 0.3) !important;
        }

        /* Admin ticket modal */
        .admin-ticket-modal {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .admin-ticket-title {
          font-size: 1.35rem;
          margin-bottom: 0;
          color: var(--text-primary);
        }

        .admin-ticket-specs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 0.85rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.85rem;
        }

        .admin-ticket-desc {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          padding: 1rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.95rem;
        }

        .admin-ticket-desc p {
          margin-top: 0.5rem;
          line-height: 1.5;
          color: var(--text-primary);
        }

        .modal-comments-log h4 {
          font-size: 1rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .comments-stream-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 180px;
          overflow-y: auto;
        }

        .admin-action-box {
          background: rgba(16, 185, 129, 0.02);
          border-color: rgba(16, 185, 129, 0.1);
        }

        .admin-action-box h4 {
          margin-bottom: 0.75rem;
          color: var(--accent-primary);
        }

        .modal-admin-textarea {
          min-height: 60px !important;
        }

        .admin-modal-action-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .admin-modal-action-buttons button {
          min-height: 38px !important;
          font-size: 0.85rem !important;
        }
      `}</style>
    </div>
  );
}

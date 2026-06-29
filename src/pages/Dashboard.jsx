import React, { useContext } from 'react';
import { HOAContext } from '../context/HOAContext';
import { SupportIcon, BookingIcon, NotificationIcon, HomeIcon, DollarIcon } from '../components/Icons';

export default function Dashboard({ setActiveTab }) {
  const { currentUser, tickets, bookings, announcements } = useContext(HOAContext);

  // Filter calculations
  const activeTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;
  const myBookingsCount = bookings.filter(b => b.residentName === currentUser.name).length;
  const latestAnnouncement = announcements[0];

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-hero glass-panel">
        <div className="hero-text-content">
          <h1>Welcome Home, {currentUser.name}</h1>
          <p className="subtitle">
            Address: {currentUser.address} • Managed by SummitHOA board. View community alerts, manage repair work, and schedule amenities.
          </p>
        </div>
        <div className="quick-actions">
          <a 
            className="btn btn-primary" 
            href="https://account.appfolio.com/realms/foliospace/protocol/openid-connect/auth?activation_state&branding&client_id=client-c374a850bfaa9fb614e2a1e39fb0b621ee9b835b&portfolio_uuid&redirect_uri=https%3A%2F%2Fsummitatcheatlake.appfolio.com%2Fconnect%2Fusers%2Foauth%2Fcallback&response_type=code&scope=openid&session_timed_out=false&state=%2Fconnect%2F"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            <DollarIcon size={18} /> Pay Dues
          </a>
          <button className="btn btn-secondary" onClick={() => setActiveTab('booking')}>
            <BookingIcon size={18} /> Book Clubhouse
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('tickets')}>
            <SupportIcon size={18} /> File Repair Ticket
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-card" onClick={() => setActiveTab('tickets')}>
          <div className="metric-icon support">
            <SupportIcon size={24} />
          </div>
          <div className="metric-value">{activeTicketsCount}</div>
          <div className="metric-label">Active Support Tickets</div>
        </div>

        <div className="metric-card glass-card" onClick={() => setActiveTab('booking')}>
          <div className="metric-icon booking">
            <BookingIcon size={24} />
          </div>
          <div className="metric-value">{myBookingsCount}</div>
          <div className="metric-label">My Clubhouse Bookings</div>
        </div>

        <div className="metric-card glass-card" onClick={() => setActiveTab('notifications')}>
          <div className="metric-icon alert">
            <NotificationIcon size={24} />
          </div>
          <div className="metric-value">{announcements.length}</div>
          <div className="metric-label">Active Announcements</div>
        </div>
      </div>

      <div className="dashboard-content-split">
        {/* Announcements Stream */}
        <div className="content-section glass-panel">
          <div className="section-header">
            <h2>Latest Announcements</h2>
            <button className="text-btn" onClick={() => setActiveTab('notifications')}>View All</button>
          </div>
          {latestAnnouncement ? (
            <div className="latest-announcement-card">
              <div className="announcement-meta">
                <span className={`badge ${
                  latestAnnouncement.category === 'Event' ? 'badge-success' : 
                  latestAnnouncement.category === 'Maintenance' ? 'badge-warning' : 'badge-info'
                }`}>
                  {latestAnnouncement.category}
                </span>
                <span className="meta-date">{latestAnnouncement.date}</span>
              </div>
              <h3 className="announcement-title">{latestAnnouncement.title}</h3>
              {latestAnnouncement.category === 'Event' && latestAnnouncement.eventDate && (
                <div className="event-date-tag" style={{ marginTop: '0.25rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  📅 Event Date: {new Date(latestAnnouncement.eventDate + 'T00:00:00').toLocaleDateString('en-US', { dateStyle: 'long' })}
                  {latestAnnouncement.eventTime && ` at ${latestAnnouncement.eventTime}`}
                </div>
              )}
              {latestAnnouncement.image && (
                <div className="announcement-image-container animate-fade-in" style={{ marginBottom: '1.25rem', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '350px' }}>
                  <img src={latestAnnouncement.image} alt={latestAnnouncement.title} style={{ width: '100%', height: '100%', maxHeight: '350px', objectFit: 'cover' }} />
                </div>
              )}
              <p className="announcement-body">{latestAnnouncement.content}</p>
              <div className="announcement-author">Posted by: {latestAnnouncement.author}</div>
            </div>
          ) : (
            <div className="empty-state">No announcements posted yet.</div>
          )}
        </div>

        {/* Support Tickets overview */}
        <div className="content-section glass-panel">
          <div className="section-header">
            <h2>Recent Tickets</h2>
            <button className="text-btn" onClick={() => setActiveTab('tickets')}>Manage</button>
          </div>
          <div className="tickets-mini-list">
            {tickets.slice(0, 3).map(ticket => (
              <div key={ticket.id} className="ticket-mini-card">
                <div className="ticket-mini-info">
                  <div className="ticket-mini-title">{ticket.title}</div>
                  <div className="ticket-mini-meta">
                    <span>{ticket.category}</span> • <span>{ticket.location}</span>
                  </div>
                </div>
                <div className="ticket-mini-status">
                  <span className={`badge ${
                    ticket.status === 'Open' ? 'badge-success' : 
                    ticket.status === 'In Progress' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="empty-state">No support tickets reported.</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%);
        }

        .hero-text-content h1 {
          margin-bottom: 0.5rem;
        }

        .hero-text-content p {
          margin-bottom: 0;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .dashboard-hero {
            flex-direction: column;
            align-items: flex-start;
          }
          .quick-actions {
            width: 100%;
          }
          .quick-actions button {
            flex: 1;
          }
        }

        /* Metrics grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .metric-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1.5rem;
        }

        .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .metric-icon.support {
          background: rgba(16, 185, 129, 0.1);
          color: var(--accent-primary);
        }

        .metric-icon.booking {
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent-secondary);
        }

        .metric-icon.alert {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-info);
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 0.25rem;
        }

        .metric-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Content split */
        .dashboard-content-split {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
        }

        @media (max-width: 968px) {
          .dashboard-content-split {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .section-header h2 {
          margin-bottom: 0;
          font-size: 1.25rem;
        }

        .text-btn {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-weight: 500;
          cursor: pointer;
          font-size: 0.875rem;
          transition: var(--transition-fast);
        }

        .text-btn:hover {
          color: var(--accent-primary-hover);
          text-decoration: underline;
        }

        /* Latest announcement card */
        .latest-announcement-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 1.5rem;
        }

        .announcement-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .meta-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .announcement-title {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .announcement-body {
          color: var(--text-secondary);
          margin-bottom: 1rem;
          white-space: pre-line;
          font-size: 0.95rem;
        }

        .announcement-author {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: right;
        }

        /* Tickets mini list */
        .tickets-mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ticket-mini-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          transition: border-color var(--transition-fast);
        }

        .ticket-mini-card:hover {
          border-color: var(--border-color-hover);
        }

        .ticket-mini-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
        }

        .ticket-mini-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

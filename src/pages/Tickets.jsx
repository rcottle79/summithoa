import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { PlusIcon, CloseIcon, SupportIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function Tickets() {
  const { currentUser, tickets, addTicket, updateTicketStatus } = useContext(HOAContext);
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  
  // Submit Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Plumbing',
    location: '',
    urgency: 'Medium'
  });

  const categories = ['Plumbing', 'Electrical', 'Landscaping', 'Common Area', 'Structural', 'Painting', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTicket(
        formData.title,
        formData.description,
        formData.category,
        formData.location,
        formData.urgency
      );
      // Reset Form
      setFormData({
        title: '',
        description: '',
        category: 'Plumbing',
        location: '',
        urgency: 'Medium'
      });
      setIsSubmitModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusUpdate = (ticketId, newStatus) => {
    updateTicketStatus(ticketId, newStatus, adminComment);
    setAdminComment('');
    setSelectedTicket(prev => prev ? { ...prev, status: newStatus, comments: [
      ...prev.comments,
      ...(adminComment.trim() ? [{ author: currentUser.name, text: adminComment, date: new Date().toISOString().split('T')[0] }] : [])
    ] } : null);
  };

  // Group tickets by status
  const ticketsByStatus = {
    'Open': tickets.filter(t => t.status === 'Open'),
    'In Progress': tickets.filter(t => t.status === 'In Progress'),
    'Resolved': tickets.filter(t => t.status === 'Resolved')
  };

  const isAdminOrBoard = currentUser.role === 'Admin' || currentUser.role === 'Board Member';

  return (
    <div className="tickets-container animate-fade-in">
      <div className="tickets-header">
        <div className="header-text">
          <h1>Community Support Tickets</h1>
          <p className="subtitle">Report repair items or common area issues to the maintenance team.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsSubmitModalOpen(true)}>
          <PlusIcon size={18} /> Create Support Ticket
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div className="kanban-board">
        {['Open', 'In Progress', 'Resolved'].map(status => (
          <div key={status} className="kanban-column glass-panel">
            <div className="column-header">
              <h3>{status}</h3>
              <span className="column-count">{ticketsByStatus[status].length}</span>
            </div>

            <div className="tickets-list">
              {ticketsByStatus[status].map(ticket => (
                <div 
                  key={ticket.id} 
                  className={`ticket-card glass-card urgency-${ticket.urgency.toLowerCase()}`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="ticket-card-meta">
                    <span className="ticket-category">{ticket.category}</span>
                    <span className={`urgency-pill urgency-${ticket.urgency.toLowerCase()}`}>
                      {ticket.urgency}
                    </span>
                  </div>
                  <h4 className="ticket-title">{ticket.title}</h4>
                  <div className="ticket-location">Loc: {ticket.location}</div>
                  <div className="ticket-footer">
                    <span className="ticket-author">By: {ticket.author}</span>
                    <span className="ticket-date">{ticket.date}</span>
                  </div>
                </div>
              ))}
              {ticketsByStatus[status].length === 0 && (
                <div className="empty-column-state">No tickets in this status.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Support Ticket Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit a Repair/Support Ticket"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="title">Issue Summary / Title <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              placeholder="Brief summary (e.g. Broken elevator light)"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength="80"
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
              <label htmlFor="urgency">Urgency Level <span className="required">*</span></label>
              <select
                id="urgency"
                name="urgency"
                className="form-control"
                value={formData.urgency}
                onChange={handleInputChange}
                required
              >
                <option value="Low">Low (Non-urgent)</option>
                <option value="Medium">Medium (Attention needed)</option>
                <option value="High">High (Immediate hazard/repair)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Specific Location <span className="required">*</span></label>
            <input
              type="text"
              id="location"
              name="location"
              className="form-control"
              placeholder="e.g. Pool gate house, Courtyard B walkway"
              value={formData.location}
              onChange={handleInputChange}
              required
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              placeholder="Describe what is broken, what needs attention, or specific steps to reproduce the issue."
              value={formData.description}
              onChange={handleInputChange}
              required
              maxLength="500"
            ></textarea>
            <span className="field-hint">Explain the issue thoroughly.</span>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">File Ticket</button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details & Action Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Ticket Details"
      >
        {selectedTicket && (
          <div className="ticket-detail-modal">
            <div className="ticket-detail-meta">
              <span className={`badge ${
                selectedTicket.status === 'Open' ? 'badge-success' : 
                selectedTicket.status === 'In Progress' ? 'badge-warning' : 'badge-danger'
              }`}>
                {selectedTicket.status}
              </span>
              <span className={`urgency-pill urgency-${selectedTicket.urgency.toLowerCase()}`}>
                Urgency: {selectedTicket.urgency}
              </span>
            </div>

            <h3 className="detail-title">{selectedTicket.title}</h3>
            
            <div className="info-strip">
              <div><strong>Category:</strong> {selectedTicket.category}</div>
              <div><strong>Location:</strong> {selectedTicket.location}</div>
              <div><strong>Created By:</strong> {selectedTicket.author} on {selectedTicket.date}</div>
            </div>

            <div className="description-box">
              <strong>Issue Description:</strong>
              <p>{selectedTicket.description}</p>
            </div>

            {/* Comments Log */}
            <div className="comments-section">
              <h4>Activity & Response Notes</h4>
              <div className="comments-list">
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
                  <div className="no-comments">No updates have been posted yet.</div>
                )}
              </div>
            </div>

            {/* Board / Admin controls */}
            {isAdminOrBoard && (
              <div className="admin-controls-box glass-panel">
                <h4>Management Controls</h4>
                <div className="form-group">
                  <label htmlFor="adminComment">Response Comment / Updates</label>
                  <textarea
                    id="adminComment"
                    className="form-control admin-textarea"
                    placeholder="Enter update notes or repair actions..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="admin-actions">
                  {selectedTicket.status !== 'Open' && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleStatusUpdate(selectedTicket.id, 'Open')}
                    >
                      Re-open Ticket
                    </button>
                  )}
                  {selectedTicket.status !== 'In Progress' && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleStatusUpdate(selectedTicket.id, 'In Progress')}
                    >
                      Mark In Progress
                    </button>
                  )}
                  {selectedTicket.status !== 'Resolved' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleStatusUpdate(selectedTicket.id, 'Resolved')}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        .tickets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1.5rem;
        }

        .tickets-header h1 {
          margin-bottom: 0.25rem;
        }

        .tickets-header .subtitle {
          margin-bottom: 0;
        }

        @media (max-width: 600px) {
          .tickets-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .tickets-header button {
            width: 100%;
          }
        }

        /* Kanban Layout */
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .kanban-board {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .kanban-column {
          background: var(--bg-secondary);
          min-height: 500px;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .column-header h3 {
          margin-bottom: 0;
          font-size: 1.15rem;
        }

        .column-count {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 0.15rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 999px;
          color: var(--text-secondary);
        }

        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
        }

        .ticket-card {
          cursor: pointer;
          padding: 1rem 1.25rem;
          border-left: 4px solid var(--text-muted);
        }

        /* Urgency Border Styles */
        .ticket-card.urgency-low { border-left-color: var(--accent-info); }
        .ticket-card.urgency-medium { border-left-color: var(--accent-secondary); }
        .ticket-card.urgency-high { border-left-color: var(--accent-danger); }

        .ticket-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .ticket-category {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .urgency-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: var(--border-radius-sm);
          text-transform: uppercase;
        }

        .urgency-pill.urgency-low { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
        .urgency-pill.urgency-medium { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
        .urgency-pill.urgency-high { background: rgba(239, 68, 68, 0.1); color: #f87171; }

        .ticket-title {
          font-size: 0.975rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .ticket-location {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-color);
          padding-top: 0.5rem;
        }

        .empty-column-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          font-style: italic;
          font-size: 0.85rem;
        }

        /* Detail Modal */
        .ticket-detail-modal {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .ticket-detail-meta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .detail-title {
          font-size: 1.35rem;
          margin-bottom: 0;
          color: var(--text-primary);
        }

        .info-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 0.85rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.85rem;
        }

        .description-box {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          padding: 1rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .description-box p {
          margin-top: 0.5rem;
          line-height: 1.5;
          color: var(--text-primary);
        }

        /* Comments styling */
        .comments-section h4 {
          font-size: 1rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .comment-bubble {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 0.75rem;
          border-radius: var(--border-radius-sm);
        }

        .comment-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.35rem;
        }

        .comment-author {
          font-weight: 600;
          color: var(--accent-primary);
        }

        .comment-date {
          color: var(--text-muted);
        }

        .comment-text {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .no-comments {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* Admin Controls */
        .admin-controls-box {
          background: rgba(16, 185, 129, 0.02);
          border-color: rgba(16, 185, 129, 0.1);
        }

        .admin-controls-box h4 {
          margin-bottom: 0.75rem;
          color: var(--accent-primary);
        }

        .admin-textarea {
          min-height: 60px !important;
        }

        .admin-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .admin-actions button {
          min-height: 38px !important;
          font-size: 0.85rem !important;
        }
      `}</style>
    </div>
  );
}

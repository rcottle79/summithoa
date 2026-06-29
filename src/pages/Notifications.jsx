import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { NotificationIcon, CloseIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function Notifications() {
  const { 
    currentUser, 
    announcements, 
    deliveryLogs, 
    addAnnouncement, 
    updateAnnouncement, 
    clearLogs 
  } = useContext(HOAContext);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const [channels, setChannels] = useState({
    website: true,
    email: true,
    sms: true
  });

  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editImage, setEditImage] = useState(null);

  const handleEditClick = (ann) => {
    setEditingAnnouncement(ann);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditCategory(ann.category);
    setEditEventDate(ann.eventDate || '');
    setEditEventTime(ann.eventTime || '');
    setEditImage(ann.image || null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateAnnouncement(editingAnnouncement.id, {
      title: editTitle,
      content: editContent,
      category: editCategory,
      eventDate: editCategory === 'Event' ? editEventDate : '',
      eventTime: editCategory === 'Event' ? editEventTime : '',
      image: editImage
    });
    setEditingAnnouncement(null);
  };

  const handleChannelChange = (e) => {
    const { name, checked } = e.target;
    setChannels(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!channels.website && !channels.email && !channels.sms) {
      alert("Please select at least one distribution channel.");
      return;
    }
    
    addAnnouncement(
      title, 
      content, 
      category, 
      channels, 
      category === 'Event' ? eventDate : '', 
      category === 'Event' ? eventTime : '',
      imagePreview
    );
    
    // Reset Form
    setTitle('');
    setContent('');
    setCategory('General');
    setEventDate('');
    setEventTime('');
    setImagePreview(null);
  };

  return (
    <div className="notifications-page-container animate-fade-in">
      <div className="notifications-header">
        <h1>Announcements Dashboard</h1>
        <p className="subtitle">Publish community notices, schedule email dispatches, and trigger SMS text broadcasts.</p>
      </div>

      <div className="notifications-layout">
        {/* Left Side: Website Feed */}
        <div className="left-feed-panel glass-panel">
          <h2>Website Announcements Feed</h2>
          <p className="subtitle">This feed represents what is published live on the public facing community website.</p>
          
          <div className="announcements-stream">
            {announcements.map((ann) => (
              <div key={ann.id} className="announcement-stream-card glass-card">
                <div className="stream-card-meta">
                  <span className={`badge ${
                    ann.category === 'Urgent' ? 'badge-danger' : 
                    ann.category === 'Maintenance' ? 'badge-warning' :
                    ann.category === 'Event' ? 'badge-success' : 'badge-info'
                  }`}>
                    {ann.category}
                  </span>
                  <span className="stream-card-date">{ann.date}</span>
                </div>
                <h3 className="stream-card-title">{ann.title}</h3>
                {ann.category === 'Event' && ann.eventDate && (
                  <div className="event-date-tag" style={{ marginTop: '0.25rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📅 Event Date: {new Date(ann.eventDate + 'T00:00:00').toLocaleDateString('en-US', { dateStyle: 'long' })}
                    {ann.eventTime && ` at ${ann.eventTime}`}
                  </div>
                )}
                {ann.image && (
                  <div className="announcement-image-container animate-fade-in" style={{ marginBottom: '1rem', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '350px' }}>
                    <img src={ann.image} alt={ann.title} style={{ width: '100%', height: '100%', maxHeight: '350px', objectFit: 'cover' }} />
                  </div>
                )}
                <p className="stream-card-content">{ann.content}</p>
                <div className="stream-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Author: {ann.author}</span>
                  {(currentUser.role === 'Admin' || currentUser.name === ann.author) && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ minHeight: '28px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                      onClick={() => handleEditClick(ann)}
                    >
                      Edit Notice
                    </button>
                  )}
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="empty-feed">No announcements published to the website.</div>
            )}
          </div>
        </div>

        {/* Right Side: Create and Terminal */}
        <div className="right-side-panel">
          {/* Create Announcement Form */}
          <div className="create-notice-card glass-panel">
            <h2>Broadcast New Announcement</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="announcement-title">Notice Title <span className="required">*</span></label>
                <input
                  type="text"
                  id="announcement-title"
                  className="form-control"
                  placeholder="e.g. Annual HVAC Maintenance Scheduled"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength="80"
                />
              </div>

              <div className="form-group">
                <label htmlFor="announcement-category">Category</label>
                <select
                  id="announcement-category"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">General News</option>
                  <option value="Event">Community Event</option>
                  <option value="Maintenance">Maintenance Alert</option>
                  <option value="Urgent">Urgent / Safety Alert</option>
                </select>
              </div>

              {category === 'Event' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="animate-fade-in">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="event-date">Event Date <span className="required">*</span></label>
                    <input
                      type="date"
                      id="event-date"
                      className="form-control"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="event-time">Event Time</label>
                    <input
                      type="text"
                      id="event-time"
                      className="form-control"
                      placeholder="e.g. 1:00 PM - 5:00 PM"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="announcement-content">Announcement Details <span className="required">*</span></label>
                <textarea
                  id="announcement-content"
                  className="form-control"
                  placeholder="Type the full message details here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  maxLength="800"
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Announcement Flyer / Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Flyer Preview" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }} 
                    />
                  )}
                  <input 
                    type="file" 
                    id="announcement-image" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="visually-hidden"
                  />
                  <label htmlFor="announcement-image" className="btn btn-secondary" style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {imagePreview ? 'Change Image' : 'Upload Flyer / Image'}
                  </label>
                  {imagePreview && (
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => setImagePreview(null)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Channels checkboxes */}
              <div className="channels-checklist-group">
                <label className="checklist-group-label">Select Distribution Channels:</label>
                <div className="channels-checkboxes">
                  <label className="checkbox-item-label">
                    <input
                      type="checkbox"
                      name="website"
                      checked={channels.website}
                      onChange={handleChannelChange}
                    />
                    <span>Publish to Web Feed</span>
                  </label>

                  <label className="checkbox-item-label">
                    <input
                      type="checkbox"
                      name="email"
                      checked={channels.email}
                      onChange={handleChannelChange}
                    />
                    <span>Email Broadcast to Residents</span>
                  </label>

                  <label className="checkbox-item-label">
                    <input
                      type="checkbox"
                      name="sms"
                      checked={channels.sms}
                      onChange={handleChannelChange}
                    />
                    <span>Text/SMS Broadcast to Phones</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary broadcast-btn">
                <NotificationIcon size={18} /> Broadcast Announcement
              </button>
            </form>
          </div>
        </div>
      </div>

      {editingAnnouncement && (
        <Modal 
          isOpen={!!editingAnnouncement} 
          onClose={() => setEditingAnnouncement(null)} 
          title="Edit Announcement"
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="edit-ann-title">Title <span className="required">*</span></label>
              <input 
                type="text" 
                id="edit-ann-title" 
                className="form-control" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)}
                required
                maxLength="80"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-ann-category">Category</label>
              <select
                id="edit-ann-category"
                className="form-control"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="General">General News</option>
                <option value="Event">Community Event</option>
                <option value="Maintenance">Maintenance Alert</option>
                <option value="Urgent">Urgent / Safety Alert</option>
              </select>
            </div>

            {editCategory === 'Event' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="edit-event-date">Event Date <span className="required">*</span></label>
                  <input
                    type="date"
                    id="edit-event-date"
                    className="form-control"
                    value={editEventDate}
                    onChange={(e) => setEditEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-event-time">Event Time</label>
                  <input
                    type="text"
                    id="edit-event-time"
                    className="form-control"
                    placeholder="e.g. 1:00 PM - 5:00 PM"
                    value={editEventTime}
                    onChange={(e) => setEditEventTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="edit-ann-content">Announcement Details <span className="required">*</span></label>
              <textarea
                id="edit-ann-content"
                className="form-control"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                required
                maxLength="800"
                style={{ minHeight: '120px' }}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Announcement Flyer / Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                {editImage && (
                  <img 
                    src={editImage} 
                    alt="Flyer Preview" 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }} 
                  />
                )}
                <input 
                  type="file" 
                  id="edit-announcement-image" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditImage(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="visually-hidden"
                />
                <label htmlFor="edit-announcement-image" className="btn btn-secondary" style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  {editImage ? 'Change Image' : 'Upload Flyer / Image'}
                </label>
                {editImage && (
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => setEditImage(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setEditingAnnouncement(null)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        .notifications-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 968px) {
          .notifications-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .right-side-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Checklist styling */
        .channels-checklist-group {
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .checklist-group-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .channels-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .checkbox-item-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .checkbox-item-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary);
        }

        .broadcast-btn {
          width: 100%;
        }

        /* Terminal Console */
        .terminal-console {
          background: #020617;
          border-color: #1e293b;
          display: flex;
          flex-direction: column;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.8);
        }

        .terminal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .terminal-header h3 {
          font-size: 0.9rem;
          font-family: monospace;
          color: #38bdf8;
          margin-bottom: 0;
        }

        .clear-log-btn {
          background: transparent;
          border: 1px solid #334155;
          color: #94a3b8;
          font-family: monospace;
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .clear-log-btn:hover {
          color: #f8fafc;
          border-color: #475569;
          background: rgba(255,255,255,0.03);
        }

        .terminal-body {
          font-family: monospace;
          font-size: 0.775rem;
          min-height: 250px;
          max-height: 250px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding-right: 0.25rem;
        }

        .log-line {
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-all;
        }

        /* Log line colors */
        .log-system { color: #94a3b8; }
        .log-email { color: #f472b6; }
        .log-sms { color: #fb7185; }
        .log-website { color: #34d399; }
        .log-profile { color: #c084fc; }
        .log-support { color: #fbbf24; }
        .log-calendar { color: #60a5fa; }

        /* Right Panel stream */
        .announcements-stream {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-height: 700px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .announcement-stream-card {
          padding: 1.25rem;
        }

        .stream-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .stream-card-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .stream-card-title {
          font-size: 1.15rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .stream-card-content {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
          white-space: pre-line;
        }

        .stream-card-footer {
          display: flex;
          justify-content: flex-end;
          font-size: 0.75rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-color);
          padding-top: 0.5rem;
        }

        .empty-feed {
          text-align: center;
          color: var(--text-muted);
          font-style: italic;
          padding: 3rem 1rem;
        }
      `}</style>
    </div>
  );
}

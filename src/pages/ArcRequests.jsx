import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { ArcIcon, SearchIcon, CloseIcon, CheckIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function ArcRequests() {
  const { currentUser, arcRequests, addArcRequest, updateArcRequestStatus } = useContext(HOAContext);

  const [activeTab, setActiveTab] = useState(currentUser.role === 'Admin' ? 'all' : 'my'); // 'my' or 'all'
  const [projectType, setProjectType] = useState('Deck');
  const [description, setDescription] = useState('');
  
  // Simulated file attachments
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileNameInput, setFileNameInput] = useState('');
  const [fileSizeInput, setFileSizeInput] = useState('1.5 MB');

  // Review modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  // Filtering
  const displayedRequests = arcRequests.filter(req => {
    if (currentUser.role === 'Admin' && activeTab === 'all') return true;
    return req.residentId === currentUser.id;
  });

  const handleAddFile = (e) => {
    e.preventDefault();
    if (!fileNameInput.trim()) return;
    
    // Add extension if not present
    let name = fileNameInput.trim();
    if (!name.includes('.')) name += '.pdf';

    setAttachedFiles(prev => [...prev, { name, size: fileSizeInput }]);
    setFileNameInput('');
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide a project description.");
      return;
    }

    try {
      await addArcRequest(projectType, description, attachedFiles);
      
      // Reset Form
      setProjectType('Deck');
      setDescription('');
      setAttachedFiles([]);
      alert("Architectural Review Request submitted successfully! It is pending board approval.");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenReview = (req) => {
    setSelectedRequest(req);
    setReviewerNotes(req.reviewerNotes || '');
  };

  const handleSaveReview = (status) => {
    updateArcRequestStatus(selectedRequest.id, status, reviewerNotes);
    setSelectedRequest(null);
    alert(`Request ${status === 'Approved' ? 'approved' : 'denied'} successfully.`);
  };

  return (
    <div className="arc-requests-container animate-fade-in">
      <div className="arc-header">
        <h1>Architectural Review Board (ARC)</h1>
        <p className="subtitle">
          Submit and track property alteration requests. Fences, decks, additions, and siding require board approval.
        </p>
      </div>

      {currentUser.role === 'Admin' && (
        <div className="arc-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Pending Board Reviews ({arcRequests.filter(r => r.status === 'Pending').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Private Submissions
          </button>
        </div>
      )}

      <div className="arc-layout">
        {/* Left column: Submit request (Hidden for admins if viewing "all", or shown as a card) */}
        {activeTab === 'my' && (
          <div className="arc-form-panel glass-panel">
            <h2>Create New ARC Request</h2>
            <form onSubmit={handleSubmitRequest}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Created Date</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} 
                    disabled 
                  />
                </div>
                <div className="form-group">
                  <label>Project Classification</label>
                  <select 
                    className="form-control" 
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                  >
                    <option value="Deck">Build Deck / Patio</option>
                    <option value="Fence">Put Up Fence</option>
                    <option value="Addition / Extension">Property Addition / Extension</option>
                    <option value="Patio / Walkway">Driveway / Patio Walkway</option>
                    <option value="Landscaping">Major Landscaping / Retaining Walls</option>
                    <option value="Exterior Paint / Siding">Exterior Paint & Siding</option>
                    <option value="Other">Other Modification</option>
                  </select>
                </div>
              </div>

              {/* Prefilled Resident Contact Info details */}
              <div className="contact-prefill-info">
                <h4>Filer Information (Auto-populated)</h4>
                <div className="prefill-grid">
                  <div><strong>Name:</strong> {currentUser.name}</div>
                  <div><strong>Street Address:</strong> {currentUser.address}</div>
                  <div><strong>Email:</strong> {currentUser.email}</div>
                  <div><strong>Phone:</strong> {currentUser.phone}</div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="arc-description">Project Description & Specifications <span className="required">*</span></label>
                <textarea
                  id="arc-description"
                  className="form-control"
                  placeholder="Provide materials list, dimensions, setbacks, heights, colors, and layout specifics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="4"
                ></textarea>
              </div>

              {/* File upload simulator section */}
              <div className="file-uploader-section">
                <label>Supporting Documents & Plans</label>
                <p className="field-hint">Upload site plans, blueprints, survey docs, or brochures showing materials.</p>
                
                <div className="uploader-inputs">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. site_plan_deck.pdf" 
                    value={fileNameInput}
                    onChange={(e) => setFileNameInput(e.target.value)}
                  />
                  <select 
                    className="form-control file-size-select"
                    value={fileSizeInput}
                    onChange={(e) => setFileSizeInput(e.target.value)}
                  >
                    <option value="0.8 MB">0.8 MB</option>
                    <option value="1.5 MB">1.5 MB</option>
                    <option value="3.2 MB">3.2 MB</option>
                    <option value="5.0 MB">5.0 MB</option>
                  </select>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleAddFile}
                  >
                    Attach
                  </button>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="attached-files-list">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="file-chip">
                        <span className="file-name">📄 {file.name} ({file.size})</span>
                        <button 
                          type="button" 
                          className="remove-file-btn" 
                          onClick={() => handleRemoveFile(idx)}
                        >
                          <CloseIcon size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary submit-request-btn">
                Submit Request for Review
              </button>
            </form>
          </div>
        )}

        {/* Right column: List of requests */}
        <div className={`arc-list-panel ${activeTab === 'all' ? 'full-width' : ''}`}>
          <h2>{activeTab === 'all' ? 'Pending Board Reviews' : 'My Submission History'}</h2>
          
          <div className="requests-stack">
            {displayedRequests.map((req) => (
              <div key={req.id} className="arc-request-card glass-card">
                <div className="request-card-header">
                  <div className="request-type">
                    <span className="project-type-title">{req.projectType} Modification</span>
                    <span className="request-id">ID: #{req.id}</span>
                  </div>
                  <span className={`status-pill status-${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </div>

                <div className="request-card-body">
                  <div className="request-meta">
                    <span>Submitted: {req.date}</span>
                    {activeTab === 'all' && (
                      <span>Resident: {req.residentName} (Street Address: {req.address})</span>
                    )}
                  </div>
                  <p className="request-desc-snippet">{req.description}</p>
                  
                  {req.documents && req.documents.length > 0 && (
                    <div className="card-docs-list">
                      <strong>Attachments:</strong>
                      <div className="docs-chips">
                        {req.documents.map((doc, idx) => (
                          <span key={idx} className="card-doc-chip" title="Simulated Attachment">
                            📄 {doc.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {req.reviewerNotes && (
                    <div className="card-review-notes">
                      <strong>Reviewer Comments:</strong>
                      <p>{req.reviewerNotes}</p>
                    </div>
                  )}
                </div>

                <div className="request-card-footer">
                  {currentUser.role === 'Admin' ? (
                    <button 
                      className="btn btn-primary review-btn"
                      onClick={() => handleOpenReview(req)}
                    >
                      Process Board Review
                    </button>
                  ) : (
                    <span className="contact-details-footer">
                      Contact: {req.email} • {req.phone}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {displayedRequests.length === 0 && (
              <div className="empty-arc-list glass-panel">
                <ArcIcon size={32} />
                <p>No ARC modifications are listed under this tab.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Review Decision Modal */}
      {selectedRequest && (
        <Modal 
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title="ARC Architectural Board Review desk"
        >
          <div className="arc-review-modal-content">
            <div className="review-resident-details">
              <h3>Filer Contact details</h3>
              <div className="prefill-grid">
                <div><strong>Resident Name:</strong> {selectedRequest.residentName}</div>
                <div><strong>Street Address:</strong> {selectedRequest.address}</div>
                <div><strong>Email:</strong> {selectedRequest.email}</div>
                <div><strong>Phone Number:</strong> {selectedRequest.phone}</div>
              </div>
            </div>

            <hr className="divider" />

            <div className="review-project-details">
              <h3>Modification Details</h3>
              <div><strong>Date Filed:</strong> {selectedRequest.date}</div>
              <div><strong>Modification Type:</strong> {selectedRequest.projectType}</div>
              <div style={{ marginTop: '0.75rem' }}>
                <strong>Project Specifications & Details:</strong>
                <p className="modal-description-box">{selectedRequest.description}</p>
              </div>

              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Uploaded Blueprint Documents:</strong>
                  <div className="attached-files-list" style={{ marginTop: '0.25rem' }}>
                    {selectedRequest.documents.map((doc, idx) => (
                      <a 
                        key={idx} 
                        href="#" 
                        className="file-chip" 
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Downloading simulated blueprint document: "${doc.name}"`);
                        }}
                        style={{ cursor: 'pointer', textDecoration: 'none' }}
                      >
                        <span className="file-name">💾 {doc.name} ({doc.size}) - Click to Download</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="divider" />

            <div className="review-action-section">
              <h3>Board Determination Review</h3>
              <div className="form-group">
                <label htmlFor="reviewer-notes">ARC Reviewer Notes & Comments</label>
                <textarea
                  id="reviewer-notes"
                  className="form-control"
                  placeholder="State terms, variances, or reasons for denial..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows="3"
                ></textarea>
              </div>

              <div className="review-modal-action-buttons">
                <button 
                  className="btn btn-success" 
                  onClick={() => handleSaveReview('Approved')}
                >
                  Approve Modification
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleSaveReview('Denied')}
                >
                  Deny Request
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .arc-requests-container {
          padding: 1.5rem 0;
        }

        .arc-header {
          margin-bottom: 2rem;
        }

        .arc-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .arc-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2rem;
          align-items: start;
        }

        .arc-layout:has(.full-width) {
          grid-template-columns: 1fr;
        }

        @media (max-width: 968px) {
          .arc-layout {
            grid-template-columns: 1fr;
          }
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .contact-prefill-info {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 1rem;
          margin-bottom: 1.25rem;
        }

        .contact-prefill-info h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          color: var(--accent-primary);
        }

        .prefill-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        /* File Uploader Styles */
        .file-uploader-section {
          background: rgba(255, 255, 255, 0.01);
          border: 1px dashed var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .uploader-inputs {
          display: grid;
          grid-template-columns: 1fr 0.4fr auto;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .file-size-select {
          min-height: 38px !important;
        }

        .attached-files-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .file-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 0.25rem 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .remove-file-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .remove-file-btn:hover {
          color: var(--accent-danger);
        }

        .submit-request-btn {
          width: 100%;
          min-height: 42px !important;
        }

        /* ARC Requests list stack */
        .requests-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .arc-request-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 1.25rem;
          transition: border-color var(--transition-fast);
        }

        .arc-request-card:hover {
          border-color: var(--border-color-hover);
        }

        .request-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .request-type {
          display: flex;
          flex-direction: column;
        }

        .project-type-title {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .request-id {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .status-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-pending {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .status-approved {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-denied {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .request-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .request-desc-snippet {
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .card-docs-list {
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }

        .docs-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.25rem;
        }

        .card-doc-chip {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 0.15rem 0.4rem;
          font-size: 0.75rem;
        }

        .card-review-notes {
          background: rgba(255, 255, 255, 0.02);
          border-left: 3px solid var(--accent-primary);
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
          margin-bottom: 1rem;
        }

        .card-review-notes p {
          margin: 0.25rem 0 0 0;
          color: var(--text-secondary);
        }

        .request-card-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .contact-details-footer {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .review-btn {
          min-height: 34px !important;
          font-size: 0.85rem !important;
          padding: 0.4rem 1rem !important;
        }

        .empty-arc-list {
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-arc-list p {
          margin-top: 0.75rem;
          margin-bottom: 0;
        }

        /* Review Modal Styles */
        .arc-review-modal-content h3 {
          font-size: 1.05rem;
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: var(--accent-primary);
        }

        .divider {
          border: 0;
          height: 1px;
          background: var(--border-color);
          margin: 1.25rem 0;
        }

        .modal-description-box {
          background: rgba(0, 0, 0, 0.25);
          padding: 1rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-top: 0.35rem;
        }

        .review-modal-action-buttons {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }

        .review-modal-action-buttons button {
          flex: 1;
          min-height: 38px !important;
          font-size: 0.85rem !important;
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { CloseIcon } from './Icons';

export default function Modal({ isOpen, onClose, title, children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset position when opening
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleMouseDown = (e) => {
    // Left-click only, exclude close button clicks
    if (e.button !== 0) return;
    if (e.target.closest('.modal-close-btn')) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.modal-close-btn')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'default',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
      >
        <div 
          className="modal-header"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: 'grab', userSelect: 'none' }}
        >
          <h2 id="modal-title">{title}</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>

      <style>{`
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          margin-bottom: 0;
          font-size: 1.35rem;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 50%;
          transition: var(--transition-fast);
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .modal-body {
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 0.25rem;
        }
      `}</style>
    </div>
  );
}

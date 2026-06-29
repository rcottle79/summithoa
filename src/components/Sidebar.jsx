import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { 
  DashboardIcon, 
  ProfileIcon, 
  DirectoryIcon, 
  SupportIcon, 
  BookingIcon, 
  NotificationIcon, 
  HomeIcon,
  SettingsIcon,
  BylawsIcon,
  ArcIcon
} from './Icons';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, logout } = useContext(HOAContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminOrBoard = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Board Member');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'directory', label: 'Directory', icon: <DirectoryIcon /> },
    { id: 'booking', label: 'Clubhouse Booking', icon: <BookingIcon /> },
    { id: 'notifications', label: 'Announcements', icon: <NotificationIcon /> },
    { id: 'arc', label: 'ARC Requests', icon: <ArcIcon /> },
    { id: 'tickets', label: 'Support Tickets', icon: <SupportIcon /> },
    { id: 'bylaws', label: 'By-Laws', icon: <BylawsIcon /> }
  ];

  // Dynamically push admin tab if user has role permissions
  if (isAdminOrBoard) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: <SettingsIcon /> });
  }

  const handleLogout = () => {
    logout();
    setActiveTab('dashboard'); // reset tab on logout
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <header className="mobile-header">
        <div className="mobile-logo-area">
          <HomeIcon className="logo-icon" size={24} />
          <span className="logo-text">SummitHOA</span>
        </div>
        <button 
          className="mobile-menu-toggle"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
        </button>
      </header>

      {/* Sidebar Component */}
      <aside className={`sidebar-container glass-panel ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="logo-area">
          <HomeIcon className="logo-icon" size={28} />
          <span className="logo-text">SummitHOA</span>
        </div>

        {currentUser && (
          <button 
            className="current-user-card"
            onClick={() => {
              setActiveTab('profile');
              setMobileOpen(false);
            }}
          >
            <img 
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt={currentUser.name} 
              className="user-avatar"
            />
            <div className="user-info">
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role-unit">{currentUser.address} • {currentUser.role}</div>
            </div>
          </button>
        )}

        <nav className="nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
          <div className="system-status">
            <span className="status-indicator online"></span>
            <span className="status-label">Community Portal Live</span>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div 
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Styles for Sidebar */}
      <style>{`
        /* Sidebar container */
        .sidebar-container {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          border-radius: 0;
          border-top: none;
          border-left: none;
          border-bottom: none;
          z-index: 100;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          transition: transform var(--transition-normal);
          overflow-y: auto;
        }

        /* Logo styling */
        .logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .logo-icon {
          color: var(--accent-primary);
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 40%, var(--accent-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Current user card in sidebar */
        .current-user-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          margin-bottom: 2rem;
          cursor: pointer;
          transition: background var(--transition-fast), border-color var(--transition-fast);
          width: 100%;
          text-align: left;
          font-family: inherit;
        }

        .current-user-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--accent-primary);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--accent-primary);
        }

        .user-info {
          overflow: hidden;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role-unit {
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Nav menu */
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          background: transparent;
          border: none;
          border-radius: var(--border-radius-sm);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          padding-left: 1.25rem;
        }

        .nav-item.active {
          color: var(--text-inverse);
          background: var(--accent-primary);
          box-shadow: 0 4px 12px var(--accent-primary-glow);
        }

        .nav-item.active :global(.custom-icon) {
          stroke-width: 2.5px;
        }

        /* Sidebar footer */
        .sidebar-footer {
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .logout-btn:hover {
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.03);
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-indicator.online {
          background-color: var(--accent-primary);
          box-shadow: 0 0 8px var(--accent-primary);
        }

        .status-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Mobile header styles */
        .mobile-header {
          display: none;
        }

        /* Responsive Breakpoint */
        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: rgba(11, 15, 25, 0.8);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border-color);
            padding: 0 1.5rem;
            z-index: 101;
          }

          .mobile-logo-area {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .mobile-menu-toggle {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 24px;
            height: 18px;
            background: transparent;
            border: none;
            cursor: pointer;
          }

          .burger-bar {
            display: block;
            width: 100%;
            height: 2px;
            background: var(--text-primary);
            border-radius: 1px;
          }

          .sidebar-container {
            width: 280px;
            transform: translateX(-100%);
            box-shadow: none;
          }

          .sidebar-container.mobile-open {
            transform: translateX(0);
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
          }

          .mobile-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
            z-index: 99;
          }
        }
      `}</style>
    </>
  );
}

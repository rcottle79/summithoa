import React, { useState, useContext } from 'react';
import { HOAProvider, HOAContext } from './context/HOAContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Directory from './pages/Directory';
import Contractors from './pages/Contractors';
import Tickets from './pages/Tickets';
import Booking from './pages/Booking';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Bylaws from './pages/Bylaws';
import ArcRequests from './pages/ArcRequests';
import './styles/main.css';

function MainAppLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { currentUser } = useContext(HOAContext);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'profile':
        return <Profile />;
      case 'directory':
        return <Directory />;
      case 'contractors':
        return <Contractors />;
      case 'tickets':
        return <Tickets />;
      case 'booking':
        return <Booking />;
      case 'notifications':
        return <Notifications />;
      case 'bylaws':
        return <Bylaws />;
      case 'arc':
        return <ArcRequests />;
      case 'admin':
        // Double safety gate
        if (currentUser.role === 'Admin' || currentUser.role === 'Board Member') {
          return <Admin />;
        }
        return <Dashboard setActiveTab={setActiveTab} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

function AuthRouter() {
  const { isAuthenticated } = useContext(HOAContext);

  if (!isAuthenticated) {
    return <Auth />;
  }

  return <MainAppLayout />;
}

export default function App() {
  return (
    <HOAProvider>
      <AuthRouter />
    </HOAProvider>
  );
}

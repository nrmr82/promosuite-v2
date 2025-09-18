import React from 'react';
import Sidebar from './Sidebar';
import './MainLayout.css';




const MainLayout = ({ children, currentView, onNavigate, user, onLogout }) => {
  const hasSidebar = !!user;
  
  return (
    <div className="main-layout">
      {hasSidebar && (
        <Sidebar 
          currentView={currentView}
          onNavigate={onNavigate}
          user={user}
          onLogout={onLogout}
        />
      )}
      <div className={`main-content ${hasSidebar ? 'with-sidebar' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;

import React from 'react';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = ({ children, user, onLogout, credits }) => {
  return (
    <div className="main-layout main-layout--mobile">
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        credits={credits}
      />
      <main className="main-content main-content--mobile">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
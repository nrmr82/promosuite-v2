import React from 'react';

const TestLayout = ({ user, children }) => {
  return (
      <div style={{
        display: 'flex',
        height: '100vh',
        background: '#f0f0f0'
      }}>
        {/* Test Sidebar */}
        <div style={{
          width: '280px',
          background: '#2c3e50',
          color: 'white',
          padding: '20px'
        }}>
          <h3>Test Sidebar</h3>
          <p>User: {user?.email || 'No user'}</p>
          <ul>
            <li>Dashboard</li>
            <li>Templates</li>
            <li>Profile</li>
            <li>Settings</li>
          </ul>
        </div>
        
        {/* Test Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          background: 'white'
        }}>
          <h1>Test Content Area</h1>
          <p>If you can see this, the basic layout is working!</p>
          <p>User data: {JSON.stringify(user, null, 2)}</p>
          {children}
        </div>
      </div>
  );
};

export default TestLayout;

// Mobile App Test Entry Point
// This file can be used to test the mobile app independently

import React from 'react';
import ReactDOM from 'react-dom/client';
import MobileApp from './MobileApp';
import './mobile.css';

// Create root and render mobile app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MobileApp />
  </React.StrictMode>
);

console.log('📱 PromoSuite Mobile App Loaded!');
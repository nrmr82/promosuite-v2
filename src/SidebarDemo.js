import React, { useState } from 'react';
import { ProductProvider, useProduct } from './contexts/ProductContext';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import AppLayout from './components/AppLayout';
import Dashboard from './components/Dashboard';
import UserCollections from './components/UserCollections';
import MediaUpload from './components/MediaUpload';

// Demo component to show the sidebar system working
const SidebarDemoContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentView, setCurrentView] = useState('dashboard');
  const { user } = useAuth();
  const { currentProduct, switchProduct } = useProduct();

  // Handle navigation from sidebar
  const handleNavigate = (path, pageId) => {
    console.log(`Navigate to: ${path} (${pageId})`);
    setCurrentPage(pageId);
    
    // Map page IDs to views
    const viewMap = {
      'home': 'dashboard',
      'collections': 'collections',
      'upload-images': 'upload-images',
      'upload-videos': 'upload-videos',
      'templates': 'templates',
      'create-flyer': 'create-flyer',
      'my-flyers': 'flyers',
      'ai-generator': 'ai-generator',
      'profile': 'profile',
      'pricing': 'pricing',
      'settings': 'settings'
    };
    
    setCurrentView(viewMap[pageId] || 'dashboard');
  };

  // Render different content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} onNavigateToTool={switchProduct} />;
        
      case 'collections':
        return (
          <UserCollections 
            onEditTemplate={(template) => console.log('Edit template:', template)}
            onEditFlyer={(flyer) => console.log('Edit flyer:', flyer)}
            onClose={() => setCurrentView('dashboard')}
          />
        );
        
      case 'upload-images':
        return (
          <div style={{ padding: '24px' }}>
            <h1>Upload Images</h1>
            <p>Upload images for your {currentProduct} projects</p>
            <MediaUpload 
              type="image" 
              currentProduct={currentProduct}
              onUploadComplete={(file) => {
                console.log('Image uploaded:', file);
                alert('Image uploaded successfully!');
              }}
              onUploadError={(error) => {
                console.error('Upload error:', error);
                alert('Upload failed: ' + error);
              }}
            />
          </div>
        );
        
      case 'upload-videos':
        return (
          <div style={{ padding: '24px' }}>
            <h1>Upload Videos</h1>
            <p>Upload videos for your {currentProduct} projects</p>
            <MediaUpload 
              type="video" 
              currentProduct={currentProduct}
              onUploadComplete={(file) => {
                console.log('Video uploaded:', file);
                alert('Video uploaded successfully!');
              }}
            />
          </div>
        );
        
      case 'templates':
        return (
          <div style={{ padding: '24px' }}>
            <h1>FlyerPro Templates</h1>
            <p>Browse and manage your flyer templates</p>
            <div style={{ background: '#f3f4f6', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
              <p>Your existing FlyerPro templates component would go here</p>
              <button onClick={() => setCurrentView('create-flyer')} style={{ 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}>
                Create New Flyer
              </button>
            </div>
          </div>
        );
        
      case 'create-flyer':
        return (
          <div style={{ padding: '24px' }}>
            <h1>Create Flyer</h1>
            <p>Design a new flyer from scratch</p>
            <div style={{ background: '#f3f4f6', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
              <p>Your FlyerPro editor component would go here</p>
              <button onClick={() => alert('Opening FlyerPro editor...')} style={{ 
                background: '#10b981', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}>
                Start Creating
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <div style={{ padding: '24px' }}>
            <h1>{currentView.charAt(0).toUpperCase() + currentView.slice(1)}</h1>
            <p>Content for {currentView} page</p>
            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
              <p>Your {currentView} component would be implemented here.</p>
              <p><strong>Current Product:</strong> {currentProduct}</p>
              <p><strong>Page ID:</strong> {currentPage}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </AppLayout>
  );
};

// Main demo component
const SidebarDemo = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        maxWidth: '600px', 
        margin: '0 auto' 
      }}>
        <h1>PromoSuite Sidebar Demo</h1>
        <p>Please log in to see the sidebar system in action.</p>
        <div style={{ 
          background: '#fffbeb', 
          border: '1px solid #fbbf24', 
          padding: '20px', 
          borderRadius: '8px', 
          margin: '20px 0' 
        }}>
          <h3>🎯 What you'll see after logging in:</h3>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>✅ Context-aware sidebar (FlyerPro vs SocialSpark)</li>
            <li>✅ Product switching with persistent state</li>
            <li>✅ Mobile-responsive design</li>
            <li>✅ Media upload functionality</li>
            <li>✅ Collections browser</li>
            <li>✅ Professional UI with animations</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <ProductProvider>
      <SidebarDemoContent />
    </ProductProvider>
  );
};

export default SidebarDemo;

// Example: How to integrate the new Sidebar system into your existing PromoSuite app

import React from 'react';
import { ProductProvider } from '../contexts/ProductContext';
import { AuthProvider } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import Dashboard from '../components/Dashboard';
import UserCollections from '../components/UserCollections';
import MediaUpload from '../components/MediaUpload';
import PricingView from '../components/PricingView';

// 1. Wrap your app with ProductProvider
function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <MainApp />
      </ProductProvider>
    </AuthProvider>
  );
}

// 2. Use AppLayout for pages that need the sidebar
function MainApp() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [currentComponent, setCurrentComponent] = React.useState('dashboard');

  // Handle navigation from sidebar
  const handleNavigate = (path, pageId) => {
    setCurrentPage(pageId);
    
    // Map pageId to components
    const componentMap = {
      'home': 'dashboard',
      'collections': 'collections',
      'upload-images': 'image-upload',
      'upload-videos': 'video-upload',
      'profile': 'profile',
      'pricing': 'pricing',
      // FlyerPro specific
      'templates': 'flyerpro-templates',
      'create-flyer': 'flyerpro-create',
      'my-flyers': 'flyerpro-flyers',
      'ai-generator': 'flyerpro-ai',
      'media-library': 'flyerpro-media',
      'flyer-analytics': 'flyerpro-analytics',
      // SocialSpark specific
      'dashboard-social': 'socialspark-dashboard',
      'create-post': 'socialspark-create',
      'scheduled-posts': 'socialspark-scheduled',
      'calendar': 'socialspark-calendar',
      'ai-copywriter': 'socialspark-ai',
      'content-library': 'socialspark-content',
      'platforms': 'socialspark-platforms',
      'instagram': 'socialspark-instagram',
      'facebook': 'socialspark-facebook',
      'twitter': 'socialspark-twitter',
      'linkedin': 'socialspark-linkedin',
      'analytics': 'socialspark-analytics',
      'engagement': 'socialspark-engagement',
      'audience': 'socialspark-audience',
      'pricing': 'pricing-view'
    };
    
    setCurrentComponent(componentMap[pageId] || 'dashboard');
  };

  // Render current component
  const renderContent = () => {
    switch (currentComponent) {
      case 'pricing-view':
        return <PricingView />;
      
      case 'dashboard':
        return <Dashboard />;
      case 'collections':
        return <UserCollections />;
      case 'image-upload':
        return (
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Upload Images</h1>
              <p className="page-subtitle">Upload images for your projects</p>
            </div>
            <MediaUpload 
              type="image" 
              onUploadComplete={(file) => console.log('Image uploaded:', file)}
            />
          </div>
        );
      case 'video-upload':
        return (
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Upload Videos</h1>
              <p className="page-subtitle">Upload videos for your projects</p>
            </div>
            <MediaUpload 
              type="video" 
              onUploadComplete={(file) => console.log('Video uploaded:', file)}
            />
          </div>
        );
        
      // FlyerPro Components
      case 'flyerpro-templates':
        return (
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Templates</h1>
              <p className="page-subtitle">Browse and manage your flyer templates</p>
            </div>
            <div className="content-placeholder">
              <p>FlyerPro Templates component would go here</p>
            </div>
          </div>
        );
        
      case 'flyerpro-create':
        return (
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Create Flyer</h1>
              <p className="page-subtitle">Design a new flyer from scratch</p>
            </div>
            <div className="content-placeholder">
              <p>FlyerPro Editor component would go here</p>
            </div>
          </div>
        );
        
      // SocialSpark Components
      case 'socialspark-dashboard':
        return (
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Social Dashboard</h1>
              <p className="page-subtitle">Overview of your social media activity</p>
            </div>
            <div className="content-placeholder">
              <p>SocialSpark Dashboard component would go here</p>
            </div>
          </div>
        );
        
      case 'socialspark-create':
        return (
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Create Post</h1>
              <p className="page-subtitle">Create and schedule social media posts</p>
            </div>
            <div className="content-placeholder">
              <p>SocialSpark Post Creator component would go here</p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Page Not Found</h1>
              <p className="page-subtitle">The requested page could not be found</p>
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
}

// 3. Example of a component that uses the ProductContext
function ExampleProductAwareComponent() {
  const { currentProduct, switchProduct, currentConfig } = useProduct();
  
  return (
    <div className="product-aware-component">
      <h2>Current Product: {currentConfig.displayName}</h2>
      <p>{currentConfig.description}</p>
      
      <div className="product-features">
        <h3>Features:</h3>
        <ul>
          {currentConfig.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
      
      <div className="product-switcher">
        <button 
          onClick={() => switchProduct('flyerpro')}
          className={currentProduct === 'flyerpro' ? 'active' : ''}
        >
          FlyerPro
        </button>
        <button 
          onClick={() => switchProduct('socialspark')}
          className={currentProduct === 'socialspark' ? 'active' : ''}
        >
          SocialSpark
        </button>
      </div>
    </div>
  );
}

// 4. Example of using the withLayout HOC
const ProfilePageWithSidebar = withLayout(
  function ProfilePage() {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
        <div className="profile-content">
          {/* Profile form would go here */}
        </div>
      </div>
    );
  },
  { currentPage: 'profile' }
);

export default App;

/* 
INTEGRATION CHECKLIST:

1. ✅ Install dependencies (already have lucide-react, react-icons)

2. ✅ Add ProductProvider to your app root:
   <ProductProvider>
     <App />
   </ProductProvider>

3. ✅ Use AppLayout for authenticated pages:
   <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
     <YourComponent />
   </AppLayout>

4. ✅ Handle navigation in your components:
   const handleNavigate = (path, pageId) => {
     // Your routing logic here
     router.push(path);
   };

5. 🔲 Create actual page components for each sidebar item

6. 🔲 Add routing integration (React Router, Next.js, etc.)

7. 🔲 Style customization based on your brand colors

8. 🔲 Add database tables for media uploads:
   - media table for file management
   - Update user_usage for tracking uploads

FEATURES PROVIDED:

✅ Context-aware sidebar (FlyerPro vs SocialSpark)
✅ Mobile-responsive with overlay
✅ Collapsible sidebar for desktop
✅ Product switching with persistent state
✅ Media upload component with drag & drop
✅ Professional UI with animations
✅ User collections integration
✅ Subscription-aware features
✅ Keyboard shortcuts support (Ctrl+B to toggle)
✅ Accessibility features (focus states, ARIA)

SIDEBAR NAVIGATION STRUCTURE:

FlyerPro:
- Dashboard
- My Collections
- Templates
- Create Flyer (highlighted)
- My Flyers  
- AI Generator (with AI badge)
- Media Library
- Upload Images
- Upload Videos
- Brand Assets
- Flyer Analytics

SocialSpark:
- Dashboard
- My Collections
- Social Dashboard
- Create Post (highlighted)
- Scheduled Posts
- Content Calendar
- AI Copywriter (with AI badge)
- Content Library
- Upload Media
- Video Editor
- Hashtag Research
- Connected Accounts
- Instagram/Facebook/Twitter/LinkedIn
- Analytics
- Engagement
- Audience Insights

Account (always visible):
- Profile
- Pricing
- Settings
- Help & Support

*/

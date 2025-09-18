# PromoSuite Sidebar System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Wrap Your App with ProductProvider

```javascript
// App.js
import React from 'react';
import { ProductProvider } from './contexts/ProductContext';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <YourMainApp />
      </ProductProvider>
    </AuthProvider>
  );
}
```

### 2. Use AppLayout for Pages with Sidebar

```javascript
// Any page component
import React from 'react';
import AppLayout from './components/AppLayout';

function Dashboard() {
  return (
    <AppLayout currentPage="home">
      <div className="page-container">
        <h1>Dashboard Content</h1>
      </div>
    </AppLayout>
  );
}
```

### 3. Handle Navigation

```javascript
function MainApp() {
  const handleNavigate = (path, pageId) => {
    // Your routing logic here
    console.log(`Navigate to ${path}`);
  };

  return (
    <AppLayout 
      currentPage="dashboard"
      onNavigate={handleNavigate}
    >
      <YourContent />
    </AppLayout>
  );
}
```

## 📱 Sidebar Features

### Product-Aware Navigation
- **FlyerPro**: Templates, Flyers, Media Library, AI Generator
- **SocialSpark**: Posts, Calendar, Platforms, Analytics
- **Universal**: Dashboard, Collections, Profile, Settings

### Responsive Design
- **Desktop**: Collapsible sidebar (280px ↔ 70px)
- **Mobile**: Overlay sidebar with mobile header
- **Touch**: Optimized for mobile interaction

### Keyboard Support
- **Ctrl+B**: Toggle sidebar
- **Tab**: Navigate through items
- **Enter/Space**: Activate items

## 🎨 Component Usage

### Media Upload Component

```javascript
import MediaUpload from './components/MediaUpload';

<MediaUpload
  type="image"                    // 'image', 'video', 'all'
  multiple={true}                 // Allow multiple files
  maxSize={10}                    // Max file size in MB
  currentProduct="flyerpro"       // Current product context
  onUploadComplete={(file) => {
    console.log('File uploaded:', file);
  }}
/>
```

### User Collections Component

```javascript
import UserCollections from './components/UserCollections';

<UserCollections
  onEditTemplate={(template) => {
    // Handle template editing
  }}
  onEditFlyer={(flyer) => {
    // Handle flyer editing
  }}
  onClose={() => setShowCollections(false)}
/>
```

### Product Context Hook

```javascript
import { useProduct } from './contexts/ProductContext';

function MyComponent() {
  const {
    currentProduct,         // 'flyerpro' or 'socialspark'
    switchProduct,          // Function to switch products
    sidebarCollapsed,       // Boolean for sidebar state
    toggleSidebar,          // Function to toggle sidebar
    currentConfig           // Current product configuration
  } = useProduct();

  return (
    <div>
      <h1>{currentConfig.displayName}</h1>
      <button onClick={() => switchProduct('socialspark')}>
        Switch to SocialSpark
      </button>
    </div>
  );
}
```

## 🎯 Navigation Structure

### FlyerPro Navigation
```
Dashboard
My Collections
├── Templates
├── Create Flyer ⭐
├── My Flyers
├── AI Generator 🤖
Media & Assets
├── Media Library
├── Upload Images
├── Upload Videos
├── Brand Assets
Analytics
├── Flyer Analytics
Account
├── Profile
├── Pricing
├── Settings
└── Help & Support
```

### SocialSpark Navigation
```
Dashboard
My Collections
├── Social Dashboard
├── Create Post ⭐
├── Scheduled Posts
├── Content Calendar
├── AI Copywriter 🤖
Content Creation
├── Content Library
├── Upload Media
├── Video Editor
├── Hashtag Research
Social Platforms
├── Connected Accounts
├── Instagram
├── Facebook
├── Twitter
├── LinkedIn
Analytics & Insights
├── Analytics
├── Engagement
└── Audience Insights
Account
├── Profile
├── Pricing
├── Settings
└── Help & Support
```

## 🎨 Styling & Customization

### CSS Variables for Theming
```css
:root {
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 70px;
  --primary-color: #3b82f6;
  --accent-color: #10b981;
}
```

### Custom Product Colors
```javascript
// In ProductContext.js, modify colors
const configs = {
  flyerpro: {
    color: '#your-brand-color',
    gradient: 'linear-gradient(135deg, #color1 0%, #color2 100%)'
  }
};
```

## 📋 Common Tasks

### Add New Navigation Item
```javascript
// In Sidebar.js, add to getNavigationItems()
{
  id: 'new-feature',
  label: 'New Feature',
  icon: NewIcon,
  path: '/new-feature',
  section: 'flyerpro',
  badge: 'NEW'
}
```

### Create Product-Specific Page
```javascript
function NewFeaturePage() {
  const { currentProduct } = useProduct();
  
  if (currentProduct !== 'flyerpro') {
    return <div>Feature only available in FlyerPro</div>;
  }
  
  return (
    <AppLayout currentPage="new-feature">
      <div className="page-container">
        <h1>New Feature</h1>
      </div>
    </AppLayout>
  );
}
```

### Handle Uploads
```javascript
function UploadPage() {
  const handleUploadComplete = (file) => {
    // Save to your database
    console.log('File uploaded:', file.publicUrl);
    
    // Update UI or show success message
    toast.success('File uploaded successfully!');
  };

  return (
    <MediaUpload
      type="image"
      onUploadComplete={handleUploadComplete}
      onUploadError={(error) => toast.error(error)}
    />
  );
}
```

## 🐛 Troubleshooting

### Sidebar Not Showing
- Ensure user is authenticated
- Check if `hideNavigation={false}`
- Verify ProductProvider wraps the app

### Navigation Not Working
- Check `onNavigate` prop is passed
- Verify routing logic is implemented
- Check console for navigation events

### Mobile Issues
- Test viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Check CSS media queries are loading
- Verify touch events work on real devices

### Performance Issues
- Check for unnecessary re-renders in React DevTools
- Verify useCallback dependencies are correct
- Consider memoizing expensive computations

## 📚 File Structure

```
src/
├── components/
│   ├── Sidebar.js ✅          # Main sidebar component
│   ├── Sidebar.css ✅         # Sidebar styles
│   ├── AppLayout.js ✅        # Layout wrapper
│   ├── AppLayout.css ✅       # Layout styles
│   ├── MediaUpload.js ✅      # File upload component
│   ├── MediaUpload.css ✅     # Upload styles
│   └── UserCollections.js ✅  # Collections browser
├── contexts/
│   └── ProductContext.js ✅   # Product state management
├── examples/
│   └── SidebarIntegration.js  # Integration examples
└── docs/
    ├── SIDEBAR_QUICK_START.md # This file
    └── WARNINGS_FIXED.md      # Warning fixes doc
```

## 🎯 Next Steps

1. **Test the implementation** with your existing components
2. **Customize the styling** to match your brand
3. **Add your own navigation items** as needed
4. **Implement the actual page components** for each sidebar item
5. **Add routing integration** (React Router, Next.js, etc.)
6. **Set up the media database tables** for uploads

## 💡 Pro Tips

- Use the `withLayout` HOC for consistent page layouts
- Keep the ProductContext for cross-component product awareness
- Leverage the existing UserCollections for browsing saved items
- Test keyboard navigation and accessibility features
- Use the mobile-first responsive design principles

---

**🎉 You now have a professional, production-ready sidebar navigation system!**

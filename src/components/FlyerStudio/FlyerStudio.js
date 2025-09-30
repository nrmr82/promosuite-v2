import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createStore } from 'polotno/model/store';
import { PolotnoContainer, WorkspaceWrap } from 'polotno';
import { Workspace } from 'polotno/canvas/workspace';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';

import './FlyerStudio.css';

// Minimalist Icons Component
const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const icons = {
    sparkles: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2zM6 18l.5 2L9 21l-2.5.5L6 24l-.5-2.5L3 21l2.5-.5L6 18zM18 6l.5 2L21 9l-2.5.5L18 12l-.5-2.5L15 9l2.5-.5L18 6z"/>
      </svg>
    ),
    save: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17,21 17,13 7,13 7,21"/>
        <polyline points="7,3 7,8 15,8"/>
      </svg>
    ),
    download: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    close: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    )
  };
  
  return icons[name] || null;
};

// Custom template data (keeping for future custom template implementation)
// eslint-disable-next-line no-unused-vars
const FLYER_TEMPLATES = [
  {
    id: 'business-flyer-1',
    name: 'Professional Business',
    preview: '/api/placeholder/200/300',
    category: 'business',
    data: {
      width: 800,
      height: 1000,
      pages: [{
        id: 'page1',
        children: [
          {
            type: 'text',
            text: 'YOUR BUSINESS NAME',
            fontSize: 48,
            fontWeight: 'bold',
            fill: '#2563eb',
            x: 50,
            y: 50,
            width: 700,
            height: 80,
            align: 'center'
          },
          {
            type: 'text', 
            text: 'Professional Services & Solutions',
            fontSize: 24,
            fill: '#64748b',
            x: 50,
            y: 150,
            width: 700,
            height: 40,
            align: 'center'
          },
          {
            type: 'rect',
            fill: '#f1f5f9',
            x: 50,
            y: 220,
            width: 700,
            height: 400,
            cornerRadius: 10
          },
          {
            type: 'text',
            text: 'Add your content here...',
            fontSize: 18,
            fill: '#334155',
            x: 80,
            y: 260,
            width: 640,
            height: 320
          }
        ]
      }]
    }
  },
  {
    id: 'event-flyer-1',
    name: 'Event Announcement',
    preview: '/api/placeholder/200/300',
    category: 'event',
    data: {
      width: 800,
      height: 1000,
      pages: [{
        id: 'page1',
        children: [
          {
            type: 'rect',
            fill: '#7c3aed',
            x: 0,
            y: 0,
            width: 800,
            height: 200
          },
          {
            type: 'text',
            text: 'SPECIAL EVENT',
            fontSize: 42,
            fontWeight: 'bold',
            fill: 'white',
            x: 50,
            y: 60,
            width: 700,
            height: 80,
            align: 'center'
          },
          {
            type: 'text',
            text: 'Join us for an amazing experience',
            fontSize: 20,
            fill: '#1e293b',
            x: 50,
            y: 250,
            width: 700,
            height: 40,
            align: 'center'
          },
          {
            type: 'text',
            text: 'Date: [Add Date]\nTime: [Add Time]\nLocation: [Add Location]',
            fontSize: 18,
            fill: '#475569',
            x: 50,
            y: 350,
            width: 700,
            height: 120
          }
        ]
      }]
    }
  },
  {
    id: 'sale-flyer-1',
    name: 'Sale & Promotion',
    preview: '/api/placeholder/200/300',
    category: 'sale',
    data: {
      width: 800,
      height: 1000,
      pages: [{
        id: 'page1',
        children: [
          {
            type: 'text',
            text: 'MEGA SALE',
            fontSize: 56,
            fontWeight: 'bold',
            fill: '#dc2626',
            x: 50,
            y: 50,
            width: 700,
            height: 100,
            align: 'center'
          },
          {
            type: 'text',
            text: 'UP TO 70% OFF',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#ea580c',
            x: 50,
            y: 170,
            width: 700,
            height: 60,
            align: 'center'
          },
          {
            type: 'rect',
            fill: '#fef2f2',
            stroke: '#dc2626',
            strokeWidth: 3,
            x: 50,
            y: 280,
            width: 700,
            height: 400,
            cornerRadius: 15
          },
          {
            type: 'text',
            text: 'Limited Time Offer!\n\n• All Products Included\n• Free Shipping\n• No Hidden Fees\n\nHurry - Sale Ends Soon!',
            fontSize: 20,
            fill: '#7f1d1d',
            x: 80,
            y: 320,
            width: 640,
            height: 320
          }
        ]
      }]
    }
  }
];

// Note: Using TemplatesPanel directly from polotno
// Custom templates can be configured via store or API

const FlyerStudio = forwardRef(({ 
  initialTemplate = null,
  onSave = () => {},
  onClose = () => {},
  onExport = () => {},
  user = null
}, ref) => {
  const [store] = useState(() => createStore({ 
    width: 800, 
    height: 1000,
    // Enable better performance for flyers
    unit: 'px',
    dpi: 72
  }));
  
  const [isLoading, setIsLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Load initial template if provided
  useEffect(() => {
    if (initialTemplate) {
      loadTemplate(initialTemplate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplate]);

  const loadTemplate = useCallback(async (templateData) => {
    setIsLoading(true);
    try {
      store.loadJSON(templateData);
      setCurrentTemplate(templateData);
      console.log('Template loaded successfully');
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setIsLoading(false);
    }
  }, [store]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const dataURL = await store.toDataURL({ 
        pixelRatio: 2, // High quality export
        mimeType: 'image/png'
      });
      
      const jsonData = store.toJSON();
      
      onSave({
        image: dataURL,
        data: jsonData,
        template: currentTemplate
      });
      
      console.log('Flyer saved successfully');
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [store, onSave, currentTemplate]);

  const handleExport = useCallback(async (format = 'png', quality = 1) => {
    setIsLoading(true);
    try {
      const dataURL = await store.toDataURL({
        pixelRatio: 2,
        mimeType: `image/${format}`,
        quality
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `flyer.${format}`;
      link.href = dataURL;
      link.click();
      
      onExport(dataURL);
      console.log('Export completed');
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [store, onExport]);

  const handleAutoLayout = useCallback(async () => {
    if (!user) {
      alert('Please sign in to use AI layout optimization');
      return;
    }

    setOptimizing(true);
    try {
      const currentJson = store.toJSON();
      
      // Call backend AI layout optimization
      const response = await fetch('/api/optimize-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` // Assuming user has token
        },
        body: JSON.stringify({
          layout: currentJson,
          type: 'flyer'
        })
      });

      if (!response.ok) {
        throw new Error('Layout optimization failed');
      }

      const optimizedLayout = await response.json();
      
      // Load the optimized layout
      store.loadJSON(optimizedLayout.data);
      
      console.log('AI layout optimization completed');
    } catch (error) {
      console.error('Auto layout error:', error);
      // Fallback to simple alignment optimization
      optimizeLayoutLocally();
    } finally {
      setOptimizing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, user]);

  const optimizeLayoutLocally = useCallback(() => {
    // Simple local optimization - align elements and improve spacing
    const page = store.pages[0];
    const elements = page.children.slice(); // Copy array
    
    elements.forEach((element, index) => {
      // Center align text elements
      if (element.type === 'text') {
        if (element.width > 600) {
          element.set({ align: 'center' });
        }
      }
      
      // Improve spacing between elements
      if (index > 0) {
        const prevElement = elements[index - 1];
        const minSpacing = 20;
        const currentY = element.y;
        const prevBottomY = prevElement.y + (prevElement.height || 50);
        
        if (currentY - prevBottomY < minSpacing) {
          element.set({ y: prevBottomY + minSpacing });
        }
      }
    });
    
    console.log('Local layout optimization completed');
  }, [store]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleSave,
    handleExport,
    store
  }), [handleSave, handleExport, store]);

  // Use default sections only for now
  // TODO: Add custom template and photos sections when polotno exports are fixed
  const sections = [];

  return (
    <div className="flyer-studio">
      {/* Header */}
      <div className="flyer-studio-header">
        <div className="header-left">
          <h2>Flyer Studio</h2>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleAutoLayout}
              disabled={optimizing || isLoading}
              title="AI Layout Optimization"
            >
              <Icon name="sparkles" size={16} color="currentColor" />
              {optimizing ? 'Optimizing...' : 'Auto Layout'}
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Icon name="save" size={16} color="currentColor" />
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => handleExport()}
            disabled={isLoading}
          >
            <Icon name="download" size={16} color="currentColor" />
            Export PNG
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            <Icon name="close" size={16} color="currentColor" />
            Close
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flyer-studio-content">
        <PolotnoContainer className="flyer-polotno-container">
          <WorkspaceWrap className="flyer-workspace">
            <Toolbar store={store} />
            <Workspace store={store} />
            <ZoomButtons store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>

      {/* Status overlay */}
      {(isLoading || optimizing) && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>{optimizing ? 'Optimizing layout...' : 'Loading...'}</p>
        </div>
      )}
    </div>
  );
});

export default FlyerStudio;

import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [currentProduct, setCurrentProduct] = useState('flyerpro'); // Default to FlyerPro
  const [productData, setProductData] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load product preference from localStorage
  useEffect(() => {
    const savedProduct = localStorage.getItem('promosuite_current_product');
    const savedCollapsed = localStorage.getItem('promosuite_sidebar_collapsed');
    
    if (savedProduct && ['flyerpro', 'socialspark'].includes(savedProduct)) {
      setCurrentProduct(savedProduct);
    }
    
    if (savedCollapsed === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  // Save product preference to localStorage
  useEffect(() => {
    localStorage.setItem('promosuite_current_product', currentProduct);
  }, [currentProduct]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('promosuite_sidebar_collapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const switchProduct = (product) => {
    if (['flyerpro', 'socialspark'].includes(product)) {
      setCurrentProduct(product);
      
      // Clear any product-specific data when switching
      setProductData({});
      
      console.log(`Switched to ${product}`);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const updateProductData = (key, value) => {
    setProductData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getProductConfig = (product = currentProduct) => {
    const configs = {
      flyerpro: {
        name: 'FlyerPro',
        displayName: 'FlyerPro',
        description: 'Create stunning real estate flyers',
        color: '#0ea5e9',
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        features: [
          'Professional Templates',
          'Drag & Drop Editor',
          'AI Generation',
          'High-Resolution Export',
          'Brand Customization'
        ],
        routes: {
          dashboard: '/flyerpro',
          templates: '/flyerpro/templates',
          create: '/flyerpro/create',
          flyers: '/flyerpro/flyers',
          media: '/flyerpro/media',
          analytics: '/flyerpro/analytics'
        }
      },
      socialspark: {
        name: 'SocialSpark',
        displayName: 'SocialSpark',
        description: 'Automate your social media marketing',
        color: '#d946ef',
        gradient: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)',
        features: [
          'Multi-Platform Scheduling',
          'Content Calendar',
          'AI Copywriter',
          'Analytics & Insights',
          'Hashtag Research'
        ],
        routes: {
          dashboard: '/socialspark',
          create: '/socialspark/create',
          calendar: '/socialspark/calendar',
          posts: '/socialspark/posts',
          analytics: '/socialspark/analytics',
          platforms: '/socialspark/platforms'
        }
      }
    };

    return configs[product] || configs.flyerpro;
  };

  const isCurrentProduct = (product) => {
    return currentProduct === product;
  };

  const getOtherProduct = () => {
    return currentProduct === 'flyerpro' ? 'socialspark' : 'flyerpro';
  };

  const value = {
    // Current state
    currentProduct,
    productData,
    sidebarCollapsed,
    
    // Actions
    switchProduct,
    toggleSidebar,
    updateProductData,
    
    // Helper functions
    getProductConfig,
    isCurrentProduct,
    getOtherProduct,
    
    // Computed values
    currentConfig: getProductConfig(),
    otherConfig: getProductConfig(getOtherProduct())
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;

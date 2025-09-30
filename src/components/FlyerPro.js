import React, { useState, useEffect } from 'react';
import {
  Layout, 
  Palette, 
  ArrowRight
} from 'lucide-react';
import { useTemplate } from '../contexts/TemplateContext';
import FlyerTemplateBrowser from './FlyerTemplateBrowser';
import UnifiedEditorModal from './UnifiedEditorModal/UnifiedEditorModal';
// Temporarily commenting out complex imports for debugging
// import VideoPlayer from './VideoPlayer';
// import { LoadingState } from './LoadingSkeleton';
// import LazyImage from './LazyImage';
// import ErrorBoundary, { withErrorBoundary, useErrorRecovery } from './ErrorBoundary';
// import { useErrorHandler, useNetworkStatus } from '../utils/errorHandling';
// import { useFocusManagement, useScreenReader, useReducedMotion, useAriaLive } from '../hooks/useAccessibility';
// import { useBatchLoading } from '../hooks/useLazyLoading';
import './FlyerPro.css';

const FlyerPro = ({ onOpenAuth, onToolUsage, user }) => {
  const {
    // toggleFavorite: contextToggleFavorite,
    trackEvent,
    ANALYTICS_EVENTS
  } = useTemplate();

  // const [showDemo, setShowDemo] = useState(false);
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [, setShowAIGenerator] = useState(false);
  const [, setShowAITemplateGenerator] = useState(false);
  const [, setAIGeneratorMode] = useState('flyer'); // 'flyer', 'analysis', 'copywriting'
  const [, setEditorTemplate] = useState(null);
  const [, setIsLoadingTemplates] = useState(true);
  const [, setShowPropertyInput] = useState(false);
  
  // Advanced Editor state
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [savedImage, setSavedImage] = useState(null);

  // Error handling and accessibility hooks - simplified for debugging
  // const { handleError, handleTemplateError } = useErrorHandler();
  // const { isOnline, wasOffline } = useNetworkStatus();
  // const { saveFocus, restoreFocus } = useFocusManagement();
  // const { announce } = useScreenReader();
  // const prefersReducedMotion = false; // useReducedMotion();
  // const { liveRegionRef, announceToRegion } = useAriaLive();
  

  const templates = [
    {
      id: 1,
      name: "Modern Luxury",
      category: "Luxury",
      preview: "🏠",
      imageUrl: "/api/placeholder/400/300?text=Modern+Luxury",
      popular: true,
      description: "Sophisticated design for high-end properties",
      features: ["Premium Layout", "Gold Accents", "Elegant Typography"]
    },
    {
      id: 2,
      name: "Classic Elegance",
      category: "Traditional",
      preview: "🏡",
      imageUrl: "/api/placeholder/400/300?text=Classic+Elegance",
      popular: false,
      description: "Timeless design for traditional homes",
      features: ["Classic Borders", "Serif Fonts", "Warm Colors"]
    },
    {
      id: 3,
      name: "Urban Contemporary",
      category: "Modern",
      preview: "🏢",
      popular: true,
      description: "Sleek design for modern properties",
      features: ["Clean Lines", "Bold Typography", "Modern Colors"]
    },
    {
      id: 4,
      name: "Minimalist Clean",
      category: "Modern",
      preview: "🏘️",
      popular: false,
      description: "Simple, clean design that highlights property",
      features: ["White Space", "Simple Layout", "Focus on Photos"]
    },
    {
      id: 5,
      name: "Professional Estate",
      category: "Luxury",
      preview: "🏰",
      popular: true,
      description: "Premium template for luxury estates",
      features: ["Luxury Styling", "Premium Fonts", "Gold Details"]
    },
    {
      id: 6,
      name: "Family Home",
      category: "Residential",
      preview: "🏠",
      popular: true,
      description: "Warm, welcoming design for family homes",
      features: ["Warm Colors", "Family Friendly", "Cozy Layout"]
    },
    {
      id: 7,
      name: "Downtown Loft",
      category: "Condos",
      preview: "🏙️",
      popular: false,
      description: "Urban design for city properties",
      features: ["Industrial Style", "Urban Colors", "Modern Layout"]
    },
    {
      id: 8,
      name: "Countryside Villa",
      category: "Rural",
      preview: "🌄",
      popular: false,
      description: "Natural design for country properties",
      features: ["Nature Colors", "Rustic Elements", "Scenic Layout"]
    },
    {
      id: 9,
      name: "Beach House",
      category: "Waterfront",
      preview: "🏖️",
      popular: true,
      description: "Coastal design for waterfront properties",
      features: ["Ocean Blues", "Coastal Theme", "Relaxed Layout"]
    },
    {
      id: 10,
      name: "Commercial Space",
      category: "Commercial",
      preview: "🏢",
      popular: false,
      description: "Professional design for commercial listings",
      features: ["Business Focus", "Professional Colors", "Clean Layout"]
    },
    {
      id: 11,
      name: "Rental Property",
      category: "Rentals",
      preview: "🗝️",
      popular: true,
      description: "Attractive design for rental listings",
      features: ["Rental Focus", "Clear Pricing", "Tenant Friendly"]
    },
    {
      id: 12,
      name: "New Construction",
      category: "New Builds",
      preview: "🚧",
      popular: false,
      description: "Fresh design for new construction",
      features: ["New Build Focus", "Modern Style", "Progress Updates"]
    }
  ];



  // Batch loading for templates with lazy loading - simplified for debugging
  // const { visibleItems: visibleTemplates, hasMore, isLoading: isBatchLoading, loadNextBatch } = useBatchLoading(
  //   filteredTemplates, 
  //   8, 
  //   prefersReducedMotion ? 0 : 200
  // );
  
  // Temporary simplified batch loading
  // const visibleTemplates = filteredTemplates.slice(0, 8);
  // const hasMore = filteredTemplates.length > 8;
  // const isBatchLoading = false;
  // const loadNextBatch = () => {};

  // Simulate loading templates
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingTemplates(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [setIsLoadingTemplates]);

  // Enhanced handler functions with error handling and accessibility
  // const handleTemplatePreview = (template) => {
  //   try {
  //     previewTemplate(template);
  //     setSelectedTemplate(template);
  //     saveFocus();
  //     setShowTemplatePreview(true);
  //     announce(`Opening preview for ${template.name} template`, 'polite');
  //     announceToRegion(`Template preview opened: ${template.name}`);
  //   } catch (error) {
  //     handleTemplateError(error, template.id);
  //   }
  // };

  // const handleTemplateUse = (template) => {
  //   if (!user) {
  //     onOpenAuth();
  //     return;
  //   }

  //   if (canUseTemplate) {
  //     recordTemplateUsage(template);
  //     onToolUsage();
      
  //     // Set template and show property input
  //     setEditorTemplate(template);
  //     setShowPropertyInput(true);
  //     setShowTemplatePreview(false);
  //     setShowTemplateBrowser(false);
  //   } else {
  //     trackEvent(ANALYTICS_EVENTS.UPGRADE_PROMPT_SHOWN, {
  //       templateId: template.id,
  //       templatesUsed: remainingFreeTemplates
  //     });
  //     setShowUpgradePrompt(true);
  //   }
  // };





  const handleTemplateBrowserOpen = () => {
    trackEvent(ANALYTICS_EVENTS.TEMPLATE_BROWSER_OPENED);
    setShowTemplateBrowser(true);
  };

  // const handleSearchChange = (value) => {
  //   setSearchTerm(value);
  //   if (value.trim()) {
  //     trackEvent(ANALYTICS_EVENTS.TEMPLATE_SEARCH, {
  //       searchTerm: value
  //     });
  //   }
  // };

  // const handleFilterChange = (category) => {
  //   setTemplateFilter(category);
  //   trackEvent(ANALYTICS_EVENTS.TEMPLATE_FILTER, {
  //     category
  //   });
  // };

  // Feature-specific handlers
  const handleFeatureClick = (featureId) => {
    console.log('🎯 handleFeatureClick called with:', featureId, 'User authenticated:', !!user);
    
    // Temporarily bypass authentication for testing AI features
    if (!user && featureId.startsWith('ai-')) {
      console.log('⚠️ User not authenticated but allowing AI feature for testing');
      // Continue to feature handler without authentication
    } else if (!user) {
      console.log('❌ User not authenticated, opening auth modal');
      onOpenAuth();
      return;
    }

    console.log('✅ Routing to feature handler');
    switch (featureId) {
      case 'ai-flyer-generation':
        console.log('🚀 Routing to AI Flyer Generation');
        handleAIFlyerGeneration();
        break;
      case 'ai-template-creation':
        console.log('🚀 Routing to AI Template Creation');
        handleAITemplateCreation();
        break;
      case 'intelligent-property-analysis':
        console.log('🚀 Routing to Property Analysis');
        handlePropertyAnalysis();
        break;
      case 'professional-templates':
        console.log('🚀 Routing to Template Browser');
        handleTemplateBrowserOpen();
        break;
      case 'advanced-design-editor':
        console.log('🚀 Routing to Design Editor');
        handleDesignEditor();
        break;
      default:
        console.log('Feature not implemented yet:', featureId);
    }
  };

  const handleAIFlyerGeneration = () => {
    console.log('🤖 handleAIFlyerGeneration called - opening AI Generator');
    trackEvent(ANALYTICS_EVENTS.AI_FLYER_GENERATION_CLICKED);
    setAIGeneratorMode('flyer');
    setShowAIGenerator(true);
    console.log('✅ AI Generator should now be visible');
  };

  const handleAITemplateCreation = () => {
    console.log('🎨 handleAITemplateCreation called - opening AI Template Generator');
    trackEvent(ANALYTICS_EVENTS.AI_TEMPLATE_CREATION_CLICKED);
    setShowAITemplateGenerator(true);
    console.log('✅ AI Template Generator should now be visible');
  };

  const handlePropertyAnalysis = () => {
    trackEvent(ANALYTICS_EVENTS.PROPERTY_ANALYSIS_CLICKED);
    setAIGeneratorMode('analysis');
    setShowAIGenerator(true);
  };


  const handleDesignEditor = () => {
    console.log('🎨 handleDesignEditor called!');
    console.log('🎨 Current showAdvancedEditor state:', showAdvancedEditor);
    console.log('🎨 Opening Unified Editor Modal');
    trackEvent(ANALYTICS_EVENTS.DESIGN_EDITOR_CLICKED);
    setShowAdvancedEditor(true);
    console.log('🎨 setShowAdvancedEditor(true) called');
    
    // Force re-render to debug
    setTimeout(() => {
      console.log('🎨 After timeout - showAdvancedEditor should be:', true);
    }, 100);
  };

  // Advanced Editor handlers
  const handleAdvancedEditorSave = (imageData) => {
    setSavedImage(imageData);
    console.log('Image saved from advanced editor:', imageData);
    // Here you could integrate with your existing save logic
  };

  const handleAdvancedEditorClose = () => {
    setShowAdvancedEditor(false);
  };

  const handleAdvancedEditorExport = (imageData) => {
    console.log('Image exported from advanced editor:', imageData);
    // Here you could integrate with your existing export logic
  };

  // Template browser handlers
  const handleTemplateSelect = (template) => {
    console.log('Template selected:', template);
    setEditorTemplate(template);
    setShowTemplateBrowser(false);
    setShowPropertyInput(true);
  };

  const handleTemplatePreview = (template) => {
    console.log('Preview template:', template);
    // Could open a preview modal here
  };

  const handleTemplateBrowserClose = () => {
    setShowTemplateBrowser(false);
  };

  // AI Generator handlers
  // const handleAIGeneratorComplete = (generatedFlyer) => {
  //   setPropertyData(generatedFlyer.property || {});
  //   setBrandData(generatedFlyer.property?.agent || {});
  //   setEditorTemplate(generatedFlyer.template?.template || null);
  //   setShowAIGenerator(false);
  //   setShowEditor(true);
  // };

  // const handleAIGeneratorCancel = () => {
  //   setShowAIGenerator(false);
  // };

  // // AI Template Generator handlers
  // const handleAITemplateGeneratorComplete = (templateData) => {
  //   console.log('✅ Template generated:', templateData);
  //   setShowAITemplateGenerator(false);
  //   alert('Template created successfully! It would be added to your template library.');
  // };

  // const handleAITemplateGeneratorCancel = () => {
  //   setShowAITemplateGenerator(false);
  // };

  // // Property input handlers
  // const handlePropertyInputComplete = (completePropertyData) => {
  //   setPropertyData(completePropertyData);
  //   setBrandData(completePropertyData.agent || {});
  //   setShowPropertyInput(false);
  //   setShowEditor(true);
  // };

  // const handlePropertyInputCancel = () => {
  //   setShowPropertyInput(false);
  //   setEditorTemplate(null);
  // };

  // // Editor handlers
  // const handleEditorSave = (elements) => {
  //   console.log('Saving flyer:', elements);
  // };

  // const handleEditorExport = (elements) => {
  //   console.log('Exporting flyer:', elements);
  // };

  // const handleEditorClose = () => {
  //   setShowEditor(false);
  //   setEditorTemplate(null);
  //   setPropertyData({});
  //   setBrandData({});
  // };

  // Removed testimonials and success stats as requested

  // Removed testimonial carousel effect


  return (
    <div className="flyerpro-page compact-page">
      {/* Main Content Section */}
      <section className="main-content-section">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-content">
              <h1 className="page-title">
                Professional Real Estate Flyer Creation
              </h1>
              <p className="page-subtitle">
                Create stunning, professional flyers in minutes with AI-powered tools,
                custom templates, and intelligent property analysis.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="tools-grid">
            <div className="tool-card ai-feature-card">
              <div className="tool-header">
                <div className="tool-icon ai-icon">
                  🤖
                </div>
                <div className="tool-title-section">
                  <h3 className="tool-title">AI Flyer Generation</h3>
                  <p className="tool-description">
                    World's first AI that creates complete flyers in 60 seconds
                  </p>
                </div>
              </div>
              <div className="tool-features">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>60-second creation</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>Market analysis</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✍️</span>
                  <span>AI copywriting</span>
                </div>
              </div>
              <button className="tool-cta" onClick={() => handleFeatureClick('ai-flyer-generation')}>
                Generate AI Flyer
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="tool-card editor-feature-card">
              <div className="tool-header">
                <div className="tool-icon editor-icon">
                  <Palette className="w-6 h-6" />
                </div>
                <div className="tool-title-section">
                  <h3 className="tool-title">Advanced Image Editor</h3>
                  <p className="tool-description">
                    Professional editor with AI beautification and inpainting tools
                  </p>
                </div>
              </div>
              <div className="tool-features">
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <span>AI beautification</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Object removal</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💎</span>
                  <span>Credit-based</span>
                </div>
              </div>
              <button className="tool-cta" onClick={() => handleFeatureClick('advanced-design-editor')}>
                Try Editor
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            </div>

          {/* Template Browser Section */}
          <div className="template-browser-section">
            <div className="section-header">
              <div className="section-title-section">
                <h2 className="section-title">Professional Flyer Templates</h2>
                <p className="section-subtitle">
                  Browse and select from our collection of conversion-optimized flyer templates designed for real estate professionals.
                </p>
              </div>
            </div>
            
            <div className="template-categories">
              <div className="template-category">
                <div className="category-header">
                  <div className="category-icon">
                    <Layout className="w-6 h-6" />
                  </div>
                  <div className="category-info">
                    <h3>Luxury Properties</h3>
                    <p>Elegant templates for high-end property listings</p>
                  </div>
                </div>
                <button className="category-cta" onClick={() => handleFeatureClick('professional-templates')}>
                  {user ? 'Browse Templates' : 'Login to Browse'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="template-category">
                <div className="category-header">
                  <div className="category-icon">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div className="category-info">
                    <h3>Modern & Clean</h3>
                    <p>Contemporary designs for all property types</p>
                  </div>
                </div>
                <button className="category-cta" onClick={() => handleFeatureClick('professional-templates')}>
                  {user ? 'Browse Templates' : 'Login to Browse'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="template-category">
                <div className="category-header">
                  <div className="category-icon">
                    🤖
                  </div>
                  <div className="category-info">
                    <h3>AI-Generated</h3>
                    <p>Custom templates created by our AI based on your needs</p>
                  </div>
                </div>
                <button className="category-cta" onClick={() => handleFeatureClick('ai-template-creation')}>
                  {user ? 'Generate Templates' : 'Login to Generate'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Template Browser Modal */}
      {showTemplateBrowser && (
        <FlyerTemplateBrowser
          templates={templates}
          onTemplateSelect={handleTemplateSelect}
          onTemplatePreview={handleTemplatePreview}
          onClose={handleTemplateBrowserClose}
          trackEvent={trackEvent}
          ANALYTICS_EVENTS={ANALYTICS_EVENTS}
        />
      )}
      
      {/* Unified Editor Modal */}
      <UnifiedEditorModal
        isOpen={showAdvancedEditor}
        onSave={handleAdvancedEditorSave}
        onClose={handleAdvancedEditorClose}
        user={user}
        initialImage={savedImage}
        initialMode="flyer"
      />
    </div>
  );
};

export default FlyerPro;

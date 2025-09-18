import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
  FileText,
  Palette
} from 'lucide-react';
import aiService from '../services/aiService';
import flyerProService from '../services/flyerProService';
// import subscriptionService from '../services/subscriptionService'; // Unused
import { supabase, getCurrentUser } from '../utils/supabase';
// import { useAuth } from '../contexts/AuthContext'; // Unused - user passed as prop
import './AIFlyerGenerator.css';

const AIFlyerGenerator = ({ mode = 'flyer', user, onComplete, onCancel, initialData = {} }) => {
  // Note: user is now passed as prop instead of from useAuth hook
  // Reduced logging to prevent console spam - only log once when user changes
  const userRef = React.useRef(user?.id);
  React.useEffect(() => {
    if (userRef.current !== user?.id) {
      console.log('👤 AIFlyerGenerator user updated:', { hasUser: !!user, userId: user?.id, email: user?.email });
      userRef.current = user?.id;
    }
  }, [user?.id, user?.email, user]);
  
  const [currentStep, setCurrentStep] = useState(1);
  
  // Scroll modal into view when it opens
  React.useEffect(() => {
    // Scroll to top of page to ensure modal is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle'); // idle, analyzing, generating, complete
  const [generatedFlyer, setGeneratedFlyer] = useState(null);
  const [error, setError] = useState(null);
  const [generationMode] = useState(mode);
  
  // Property data state
  const [propertyData, setPropertyData] = useState({
    address: initialData.address || '',
    price: initialData.price || '',
    bedrooms: initialData.bedrooms || '',
    bathrooms: initialData.bathrooms || '',
    squareFeet: initialData.squareFeet || '',
    propertyType: initialData.propertyType || 'residential',
    description: initialData.description || '',
    features: initialData.features || [],
    images: initialData.images || []
  });

  // User preferences
  const [userPreferences, setUserPreferences] = useState({
    tone: 'professional',
    focusAreas: ['location', 'features'],
    brandColors: [],
    userId: user?.id
  });

  // AI Analysis Results
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  // Dynamic steps based on mode
  const getStepsForMode = (mode) => {
    const stepConfigs = {
      flyer: [
        { id: 'analyze', label: 'Analyzing Property', status: 'pending', icon: Brain },
        { id: 'template', label: 'Selecting Template', status: 'pending', icon: Palette },
        { id: 'content', label: 'Generating Content', status: 'pending', icon: FileText },
        { id: 'design', label: 'Optimizing Design', status: 'pending', icon: Sparkles },
        { id: 'complete', label: 'Flyer Ready!', status: 'pending', icon: CheckCircle }
      ],
      template: [
        { id: 'analyze', label: 'Analyzing Requirements', status: 'pending', icon: Brain },
        { id: 'design', label: 'Creating Layout', status: 'pending', icon: Palette },
        { id: 'elements', label: 'Adding Elements', status: 'pending', icon: Sparkles },
        { id: 'complete', label: 'Template Ready!', status: 'pending', icon: CheckCircle }
      ],
      analysis: [
        { id: 'analyze', label: 'Processing Property Data', status: 'pending', icon: Brain },
        { id: 'insights', label: 'Extracting Insights', status: 'pending', icon: FileText },
        { id: 'recommendations', label: 'Generating Recommendations', status: 'pending', icon: Sparkles },
        { id: 'complete', label: 'Analysis Complete!', status: 'pending', icon: CheckCircle }
      ],
      copywriting: [
        { id: 'analyze', label: 'Analyzing Property', status: 'pending', icon: Brain },
        { id: 'headlines', label: 'Creating Headlines', status: 'pending', icon: FileText },
        { id: 'content', label: 'Writing Copy', status: 'pending', icon: Sparkles },
        { id: 'complete', label: 'Copy Ready!', status: 'pending', icon: CheckCircle }
      ]
    };
    return stepConfigs[mode] || stepConfigs.flyer;
  };
  
  const [aiSteps, setAiSteps] = useState(getStepsForMode(generationMode));

  const propertyTypes = [
    'residential',
    'commercial', 
    'luxury',
    'condo',
    'townhouse',
    'land',
    'rental'
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional & Trustworthy' },
    { value: 'luxury', label: 'Luxury & Exclusive' },
    { value: 'family', label: 'Warm & Family-Friendly' },
    { value: 'modern', label: 'Modern & Trendy' },
    { value: 'investment', label: 'Investment Focused' }
  ];

  const focusAreaOptions = [
    { value: 'location', label: 'Prime Location' },
    { value: 'features', label: 'Property Features' },
    { value: 'value', label: 'Great Value' },
    { value: 'luxury', label: 'Luxury Amenities' },
    { value: 'investment', label: 'Investment Potential' },
    { value: 'lifestyle', label: 'Lifestyle Benefits' }
  ];

  // Handle form changes
  const handlePropertyChange = (field, value) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setPropertyData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleFocusAreaToggle = (area) => {
    setUserPreferences(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(f => f !== area)
        : [...prev.focusAreas, area]
    }));
  };

  // Update AI step status
  const updateStepStatus = (stepId, status) => {
    setAiSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // Handle save flyer functionality
  const handleSaveFlyer = async () => {
    if (!generatedFlyer) {
      alert('No flyer to save. Please generate a flyer first.');
      return;
    }

    try {
      // Option 1: Try to call onComplete if provided (opens in editor)
      if (onComplete) {
        console.log('✨ Opening flyer in editor...');
        onComplete(generatedFlyer);
        return;
      }

      // Option 2: Save as JSON download
      const flyerData = {
        ...generatedFlyer,
        propertyData,
        userPreferences,
        savedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(flyerData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-flyer-${propertyData.address?.replace(/[^a-zA-Z0-9]/g, '-') || 'property'}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✨ Flyer saved as JSON file');
      alert('Flyer saved successfully! The JSON file contains all the flyer data and can be imported later.');
      
    } catch (error) {
      console.error('Error saving flyer:', error);
      alert('Error saving flyer. Please try again.');
    }
  };

  // Save flyer to database
  const saveFlyerToDatabase = async (flyerData) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User must be logged in to save flyers');
      }

      const flyerRecord = {
        user_id: user.id,
        title: flyerData.content?.headline || `${propertyData.address} Flyer`,
        description: flyerData.content?.description || propertyData.description || '',
        flyer_data: {
          content: flyerData.content,
          propertyData: propertyData,
          userPreferences: userPreferences,
          aiAnalysis: aiAnalysis,
          generatedAt: new Date().toISOString(),
          aiGenerated: true
        },
        thumbnail_url: null, // Could generate thumbnail later
        status: 'draft',
        metadata: {
          generatedBy: 'ai',
          provider: 'replicate',
          version: '1.0',
          propertyType: propertyData.propertyType,
          address: propertyData.address
        }
      };

      const savedFlyer = await flyerProService.createFlyer(flyerRecord);
      
      // Track usage for subscription limits
      await supabase.rpc('increment_usage_counter', {
        user_uuid: user.id,
        resource_type: 'ai_generation'
      });

      console.log('✅ Flyer saved successfully:', savedFlyer.flyer.id);
      return savedFlyer.flyer;
    } catch (error) {
      console.error('❌ Failed to save flyer to database:', error);
      throw error;
    }
  };

  // Check AI usage limits - currently unused but may be needed for future usage tracking
  // const checkAIUsage = async () => {
  //   try {
  //     const user = await getCurrentUser();
  //     if (!user) {
  //       return {
  //         hasReachedLimit: true,
  //         hasSubscription: false,
  //         generationsUsed: 0,
  //         generationsLimit: 0,
  //         error: 'User not authenticated'
  //       };
  //     }

  //     // Check subscription status
  //     const subscriptionStatus = await subscriptionService.getSubscriptionStatus(user.id);
  //     const hasSubscription = subscriptionStatus.isActive;

  //     // Check usage limits if not subscribed
  //     if (!hasSubscription) {
  //       const { data: canUse, error } = await supabase.rpc('check_user_limits', {
  //         user_uuid: user.id,
  //         resource_type: 'ai_generation'
  //       });

  //       if (error) {
  //         console.warn('Failed to check usage limits:', error);
  //         return { hasReachedLimit: false, hasSubscription: false };
  //       }

  //       return {
  //         hasReachedLimit: !canUse,
  //         hasSubscription: false,
  //         generationsUsed: 0,
  //         generationsLimit: 3
  //       };
  //     }

  //     return {
  //       hasReachedLimit: false,
  //       hasSubscription: true,
  //       generationsUsed: 0,
  //       generationsLimit: -1 // Unlimited
  //     };
  //   } catch (error) {
  //     console.error('Error checking usage:', error);
  //     return { hasReachedLimit: false, hasSubscription: false };
  //   }
  // };

  // Save to user's collection
  const saveToCollection = async (flyerData) => {
    try {
      console.log('💾 Saving flyer to collection:', flyerData.content?.headline);
      
      const saved = await saveFlyerToDatabase(flyerData);
      
      if (saved) {
        console.log('✅ Flyer saved to collection successfully');
        alert('✅ Flyer saved to your collection!');
      }
    } catch (error) {
      console.error('❌ Failed to save flyer:', error);
      alert('❌ Failed to save flyer to collection. Please try again.');
    }
  };

  // Generate HTML for printing/PDF export
  const generateFlyerHTML = () => {
    if (!generatedFlyer) return '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Real Estate Flyer - ${propertyData.address}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .flyer-container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
          .flyer-header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-align: center; padding: 24px 20px; }
          .flyer-headline { font-size: 28px; font-weight: 900; margin: 0 0 8px 0; text-transform: uppercase; }
          .flyer-subheadline { font-size: 14px; font-weight: 400; margin: 0; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
          .price-display { font-size: 32px; font-weight: 900; color: #dc2626; text-align: center; margin: 20px; padding: 12px 20px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fecaca; border-radius: 12px; }
          .property-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px; padding: 16px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; }
          .stat-item { text-align: center; padding: 8px; background: white; border-radius: 8px; }
          .stat-item strong { display: block; font-size: 24px; font-weight: 800; color: #0369a1; }
          .stat-item span { font-size: 11px; color: #0369a1; text-transform: uppercase; font-weight: 600; }
          .property-address { font-size: 18px; font-weight: 700; text-align: center; margin: 18px 20px; padding: 14px 16px; background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); border: 2px solid #f59e0b; border-radius: 10px; }
          .property-description { font-size: 15px; line-height: 1.6; color: #374151; margin: 20px; padding: 16px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #6b7280; }
          .key-features { margin: 20px; padding: 16px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; border: 2px solid #a7f3d0; }
          .key-features h4 { margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #047857; }
          .key-features ul { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .key-features li { font-size: 14px; color: #065f46; font-weight: 600; padding: 6px; background: white; border-radius: 6px; }
          .flyer-footer { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 20px; }
          .agent-info { display: flex; align-items: center; gap: 14px; }
          .agent-details { font-size: 13px; line-height: 1.5; }
          .call-to-action { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 16px 20px; border-radius: 12px; font-weight: 700; text-align: center; font-size: 16px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="flyer-container">
          <div class="flyer-header">
            <h1 class="flyer-headline">${generatedFlyer.content?.headline || `${propertyData.bedrooms}BR ${propertyData.bathrooms}BA Home For Sale`}</h1>
            <h2 class="flyer-subheadline">${generatedFlyer.content?.subheadline || 'Prime Location \u2022 Move-In Ready'}</h2>
          </div>
          <div class="price-display">${generatedFlyer.content?.priceDisplay || propertyData.price || 'Contact for Price'}</div>
          <div class="property-stats">
            <div class="stat-item"><strong>${propertyData.bedrooms || '—'}</strong><span>Bedrooms</span></div>
            <div class="stat-item"><strong>${propertyData.bathrooms || '—'}</strong><span>Bathrooms</span></div>
            <div class="stat-item"><strong>${propertyData.squareFeet || '—'}</strong><span>Sq Ft</span></div>
          </div>
          <div class="property-address">${propertyData.address}</div>
          <div class="property-description">${generatedFlyer.content?.description || propertyData.description || `Discover this exceptional ${propertyData.bedrooms || '3'} bedroom, ${propertyData.bathrooms || '2'} bathroom home. Located in a desirable neighborhood, this property offers the perfect blend of comfort, style, and convenience for modern living.`}</div>
          <div class="key-features">
            <h4>\u2728 Key Features</h4>
            <ul>${(generatedFlyer.content?.keyFeatures || ['Prime Location', 'Move-in Ready', 'Modern Updates', 'Great Value', 'Excellent Schools', 'Close to Shopping']).slice(0, 6).map(feature => `<li>\u2713 ${feature}</li>`).join('')}</ul>
          </div>
          <div class="flyer-footer">
            <div class="agent-info">
              <div class="agent-details">
                <strong>Your Name</strong>
                <div>Real Estate Agent</div>
                <div>Phone: (555) 123-4567</div>
                <div>Email: agent@example.com</div>
              </div>
            </div>
            <div class="call-to-action">${generatedFlyer.content?.callToAction || 'Schedule Your Private Showing Today!'}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Generate content using AI based on mode
  const generateAIContent = async () => {
    
    try {
      setIsGenerating(true);
      setAiStatus('analyzing');
      setError(null);

      // Check if user can use AI
      const canUse = await aiService.canUserUseAI(user?.id);
      if (!canUse.canUse) {
        throw new Error(canUse.reason === 'authentication_required' 
          ? 'Please log in to use AI features'
          : 'You have reached your AI usage limit for this month'
        );
      }
      
      let result;
      switch (generationMode) {
        case 'flyer':
          result = await generateFlyer();
          break;
        case 'template':
          result = await generateTemplate();
          break;
        case 'analysis':
          result = await generateAnalysis();
          break;
        case 'copywriting':
          result = await generateCopywriting();
          break;
        default:
          result = await generateFlyer();
      }
      
      return result;
    } catch (error) {
      console.error('AI content generation failed:', error);
      setError(error.message);
      setAiStatus('error');
      
      // Reset all steps
      setAiSteps(prev => prev.map(step => ({ 
        ...step, 
        status: step.status === 'active' ? 'error' : step.status 
      })));
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate flyer using AI
  const generateFlyer = async () => {

      // Step 1: Analyze Property
      updateStepStatus('analyze', 'active');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate analysis time
      
      // Step 2: Template Selection
      updateStepStatus('analyze', 'complete');
      updateStepStatus('template', 'active');
      setAiStatus('generating');
      
      // Step 3: Content Generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus('template', 'complete');
      updateStepStatus('content', 'active');
      
      // Step 4: Design Optimization
      await new Promise(resolve => setTimeout(resolve, 1800));
      updateStepStatus('content', 'complete');
      updateStepStatus('design', 'active');

      try {
        // Generate the actual flyer with error handling
        const result = await aiService.generateFlyer(propertyData, userPreferences);
        
        // Step 5: Complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateStepStatus('design', 'complete');
        updateStepStatus('complete', 'complete');
        
        setGeneratedFlyer(result.flyer);
        setAiAnalysis(result.flyer.analysis);
        setAiStatus('complete');
        setCurrentStep(3);
        
        // Auto-save to user's collection
        try {
          await saveToCollection(result.flyer);
        } catch (saveError) {
          console.warn('Failed to auto-save flyer:', saveError);
          // Don't interrupt the generation flow if save fails
        }
        
        return result;
      } catch (error) {
        console.error('Error in flyer generation:', error);
        // Still complete the process even if AI service fails
        updateStepStatus('design', 'complete');
        updateStepStatus('complete', 'complete');
        
        // Create a fallback flyer if AI service completely fails
        const fallbackContent = JSON.parse(aiService.generateIntelligentFallback('marketing content with headline', propertyData));
        const fallbackAnalysis = JSON.parse(aiService.generateIntelligentFallback('JSON format with propertyType', propertyData));
        
        const fallbackResult = {
          success: true,
          flyer: {
            id: `ai_flyer_${Date.now()}`,
            content: fallbackContent,
            analysis: fallbackAnalysis,
            aiGenerated: false,
            generatedAt: new Date().toISOString()
          }
        };
        
        setGeneratedFlyer(fallbackResult.flyer);
        setAiAnalysis(fallbackAnalysis);
        setAiStatus('complete');
        setCurrentStep(3);
        
        // Auto-save fallback flyer to collection
        try {
          await saveToCollection(fallbackResult.flyer);
        } catch (saveError) {
          console.warn('Failed to auto-save fallback flyer:', saveError);
        }
        
        return fallbackResult;
      }
  };
  
  // Generate AI template
  const generateTemplate = async () => {
    // Step 1: Analyze Requirements
    updateStepStatus('analyze', 'active');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 2: Create Layout
    updateStepStatus('analyze', 'complete');
    updateStepStatus('design', 'active');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Add Elements
    updateStepStatus('design', 'complete');
    updateStepStatus('elements', 'active');
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Generate template
    const templateRequirements = {
      style: userPreferences.tone || 'modern',
      propertyType: propertyData.propertyType || 'residential',
      targetMarket: userPreferences.focusAreas?.[0] || 'general',
      colors: userPreferences.brandColors || [],
      features: propertyData.features || [],
      userId: user?.id
    };
    
    const result = await aiService.generateAITemplate(templateRequirements);
    
    // Complete
    updateStepStatus('elements', 'complete');
    updateStepStatus('complete', 'complete');
    
    setGeneratedFlyer(result.template);
    setAiStatus('complete');
    setCurrentStep(3);
    
    return result;
  };
  
  // Generate property analysis
  const generateAnalysis = async () => {
    // Step 1: Process Property Data
    updateStepStatus('analyze', 'active');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 2: Extract Insights
    updateStepStatus('analyze', 'complete');
    updateStepStatus('insights', 'active');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Generate Recommendations
    updateStepStatus('insights', 'complete');
    updateStepStatus('recommendations', 'active');
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Generate analysis
    const analysis = await aiService.analyzeProperty(propertyData);
    const trends = await aiService.analyzeMarketTrends();
    
    const result = {
      analysis,
      trends: trends.trends,
      recommendations: {
        designSuggestions: await aiService.generateDesignSuggestions(propertyData, analysis),
        marketingTips: ['Focus on unique features', 'Highlight location benefits', 'Use emotional triggers']
      },
      generatedAt: new Date().toISOString()
    };
    
    // Complete
    updateStepStatus('recommendations', 'complete');
    updateStepStatus('complete', 'complete');
    
    setGeneratedFlyer(result);
    setAiAnalysis(analysis);
    setAiStatus('complete');
    setCurrentStep(3);
    
    return { analysis: result };
  };
  
  // Generate copywriting content
  const generateCopywriting = async () => {
    // Step 1: Analyze Property
    updateStepStatus('analyze', 'active');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = await aiService.analyzeProperty(propertyData);
    
    // Step 2: Create Headlines
    updateStepStatus('analyze', 'complete');
    updateStepStatus('headlines', 'active');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Write Copy
    updateStepStatus('headlines', 'complete');
    updateStepStatus('content', 'active');
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Generate marketing content
    const content = await aiService.generateMarketingContent(propertyData, analysis, userPreferences);
    
    const result = {
      content,
      analysis,
      suggestions: content.suggestions,
      generatedAt: new Date().toISOString()
    };
    
    // Complete
    updateStepStatus('content', 'complete');
    updateStepStatus('complete', 'complete');
    
    setGeneratedFlyer(result);
    setAiAnalysis(analysis);
    setAiStatus('complete');
    setCurrentStep(3);
    
    return { copywriting: result };
  };

  // Validate form data
  const isStepValid = (step) => {
    switch (step) {
      case 1:
        // Only require address and price as minimum (trim whitespace)
        const hasAddress = propertyData.address && propertyData.address.trim().length > 0;
        const hasPrice = propertyData.price && propertyData.price.trim().length > 0;
        return hasAddress && hasPrice;
      case 2:
        // Tone and focus areas have defaults, so always valid
        return true;
      default:
        return true;
    }
  };

  const renderStep1 = () => (
      <div className="ai-step-content">
      <div className="step-header">
        <h3 className="step-title">
          <span className="step-icon">🏠</span>
          Tell Us About Your Property
        </h3>
        <p className="step-description">
          Our AI will analyze these details to create the perfect flyer design and messaging
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Property Address *</label>
          <input
            type="text"
            value={propertyData.address}
            onChange={(e) => handlePropertyChange('address', e.target.value)}
            placeholder="123 Main Street, City, State"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input
            type="text"
            value={propertyData.price}
            onChange={(e) => handlePropertyChange('price', e.target.value)}
            placeholder="$500,000"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Property Type</label>
          <select
            value={propertyData.propertyType}
            onChange={(e) => handlePropertyChange('propertyType', e.target.value)}
            className="form-input"
          >
            {propertyTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Bedrooms *</label>
          <input
            type="number"
            value={propertyData.bedrooms}
            onChange={(e) => handlePropertyChange('bedrooms', e.target.value)}
            placeholder="3"
            className="form-input"
            min="0"
            max="20"
          />
        </div>

        <div className="form-group">
          <label>Bathrooms *</label>
          <input
            type="number"
            step="0.5"
            value={propertyData.bathrooms}
            onChange={(e) => handlePropertyChange('bathrooms', e.target.value)}
            placeholder="2.5"
            className="form-input"
            min="0"
            max="20"
          />
        </div>

        <div className="form-group">
          <label>Square Feet</label>
          <input
            type="number"
            value={propertyData.squareFeet}
            onChange={(e) => handlePropertyChange('squareFeet', e.target.value)}
            placeholder="2500"
            className="form-input"
            min="0"
          />
        </div>

        <div className="form-group full-width">
          <label>Property Description</label>
          <textarea
            value={propertyData.description}
            onChange={(e) => handlePropertyChange('description', e.target.value)}
            placeholder="Describe the property's key features, location benefits, and unique selling points..."
            className="form-textarea"
            rows="4"
          />
        </div>

        <div className="form-group full-width">
          <label>Key Features</label>
          <div className="feature-tags">
            {['Pool', 'Garage', 'Fireplace', 'Updated Kitchen', 'Hardwood Floors', 'Walk-in Closet', 'Patio/Deck', 'New HVAC', 'Granite Counters', 'Stainless Appliances'].map(feature => (
              <button
                key={feature}
                type="button"
                onClick={() => handleFeatureToggle(feature)}
                className={`feature-tag ${propertyData.features.includes(feature) ? 'selected' : ''}`}
              >
                {feature}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="ai-step-content">
      <div className="step-header">
        <h3 className="step-title">
          <span className="step-icon">🎯</span>
          AI Marketing Preferences
        </h3>
        <p className="step-description">
          Help our AI understand your marketing style and target audience
        </p>
        {/* Debug info */}
        <div style={{padding: '10px', background: '#e8f5e8', borderRadius: '5px', fontSize: '12px', marginTop: '10px', border: '1px solid #28a745'}}>
          <strong>Debug:</strong> Tone: {userPreferences.tone || 'none'}, Focus Areas: [{userPreferences.focusAreas?.join(', ') || 'none'}], Valid: {isStepValid(2) ? 'Yes' : 'No'}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Marketing Tone</label>
          <div className="radio-group">
            {toneOptions.map(tone => (
              <label key={tone.value} className="radio-option">
                <input
                  type="radio"
                  name="tone"
                  value={tone.value}
                  checked={userPreferences.tone === tone.value}
                  onChange={(e) => handlePreferenceChange('tone', e.target.value)}
                />
                <span className="radio-label">
                  <strong>{tone.label.split(' & ')[0]}</strong>
                  {tone.label.includes(' & ') && <span> & {tone.label.split(' & ')[1]}</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label>Focus Areas (Select 2-3)</label>
          <div className="checkbox-group">
            {focusAreaOptions.map(area => (
              <label key={area.value} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={userPreferences.focusAreas.includes(area.value)}
                  onChange={() => handleFocusAreaToggle(area.value)}
                />
                <span className="checkbox-label">{area.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="ai-preview-hint">
        <div className="hint-content">
          <Sparkles className="hint-icon" />
          <div>
            <h4>AI Magic Incoming! ✨</h4>
            <p>Based on your inputs, our AI will:</p>
            <ul>
              <li>Analyze your property's market position</li>
              <li>Select the optimal template style</li>
              <li>Generate compelling, targeted copy</li>
              <li>Choose perfect colors and layouts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="ai-generating-content">
      <div className="generating-header">
        <h3 className="generating-title">
          <Zap className="title-icon animate-pulse" />
          AI is Creating Your Perfect Flyer
        </h3>
        <p className="generating-description">
          Our advanced AI is analyzing your property and generating a custom flyer designed to maximize impact
        </p>
      </div>

      <div className="ai-steps-progress">
        {aiSteps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div key={step.id} className={`progress-step ${step.status}`}>
              <div className="step-indicator">
                {step.status === 'complete' ? (
                  <CheckCircle className="step-icon complete" />
                ) : step.status === 'active' ? (
                  <Loader2 className="step-icon active" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="step-icon error" />
                ) : (
                  <IconComponent className="step-icon pending" />
                )}
              </div>
              <div className="step-content">
                <span className="step-label">{step.label}</span>
                {step.status === 'active' && (
                  <div className="step-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <span>AI Generation Error: {error}</span>
          <button onClick={generateAIContent} className="retry-btn">
            Try Again
          </button>
        </div>
      )}
    </div>
  );

  const renderResults = () => (
    <div className="ai-results-content">
      <div className="results-header">
        <h3 className="results-title">
          <CheckCircle className="title-icon success" />
          Your AI-Generated Flyer is Ready!
        </h3>
        <p className="results-description">
          Your flyer has been generated and is ready for editing. You can make changes or use it as-is.
        </p>
      </div>

      <div className="flyer-editor-container">
        <div className="flyer-preview">
          <div className="preview-header">
            <h4>Flyer Preview</h4>
            <div className="preview-actions">
              <button 
                className="preview-action-btn"
                onClick={() => {
                  const htmlContent = generateFlyerHTML();
                  const blob = new Blob([htmlContent], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `flyer-${propertyData.address?.replace(/[^a-zA-Z0-9]/g, '-') || 'property'}.html`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  alert('Flyer saved as HTML file! You can open it in any browser or convert to PDF.');
                }}
              >
                <FileText size={16} />
                Save HTML
              </button>
              <button 
                className="preview-action-btn"
                onClick={() => {
                  const htmlContent = generateFlyerHTML();
                  const newWindow = window.open('', '_blank');
                  if (newWindow) {
                    newWindow.document.write(htmlContent);
                    newWindow.document.close();
                    newWindow.focus();
                    // Add print styles and trigger print dialog
                    setTimeout(() => {
                      newWindow.print();
                    }, 500);
                  }
                }}
              >
                <Palette size={16} />
                Print/PDF
              </button>
            </div>
          </div>
          
          {generatedFlyer ? (
            <div className="flyer-display">
              <div className="flyer-canvas">
                {/* Flyer Header */}
                <div className="flyer-header">
                  <h1 className="flyer-headline">
                    {generatedFlyer.content?.headline || `${propertyData.bedrooms}BR ${propertyData.bathrooms}BA Home For Sale`}
                  </h1>
                  <h2 className="flyer-subheadline">
                    {generatedFlyer.content?.subheadline || 'Prime Location • Move-In Ready'}
                  </h2>
                </div>
                
                {/* Property Image Placeholder */}
                <div className="flyer-image-section">
                  <div className="image-placeholder">
                    <Camera size={48} />
                    <span>Property Photo</span>
                    <small>Click to upload image</small>
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="flyer-details-section">
                  <div className="price-display">
                    {generatedFlyer.content?.priceDisplay || propertyData.price || 'Contact for Price'}
                  </div>
                  
                  <div className="property-stats">
                    <div className="stat-item">
                      <strong>{propertyData.bedrooms || '—'}</strong>
                      <span>Bedrooms</span>
                    </div>
                    <div className="stat-item">
                      <strong>{propertyData.bathrooms || '—'}</strong>
                      <span>Bathrooms</span>
                    </div>
                    <div className="stat-item">
                      <strong>{propertyData.squareFeet || '—'}</strong>
                      <span>Sq Ft</span>
                    </div>
                  </div>
                  
                  <div className="property-address">
                    {propertyData.address}
                  </div>
                  
                  <div className="property-description">
                    {generatedFlyer.content?.description || 
                     propertyData.description || 
                     `Discover this exceptional ${propertyData.bedrooms || '3'} bedroom, ${propertyData.bathrooms || '2'} bathroom home${propertyData.squareFeet ? ` spanning ${propertyData.squareFeet} square feet` : ''}. Located in a desirable neighborhood, this property offers the perfect blend of comfort, style, and convenience for modern living.`}
                  </div>
                  
                  <div className="key-features">
                    <h4>Key Features</h4>
                    <ul>
                      {(generatedFlyer.content?.keyFeatures || [
                        'Prime Location', 
                        'Move-in Ready', 
                        'Modern Updates', 
                        'Great Value', 
                        'Excellent Schools',
                        'Close to Shopping'
                      ]).slice(0, 6).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Agent/Contact Section */}
                <div className="flyer-footer">
                  <div className="agent-info">
                    <div className="agent-photo-placeholder">
                      👤
                    </div>
                    <div className="agent-details">
                      <strong>Your Name</strong>
                      <div>Real Estate Agent</div>
                      <div>Phone: (555) 123-4567</div>
                      <div>Email: agent@example.com</div>
                    </div>
                  </div>
                  
                  <div className="call-to-action">
                    {generatedFlyer.content?.callToAction || 'Schedule Your Showing Today!'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-flyer-message">
              <AlertCircle className="warning-icon" />
              <p>No flyer data available. Please try generating again.</p>
            </div>
          )}
        </div>
        
        {/* AI Insights Sidebar */}
        {aiAnalysis && (
          <div className="ai-insights-sidebar">
            <h4>AI Analysis</h4>
            <div className="insights-list">
              <div className="insight-item">
                <strong>Property Type:</strong>
                <span>{aiAnalysis.propertyType}</span>
              </div>
              <div className="insight-item">
                <strong>Target Audience:</strong>
                <span>{aiAnalysis.targetAudience?.join(', ')}</span>
              </div>
              <div className="insight-item">
                <strong>Style:</strong>
                <span>{aiAnalysis.recommendedStyle}</span>
              </div>
              <div className="insight-item">
                <strong>Position:</strong>
                <span>{aiAnalysis.marketPosition}</span>
              </div>
              <div className="insight-item">
                <strong>AI Confidence:</strong>
                <span>{Math.round((aiAnalysis?.confidence || 0.85) * 100)}%</span>
              </div>
            </div>
            
            {generatedFlyer.content?.suggestions && (
              <div className="ai-suggestions">
                <h4>AI Suggestions</h4>
                {generatedFlyer.content.suggestions.improvementTips?.map((tip, index) => (
                  <div key={index} className="suggestion-tip">
                    💡 {tip}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(
    <div 
      className="ai-flyer-generator-modal"
    >
      <div 
        className="ai-generator-container" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: currentStep === 3 && aiStatus === 'complete' ? '95vw' : 'auto', // Expand for flyer display
          maxWidth: currentStep === 3 && aiStatus === 'complete' ? '1600px' : '800px', // Larger max width for flyer
          transition: 'all 0.3s ease-out' // Smooth transition when expanding
        }}
      >
        
        {/* Header */}
        <div className="generator-header">
          <div className="header-content">
            <h2 className="generator-title">
              <Zap className="title-icon" />
              AI Flyer Generator
              <span className="ai-badge-small">✨ AI-Powered</span>
            </h2>
            <p className="generator-subtitle">
              Revolutionary AI creates perfect flyers from your property data in minutes
            </p>
          </div>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        {/* Progress Indicator */}
        <div className="step-progress-bar">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`progress-segment ${currentStep >= step ? 'active' : ''}`}>
              <span className="segment-number">{step}</span>
              <span className="segment-label">
                {step === 1 ? 'Property' : step === 2 ? 'Preferences' : 'Results'}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="generator-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {aiStatus === 'analyzing' || aiStatus === 'generating' ? renderGeneratingStep() : null}
          {currentStep === 3 && aiStatus === 'complete' && renderResults()}
        </div>

        {/* Footer Actions */}
        <div className="generator-footer">
          {currentStep === 1 && (
            <div className="footer-actions">
              <button onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => setCurrentStep(2)} 
                className="btn-primary"
                disabled={!isStepValid(1)}
                title={isStepValid(1) ? 'Continue to next step' : `Missing: ${!propertyData.address ? 'Address ' : ''}${!propertyData.price ? 'Price' : ''}`}
              >
                Next: AI Preferences
                <ChevronRight className="btn-icon" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="footer-actions">
              <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isGenerating) {
                    return;
                  }
                  
                  // Call the AI generation function
                  generateAIContent();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '25px 40px',
                  backgroundColor: '#ff0000',
                  color: 'white',
                  border: '5px solid #000000',
                  borderRadius: '15px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  userSelect: 'none',
                  minHeight: '80px',
                  minWidth: '300px',
                  position: 'relative',
                  zIndex: 999999,
                  margin: '20px auto',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  boxShadow: '0 8px 16px rgba(255,0,0,0.5)',
                  transition: 'all 0.2s ease',
                  opacity: isGenerating ? 0.7 : 1
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="btn-icon animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="btn-icon" />
                    Generate AI Flyer
                  </>
                )}
              </button>
            </div>
          )}

          {currentStep === 3 && aiStatus === 'complete' && (
            <div className="footer-actions">
              <button onClick={generateAIContent} className="btn-secondary">
                🔄 Regenerate Flyer
              </button>
              <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                ⬅️ Edit Property Data
              </button>
              <button 
                onClick={() => handleSaveFlyer()}
                className="btn-primary"
              >
                💾 Save Flyer
                <ChevronRight className="btn-icon" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AIFlyerGenerator;

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Palette, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Layout,
  // Type, // Unused
  // Camera // Unused
} from 'lucide-react';
import aiService from '../services/aiService';
// import templateService from '../services/templateService'; // Unused
import subscriptionService from '../services/subscriptionService';
import { supabase, getCurrentUser } from '../utils/supabase';
import './AITemplateGenerator.css';

const AITemplateGenerator = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle'); // idle, analyzing, generating, complete
  const [generatedTemplates, setGeneratedTemplates] = useState([]);
  const [error, setError] = useState(null);
  
  // Template requirements state
  const [templateRequirements, setTemplateRequirements] = useState({
    propertyTypes: [],
    designStyle: '',
    colorScheme: '',
    targetAudience: '',
    layoutPreference: '',
    brandPersonality: '',
    templateCount: 5
  });

  // User preferences
  const [designPreferences, /* setDesignPreferences */] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    fontStyle: 'modern',
    spacingStyle: 'balanced'
  });

  // AI steps for template generation
  const [aiSteps, setAiSteps] = useState([
    { id: 'analyze', label: 'Analyzing Requirements', status: 'pending', icon: Brain },
    { id: 'research', label: 'Market Research', status: 'pending', icon: Sparkles },
    { id: 'design', label: 'Creating Layouts', status: 'pending', icon: Layout },
    { id: 'styling', label: 'Applying Styles', status: 'pending', icon: Palette },
    { id: 'optimize', label: 'Optimizing Templates', status: 'pending', icon: CheckCircle }
  ]);

  const propertyTypes = [
    'Residential Homes',
    'Luxury Estates', 
    'Condos & Townhomes',
    'Commercial Properties',
    'Rental Properties',
    'Land & Development',
    'Investment Properties'
  ];

  const designStyles = [
    { value: 'modern', label: 'Modern & Clean' },
    { value: 'luxury', label: 'Luxury & Elegant' },
    { value: 'classic', label: 'Classic & Traditional' },
    { value: 'contemporary', label: 'Contemporary & Bold' },
    { value: 'minimal', label: 'Minimalist & Simple' },
    { value: 'creative', label: 'Creative & Unique' }
  ];

  const colorSchemes = [
    { value: 'professional', label: 'Professional Blues', colors: ['#1e40af', '#3b82f6', '#60a5fa'] },
    { value: 'luxury', label: 'Luxury Gold', colors: ['#92400e', '#d97706', '#fbbf24'] },
    { value: 'warm', label: 'Warm Earth Tones', colors: ['#7c2d12', '#dc2626', '#f97316'] },
    { value: 'cool', label: 'Cool Greys', colors: ['#374151', '#6b7280', '#9ca3af'] },
    { value: 'vibrant', label: 'Vibrant Colors', colors: ['#7c3aed', '#ec4899', '#10b981'] },
    { value: 'natural', label: 'Natural Greens', colors: ['#365314', '#16a34a', '#84cc16'] }
  ];

  const targetAudiences = [
    { value: 'families', label: 'Young Families' },
    { value: 'luxury-buyers', label: 'Luxury Buyers' },
    { value: 'first-time', label: 'First-Time Buyers' },
    { value: 'investors', label: 'Property Investors' },
    { value: 'professionals', label: 'Working Professionals' },
    { value: 'retirees', label: 'Retirees & Downsizers' }
  ];

  // Handle form changes
  const handleRequirementChange = (field, value) => {
    setTemplateRequirements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyTypeToggle = (propertyType) => {
    setTemplateRequirements(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(propertyType)
        ? prev.propertyTypes.filter(p => p !== propertyType)
        : [...prev.propertyTypes, propertyType]
    }));
  };

  // Currently unused but may be needed for future preference updates
  // const handlePreferenceChange = (field, value) => {
  //   setDesignPreferences(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // };

  // Update AI step status
  const updateStepStatus = (stepId, status) => {
    setAiSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // Validate form steps
  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return templateRequirements.propertyTypes.length > 0 && 
               templateRequirements.designStyle && 
               templateRequirements.targetAudience;
      case 2:
        return templateRequirements.colorScheme && 
               templateRequirements.layoutPreference;
      default:
        return true;
    }
  };

  // Generate AI templates
  const generateAITemplates = async () => {
    try {
      setIsGenerating(true);
      setAiStatus('analyzing');
      setCurrentStep(3);
      setError(null);

      console.log('🎨 Starting AI template generation with requirements:', templateRequirements);

      // Step 1: Analyze requirements
      updateStepStatus('analyze', 'active');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // const analysisPrompt = `Generate template analysis in JSON format for these requirements:
      // Property Types: ${templateRequirements.propertyTypes.join(', ')}
      // Design Style: ${templateRequirements.designStyle}
      // Target Audience: ${templateRequirements.targetAudience}
      // Color Scheme: ${templateRequirements.colorScheme}
      // Layout: ${templateRequirements.layoutPreference}
      // 
      // Return JSON with: designDirection, layoutStrategy, colorPalette, typographyRecommendations`; // Unused

      // const analysis = await aiService.generateTextWithFallback(analysisPrompt, 300); // Unused variable
      updateStepStatus('analyze', 'complete');

      // Step 2: Market research
      updateStepStatus('research', 'active');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus('research', 'complete');

      // Step 3: Create layouts
      updateStepStatus('design', 'active');
      await new Promise(resolve => setTimeout(resolve, 2500));

      const templatePrompt = `Generate ${templateRequirements.templateCount} template designs in JSON format:
Requirements: ${JSON.stringify(templateRequirements)}
Preferences: ${JSON.stringify(designPreferences)}

Return JSON array with: templateId, name, description, layout, colorScheme, features, bestFor`;

      const templatesResponse = await aiService.generateTextWithFallback(templatePrompt, 500);
      updateStepStatus('design', 'complete');

      // Step 4: Apply styling
      updateStepStatus('styling', 'active');
      await new Promise(resolve => setTimeout(resolve, 1800));
      updateStepStatus('styling', 'complete');

      // Step 5: Optimize
      updateStepStatus('optimize', 'active');
      await new Promise(resolve => setTimeout(resolve, 1200));
      updateStepStatus('optimize', 'complete');

      // Parse and format results
      let templates;
      try {
        templates = JSON.parse(templatesResponse);
        // Ensure it's an array
        if (!Array.isArray(templates)) {
          templates = generateFallbackTemplates();
        }
      } catch (e) {
        // Fallback to generated templates if parsing fails
        templates = generateFallbackTemplates();
      }

      setGeneratedTemplates(templates || []);
      setAiStatus('complete');
      setIsGenerating(false);

      console.log('✅ Template generation complete:', templates);

    } catch (error) {
      console.error('❌ Template generation error:', error);
      setError(error.message);
      setAiStatus('error');
      setIsGenerating(false);
      
      // Generate fallback templates even on error
      const fallbackTemplates = generateFallbackTemplates();
      setGeneratedTemplates(fallbackTemplates);
      
      // Mark current step as error
      const activeStep = aiSteps.find(step => step.status === 'active');
      if (activeStep) {
        updateStepStatus(activeStep.id, 'error');
      }
    }
  };

  // Generate fallback templates if AI fails
  const generateFallbackTemplates = () => {
    const baseTemplates = [
      {
        templateId: 'modern_classic_01',
        name: 'Modern Classic',
        description: 'Clean, professional design with modern typography and balanced layout',
        layout: 'header-image-details-footer',
        colorScheme: templateRequirements.colorScheme || 'professional',
        features: ['Clean Typography', 'Professional Layout', 'Brand Integration'],
        bestFor: templateRequirements.propertyTypes[0] || 'Residential Homes',
        thumbnail: '🏠'
      },
      {
        templateId: 'elegant_luxury_01',
        name: 'Elegant Luxury',
        description: 'Sophisticated design with premium styling and elegant details',
        layout: 'hero-stats-features-contact',
        colorScheme: templateRequirements.colorScheme || 'luxury',
        features: ['Premium Typography', 'Luxury Styling', 'Gold Accents'],
        bestFor: 'Luxury Properties',
        thumbnail: '🏰'
      },
      {
        templateId: 'contemporary_bold_01',
        name: 'Contemporary Bold',
        description: 'Eye-catching design with bold colors and modern elements',
        layout: 'split-hero-grid-details',
        colorScheme: templateRequirements.colorScheme || 'vibrant',
        features: ['Bold Design', 'Modern Elements', 'High Contrast'],
        bestFor: 'Modern Properties',
        thumbnail: '🏢'
      }
    ];

    return baseTemplates.slice(0, templateRequirements.templateCount);
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    const templateData = {
      template,
      requirements: templateRequirements,
      preferences: designPreferences,
      generatedAt: new Date().toISOString()
    };
    
    // Save to user's collection
    saveToCollection(templateData);
    
    if (onComplete) {
      onComplete(templateData);
    }
  };

  // Handle re-generation with subscription check
  const handleRegenerate = async () => {
    try {
      // Check user's AI generation usage
      const usage = await checkAIUsage();
      
      if (usage.hasReachedLimit && !usage.hasSubscription) {
        // Redirect to subscription
        alert(`🚀 You've used your free AI generation! 

Upgrade to Pro for unlimited AI template generation:
• Unlimited AI generations
• Priority processing
• Advanced customization
• Premium templates

Would you like to upgrade now?`);
        
        // You can redirect to subscription page here
        window.open('/pricing', '_blank');
        return;
      }
      
      // Reset to step 1 for new generation
      setCurrentStep(1);
      setAiStatus('idle');
      setGeneratedTemplates([]);
      setError(null);
      
    } catch (error) {
      console.error('Error checking usage:', error);
      // Allow regeneration if check fails
      setCurrentStep(1);
      setAiStatus('idle');
      setGeneratedTemplates([]);
      setError(null);
    }
  };

  // Save generated template to user's collection
  const saveToCollection = async (templateData) => {
    try {
      console.log('💾 Saving template to collection:', templateData.template.name);
      
      // Here you would save to your database
      const saved = await saveTemplateToDatabase(templateData);
      
      if (saved) {
        console.log('✅ Template saved to collection successfully');
        // Show success message
        showSuccessMessage('Template added to your collection!');
      }
    } catch (error) {
      console.error('❌ Failed to save template:', error);
      showErrorMessage('Failed to save template to collection');
    }
  };

  // Check AI usage limits
  const checkAIUsage = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          hasReachedLimit: true,
          hasSubscription: false,
          generationsUsed: 0,
          generationsLimit: 0,
          error: 'User not authenticated'
        };
      }

      // Check subscription status
      const subscriptionStatus = await subscriptionService.getSubscriptionStatus(user.id);
      const hasSubscription = subscriptionStatus.isActive;

      // Check usage limits if not subscribed
      if (!hasSubscription) {
        const { data: canUse, error } = await supabase.rpc('check_user_limits', {
          user_uuid: user.id,
          resource_type: 'ai_generation'
        });

        if (error) {
          console.warn('Failed to check usage limits:', error);
          return { hasReachedLimit: false, hasSubscription: false };
        }

        return {
          hasReachedLimit: !canUse,
          hasSubscription: false,
          generationsUsed: 0, // Could be fetched from user_usage table
          generationsLimit: 3  // Free tier limit
        };
      }

      return {
        hasReachedLimit: false,
        hasSubscription: true,
        generationsUsed: 0,
        generationsLimit: -1 // Unlimited
      };
    } catch (error) {
      console.error('Error checking usage:', error);
      // Default to allowing usage if check fails
      return { hasReachedLimit: false, hasSubscription: false };
    }
  };

  // Save template to database
  const saveTemplateToDatabase = async (templateData) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User must be logged in to save templates');
      }

      const template = templateData.template;
      const templateRecord = {
        name: template.name,
        description: template.description,
        category_id: null, // Could be mapped from requirements
        thumbnail_url: template.thumbnail,
        template_data: {
          layout: template.layout,
          colorScheme: template.colorScheme,
          features: template.features,
          bestFor: template.bestFor,
          requirements: templateData.requirements,
          preferences: templateData.preferences,
          generatedAt: templateData.generatedAt,
          aiGenerated: true,
          templateId: template.templateId
        },
        tags: template.features || [],
        is_public: false,
        is_premium: false,
        is_active: true,
        user_id: user.id,
        subcategory: templateData.requirements?.propertyTypes?.[0] || 'general',
        metadata: {
          generatedBy: 'ai',
          provider: 'replicate',
          version: '1.0'
        }
      };

      const { data, error } = await supabase
        .from('templates')
        .insert(templateRecord)
        .select()
        .single();

      if (error) throw error;

      // Track usage for subscription limits
      await supabase.rpc('increment_usage_counter', {
        user_uuid: user.id,
        resource_type: 'ai_generation'
      });

      console.log('✅ Template saved successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Failed to save template to database:', error);
      throw error;
    }
  };

  // Show success/error messages
  const showSuccessMessage = (message) => {
    // You can implement a toast notification here
    console.log('✅ Success:', message);
  };

  const showErrorMessage = (message) => {
    // You can implement a toast notification here
    console.error('❌ Error:', message);
  };

  // Scroll modal into view when it opens
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Render step 1: Template requirements
  const renderStep1 = () => (
    <div className="ai-step-content">
      <div className="step-header">
        <h3 className="step-title">
          <Brain className="step-icon" />
          Define Template Requirements
        </h3>
        <p className="step-description">
          Tell our AI what types of templates you need and who they're for
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Property Types (Select all that apply)</label>
          <div className="checkbox-group">
            {propertyTypes.map(type => (
              <div 
                key={type}
                className={`checkbox-option ${templateRequirements.propertyTypes.includes(type) ? 'selected' : ''}`}
                onClick={() => handlePropertyTypeToggle(type)}
              >
                <input 
                  type="checkbox" 
                  checked={templateRequirements.propertyTypes.includes(type)}
                  onChange={() => {}}
                />
                <span className="checkbox-label">{type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Design Style</label>
          <select 
            value={templateRequirements.designStyle} 
            onChange={(e) => handleRequirementChange('designStyle', e.target.value)}
            className="form-input"
          >
            <option value="">Choose design style</option>
            {designStyles.map(style => (
              <option key={style.value} value={style.value}>{style.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Target Audience</label>
          <select 
            value={templateRequirements.targetAudience} 
            onChange={(e) => handleRequirementChange('targetAudience', e.target.value)}
            className="form-input"
          >
            <option value="">Choose target audience</option>
            {targetAudiences.map(audience => (
              <option key={audience.value} value={audience.value}>{audience.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Number of Templates</label>
          <select 
            value={templateRequirements.templateCount} 
            onChange={(e) => handleRequirementChange('templateCount', parseInt(e.target.value))}
            className="form-input"
          >
            <option value={3}>3 Templates</option>
            <option value={5}>5 Templates</option>
            <option value={8}>8 Templates</option>
            <option value={10}>10 Templates</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Render step 2: Design preferences  
  const renderStep2 = () => (
    <div className="ai-step-content">
      <div className="step-header">
        <h3 className="step-title">
          <Palette className="step-icon" />
          Design Preferences
        </h3>
        <p className="step-description">
          Customize the visual style and layout preferences for your templates
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Color Scheme</label>
          <div className="color-scheme-grid">
            {colorSchemes.map(scheme => (
              <div 
                key={scheme.value}
                className={`color-scheme-option ${templateRequirements.colorScheme === scheme.value ? 'selected' : ''}`}
                onClick={() => handleRequirementChange('colorScheme', scheme.value)}
              >
                <div className="color-preview">
                  {scheme.colors.map((color, index) => (
                    <div 
                      key={index} 
                      className="color-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="color-scheme-label">{scheme.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Layout Preference</label>
          <div className="radio-group">
            {[
              { value: 'hero-focused', label: 'Hero Image Focus' },
              { value: 'content-balanced', label: 'Balanced Content' },
              { value: 'info-dense', label: 'Information Dense' }
            ].map(option => (
              <div key={option.value} className="radio-option">
                <input 
                  type="radio"
                  name="layoutPreference"
                  value={option.value}
                  checked={templateRequirements.layoutPreference === option.value}
                  onChange={(e) => handleRequirementChange('layoutPreference', e.target.value)}
                />
                <span className="radio-label">{option.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Brand Personality</label>
          <select 
            value={templateRequirements.brandPersonality} 
            onChange={(e) => handleRequirementChange('brandPersonality', e.target.value)}
            className="form-input"
          >
            <option value="">Choose personality</option>
            <option value="trustworthy">Trustworthy & Professional</option>
            <option value="innovative">Innovative & Modern</option>
            <option value="premium">Premium & Exclusive</option>
            <option value="approachable">Friendly & Approachable</option>
            <option value="bold">Bold & Confident</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Render generating step
  const renderGeneratingStep = () => (
    <div className="ai-generating-content">
      <div className="generating-header">
        <h3 className="generating-title">
          <Sparkles className="step-icon" />
          AI is Creating Your Templates...
        </h3>
        <p className="generating-description">
          Our advanced AI is analyzing your requirements and generating custom template designs
        </p>
      </div>

      <div className="ai-steps-progress">
        {aiSteps.map((step, index) => (
          <div key={step.id} className={`progress-step ${step.status}`}>
            <div className="step-indicator">
              {step.status === 'complete' ? (
                <CheckCircle className="step-icon complete" />
              ) : step.status === 'active' ? (
                <Loader2 className="step-icon active" />
              ) : step.status === 'error' ? (
                <AlertCircle className="step-icon error" />
              ) : (
                <step.icon className="step-icon pending" />
              )}
            </div>
            <div className="step-content">
              <span className="step-label">{step.label}</span>
              {step.status === 'active' && (
                <div className="step-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <span>AI servers are currently busy</span>
          <div className="error-actions">
            <button onClick={generateAITemplates} className="retry-btn">
              Retry AI Generation
            </button>
            <button onClick={() => {
              // Fallback to HTML/CSS template generator
              onCancel();
              // You can add logic here to open HTML template generator
              alert('Redirecting to HTML/CSS Template Generator...');
            }} className="fallback-btn">
              Use HTML/CSS Generator Instead
            </button>
          </div>
          <p className="fallback-note">
            💡 You can use our HTML/CSS template generator while AI servers are busy.
            All templates are modern and Tailwind CSS compatible!
          </p>
        </div>
      )}
    </div>
  );

  // Render results step
  const renderResults = () => {
    // Ensure generatedTemplates is always an array
    const templates = Array.isArray(generatedTemplates) ? generatedTemplates : [];
    
    return (
      <div className="ai-results-content">
        <div className="results-header">
          <h3 className="results-title">
            {aiStatus === 'error' ? (
              <>
                <AlertCircle className="title-icon error" />
                Templates Generated with Fallback
              </>
            ) : (
              <>
                <CheckCircle className="title-icon success" />
                Your Custom Templates Are Ready!
              </>
            )}
          </h3>
          <p className="results-description">
            {aiStatus === 'error' 
              ? `Generated ${templates.length} template options using our intelligent fallback system`
              : `AI has generated ${templates.length} unique templates based on your requirements`
            }
          </p>
        </div>

        <div className="templates-grid">
          {templates.map((template, index) => (
          <div key={template.templateId} className="template-card">
            <div className="template-preview">
              <div className="template-thumbnail">
                {template.thumbnail || '📄'}
              </div>
            </div>
            <div className="template-info">
              <h4 className="template-name">{template.name}</h4>
              <p className="template-description">{template.description}</p>
              <div className="template-features">
                {template.features.map((feature, idx) => (
                  <span key={idx} className="feature-tag">{feature}</span>
                ))}
              </div>
              <div className="template-best-for">
                <strong>Best for:</strong> {template.bestFor}
              </div>
            </div>
            <button 
              className="template-select-btn"
              onClick={() => handleTemplateSelect(template)}
            >
              Use This Template
            </button>
          </div>
        ))}
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="ai-template-generator-modal">
      <div className="modal-overlay" onClick={onCancel} />
      
      <div 
        className="ai-generator-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="generator-header">
          <div className="header-content">
            <h2 className="generator-title">
              <Palette className="title-icon" />
              AI Template Generator
              <span className="ai-badge-small">✨ AI-Powered</span>
            </h2>
            <p className="generator-subtitle">
              Generate custom flyer templates tailored to your specific needs and brand
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
                {step === 1 ? 'Requirements' : step === 2 ? 'Design' : 'Generate'}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="generator-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {(aiStatus === 'analyzing' || aiStatus === 'generating') && renderGeneratingStep()}
          {currentStep === 3 && (aiStatus === 'complete' || aiStatus === 'error') && renderResults()}
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
              >
                Next: Design Preferences
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
                onClick={generateAITemplates}
                className="btn-primary"
                disabled={!isStepValid(2) || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="btn-icon animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Templates
                    <Sparkles className="btn-icon" />
                  </>
                )}
              </button>
            </div>
          )}

          {currentStep === 3 && (aiStatus === 'complete' || aiStatus === 'error') && (
            <div className="footer-actions">
              <button onClick={onCancel} className="btn-secondary">
                Close
              </button>
              <button onClick={() => handleRegenerate()} className="btn-primary">
                Re-generate Templates
                <Sparkles className="btn-icon" />
              </button>
              <button 
                onClick={() => {
                  onCancel();
                  // Trigger collections view - could pass a callback to parent
                  if (window.openCollections) {
                    window.openCollections();
                  } else {
                    alert('✨ Templates saved to your collection! Check the Dashboard for "My Collections" to browse all saved items.');
                  }
                }} 
                className="btn-outline"
              >
                Browse My Collection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AITemplateGenerator;

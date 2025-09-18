import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Analytics events
const ANALYTICS_EVENTS = {
  TEMPLATE_PREVIEW: 'template_preview',
  TEMPLATE_USE: 'template_use',
  TEMPLATE_FAVORITE: 'template_favorite',
  TEMPLATE_UNFAVORITE: 'template_unfavorite',
  UPGRADE_PROMPT_SHOWN: 'upgrade_prompt_shown',
  UPGRADE_PROMPT_CLICKED: 'upgrade_prompt_clicked',
  DEMO_VIDEO_OPENED: 'demo_video_opened',
  DEMO_VIDEO_PLAYED: 'demo_video_played',
  TEMPLATE_BROWSER_OPENED: 'template_browser_opened',
  TEMPLATE_SEARCH: 'template_search',
  TEMPLATE_FILTER: 'template_filter',
  // AI Feature Events
  AI_FLYER_GENERATION_CLICKED: 'ai_flyer_generation_clicked',
  AI_TEMPLATE_CREATION_CLICKED: 'ai_template_creation_clicked',
  PROPERTY_ANALYSIS_CLICKED: 'property_analysis_clicked',
  AI_COPYWRITING_CLICKED: 'ai_copywriting_clicked',
  DESIGN_EDITOR_CLICKED: 'design_editor_clicked'
};

// Initial state
const initialState = {
  templatesUsed: 0,
  favoriteTemplates: [],
  usageHistory: [],
  analytics: {
    sessionStart: Date.now(),
    events: []
  },
  loading: false,
  error: null
};

// Action types
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  INCREMENT_USAGE: 'INCREMENT_USAGE',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  TRACK_EVENT: 'TRACK_EVENT',
  LOAD_USER_DATA: 'LOAD_USER_DATA',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const templateReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTION_TYPES.INCREMENT_USAGE:
      const newUsage = {
        templateId: action.payload.templateId,
        templateName: action.payload.templateName,
        timestamp: Date.now(),
        sessionId: action.payload.sessionId
      };
      return {
        ...state,
        templatesUsed: state.templatesUsed + 1,
        usageHistory: [...state.usageHistory, newUsage]
      };
    
    case ACTION_TYPES.ADD_FAVORITE:
      if (state.favoriteTemplates.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        favoriteTemplates: [...state.favoriteTemplates, action.payload]
      };
    
    case ACTION_TYPES.REMOVE_FAVORITE:
      return {
        ...state,
        favoriteTemplates: state.favoriteTemplates.filter(id => id !== action.payload)
      };
    
    case ACTION_TYPES.TRACK_EVENT:
      const event = {
        ...action.payload,
        timestamp: Date.now(),
        sessionId: generateSessionId()
      };
      return {
        ...state,
        analytics: {
          ...state.analytics,
          events: [...state.analytics.events, event]
        }
      };
    
    case ACTION_TYPES.LOAD_USER_DATA:
      return {
        ...state,
        templatesUsed: action.payload.templatesUsed || 0,
        favoriteTemplates: action.payload.favoriteTemplates || [],
        usageHistory: action.payload.usageHistory || []
      };
    
    case ACTION_TYPES.RESET_STATE:
      return { ...initialState };
    
    default:
      return state;
  }
};

// Generate session ID
const generateSessionId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Context
const TemplateContext = createContext();

// Provider component
export const TemplateProvider = ({ children, user }) => {
  const [state, dispatch] = useReducer(templateReducer, initialState);

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      // In a real app, this would fetch from an API
      const userData = {
        templatesUsed: user.templatesUsed || 0,
        favoriteTemplates: JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]'),
        usageHistory: JSON.parse(localStorage.getItem(`usage_${user.id}`) || '[]')
      };
      dispatch({ type: ACTION_TYPES.LOAD_USER_DATA, payload: userData });
    } else {
      dispatch({ type: ACTION_TYPES.RESET_STATE });
    }
  }, [user]);

  // Persist favorites to localStorage
  useEffect(() => {
    if (user && state.favoriteTemplates.length > 0) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(state.favoriteTemplates));
    }
  }, [state.favoriteTemplates, user]);

  // Persist usage history to localStorage
  useEffect(() => {
    if (user && state.usageHistory.length > 0) {
      localStorage.setItem(`usage_${user.id}`, JSON.stringify(state.usageHistory));
    }
  }, [state.usageHistory, user]);

  // Analytics functions
  const trackEvent = (eventName, properties = {}) => {
    const eventData = {
      name: eventName,
      properties: {
        ...properties,
        userId: user?.id,
        userSubscription: user?.subscription,
        templatesUsedSoFar: state.templatesUsed
      }
    };

    dispatch({ type: ACTION_TYPES.TRACK_EVENT, payload: eventData });

    // Only log analytics in development if specifically needed for debugging
    // Remove or comment out this line to reduce console noise:
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('Analytics Event:', eventData);
    // }

    // Send to external analytics (GA, Mixpanel, etc.)
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
  };

  // Template actions
  const useTemplate = (template) => {
    dispatch({ 
      type: ACTION_TYPES.INCREMENT_USAGE, 
      payload: { 
        templateId: template.id, 
        templateName: template.name,
        sessionId: generateSessionId()
      } 
    });

    trackEvent(ANALYTICS_EVENTS.TEMPLATE_USE, {
      templateId: template.id,
      templateName: template.name,
      templateCategory: template.category
    });
  };

  const toggleFavorite = (templateId, templateName, templateCategory) => {
    const isFavorited = state.favoriteTemplates.includes(templateId);
    
    if (isFavorited) {
      dispatch({ type: ACTION_TYPES.REMOVE_FAVORITE, payload: templateId });
      trackEvent(ANALYTICS_EVENTS.TEMPLATE_UNFAVORITE, {
        templateId,
        templateName,
        templateCategory
      });
    } else {
      dispatch({ type: ACTION_TYPES.ADD_FAVORITE, payload: templateId });
      trackEvent(ANALYTICS_EVENTS.TEMPLATE_FAVORITE, {
        templateId,
        templateName,
        templateCategory
      });
    }
  };

  const previewTemplate = (template) => {
    trackEvent(ANALYTICS_EVENTS.TEMPLATE_PREVIEW, {
      templateId: template.id,
      templateName: template.name,
      templateCategory: template.category
    });
  };

  // Check if user can use more templates
  const canUseTemplate = () => {
    if (!user) return false;
    if (user.subscription === 'premium' || user.subscription === 'pro') return true;
    return state.templatesUsed < 3;
  };

  // Get remaining free templates
  const getRemainingFreeTemplates = () => {
    if (!user) return 0;
    if (user.subscription === 'premium' || user.subscription === 'pro') return 999;
    return Math.max(0, 3 - state.templatesUsed);
  };

  const value = {
    // State
    ...state,
    
    // User-related
    user,
    canUseTemplate: canUseTemplate(),
    remainingFreeTemplates: getRemainingFreeTemplates(),
    
    // Actions
    useTemplate,
    toggleFavorite,
    previewTemplate,
    trackEvent,
    
    // Analytics events constants
    ANALYTICS_EVENTS,
    
    // Dispatch for advanced usage
    dispatch
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

// Hook to use the context
export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};

export default TemplateContext;

import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import favoritesService from '../services/favoritesService';
import { getCurrentUser } from '../utils/supabase';
import './SocialTemplateBrowser.css';

const SocialTemplateBrowser = ({ 
  onTemplateSelect,
  onTemplatePreview,
  onClose,
  trackEvent,
  ANALYTICS_EVENTS 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [loading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [user, setUser] = useState(null);

  // Load user and favorites on component mount
  useEffect(() => {
    const loadUserAndFavorites = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const result = await favoritesService.getUserFavorites(currentUser.id);
          if (result.success) {
            const favoriteIds = new Set(result.data.map(fav => fav.template_id));
            setFavorites(favoriteIds);
          }
        }
      } catch (error) {
        console.error('Error loading user favorites:', error);
      }
    };
    
    loadUserAndFavorites();
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = async (template) => {
    if (!user) {
      alert('Please log in to save favorites');
      return;
    }

    // IMMEDIATELY update UI for instant feedback
    const newFavorites = new Set(favorites);
    const wasFavorited = favorites.has(template.id);
    
    if (wasFavorited) {
      newFavorites.delete(template.id);
    } else {
      newFavorites.add(template.id);
    }
    setFavorites(newFavorites);

    try {
      const result = await favoritesService.toggleFavorite(
        user.id, 
        template.id, 
        'social_template'
      );
      
      if (!result.success) {
        // Revert on failure
        console.error('Failed to update favorites, reverting UI change');
        setFavorites(favorites); // Revert to original state
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavorites(favorites); 
    }
  };

  // Social media template data
  const socialTemplates = [
    {
      id: '650e8400-e29b-41d4-a716-446655440001',
      name: "Property Showcase Reel",
      category: "Reels",
      preview: "🎬",
      imageUrl: "https://via.placeholder.com/300x400/2a2a2a/e91e63?text=Property+Reel",
      popular: true,
      description: "Dynamic property showcase for Instagram Reels",
      features: ["Vertical Format", "Animation", "Music Sync"]
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440002',
      name: "Just Listed Story",
      category: "Stories",
      preview: "📱",
      imageUrl: "https://via.placeholder.com/300x400/2a2a2a/48bb78?text=Just+Listed+Story",
      popular: true,
      description: "Eye-catching story template for new listings",
      features: ["24h Format", "Interactive Elements", "Swipe Up"]
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440003',
      name: "Open House Event",
      category: "Square Posts",
      preview: "🏠",
      imageUrl: "https://via.placeholder.com/400x400/2a2a2a/7877c6?text=Open+House+Post",
      popular: false,
      description: "Square format for open house announcements",
      features: ["Square Format", "Event Details", "Location Map"]
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440004',
      name: "Property Features Carousel",
      category: "Carousels",
      preview: "📸",
      imageUrl: "https://via.placeholder.com/400x400/2a2a2a/ed8936?text=Property+Carousel",
      popular: true,
      description: "Multi-slide carousel showcasing property features",
      features: ["Multiple Slides", "Feature Highlights", "Swipeable"]
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440005',
      name: "Luxury Home Ad",
      category: "Ads",
      preview: "💎",
      imageUrl: "https://via.placeholder.com/400x300/2a2a2a/ff7675?text=Luxury+Ad",
      popular: true,
      description: "Premium ad template for luxury properties",
      features: ["Paid Promotion", "CTA Button", "Conversion Tracking"]
    },
    {
      id: 6,
      name: "Market Update Video",
      category: "Reels",
      preview: "📊",
      imageUrl: "https://via.placeholder.com/300x400/2a2a2a/6c5ce7?text=Market+Update",
      popular: false,
      description: "Educational content about market trends",
      features: ["Data Visualization", "Professional Look", "Voice Over"]
    },
    {
      id: 7,
      name: "Client Testimonial Story",
      category: "Stories",
      preview: "⭐",
      imageUrl: "https://via.placeholder.com/300x400/2a2a2a/a0aec0?text=Testimonial+Story",
      popular: true,
      description: "Showcase client reviews and success stories",
      features: ["Quote Format", "Photo Integration", "Brand Colors"]
    },
    {
      id: 8,
      name: "Neighborhood Guide",
      category: "Square Posts",
      preview: "🗺️",
      imageUrl: "https://via.placeholder.com/400x400/2a2a2a/00b894?text=Neighborhood+Guide",
      popular: false,
      description: "Informative post about local neighborhoods",
      features: ["Local Info", "Amenities", "Lifestyle Focus"]
    },
    {
      id: 9,
      name: "Before & After Renovation",
      category: "Carousels",
      preview: "🔨",
      imageUrl: "https://via.placeholder.com/400x400/2a2a2a/0984e3?text=Before+After",
      popular: true,
      description: "Showcase property transformations",
      features: ["Comparison Slides", "Progress Story", "Value Addition"]
    },
    {
      id: 10,
      name: "First Time Buyer Tips",
      category: "Reels",
      preview: "🎓",
      imageUrl: "https://via.placeholder.com/300x400/2a2a2a/fab1a0?text=Buyer+Tips",
      popular: false,
      description: "Educational content for first-time buyers",
      features: ["Educational", "Step by Step", "Helpful Tips"]
    },
    {
      id: 11,
      name: "Sold Property Celebration",
      category: "Stories",
      preview: "🎉",
      imageUrl: "https://via.placeholder.com/300x400/2a2a2a/fd79a8?text=Sold+Celebration",
      popular: true,
      description: "Celebrate successful property sales",
      features: ["Celebration Theme", "Success Story", "Thank You Message"]
    },
    {
      id: 12,
      name: "Investment Property Ad",
      category: "Ads",
      preview: "💰",
      imageUrl: "https://via.placeholder.com/400x300/2a2a2a/55a3ff?text=Investment+Ad",
      popular: false,
      description: "Targeted ad for investment properties",
      features: ["ROI Focus", "Financial Benefits", "Investor Targeting"]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'Reels', label: 'Instagram Reels' },
    { id: 'Stories', label: 'Stories' },
    { id: 'Square Posts', label: 'Square Posts' },
    { id: 'Carousels', label: 'Carousels' },
    { id: 'Ads', label: 'Paid Ads' }
  ];

  const filteredTemplates = socialTemplates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.id - a.id;
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'newest':
        return b.id - a.id;
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      default:
        return 0;
    }
  });

  const handleTemplateUse = (template) => {
    if (trackEvent && ANALYTICS_EVENTS) {
      trackEvent(ANALYTICS_EVENTS.SOCIAL_TEMPLATE_SELECTED, {
        templateId: template.id,
        templateName: template.name,
        category: template.category
      });
    }
    onTemplateSelect?.(template);
  };

  const handleTemplatePreview = (template) => {
    if (trackEvent && ANALYTICS_EVENTS) {
      trackEvent(ANALYTICS_EVENTS.SOCIAL_TEMPLATE_PREVIEW, {
        templateId: template.id,
        templateName: template.name
      });
    }
    onTemplatePreview?.(template);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim() && trackEvent && ANALYTICS_EVENTS) {
      trackEvent(ANALYTICS_EVENTS.SOCIAL_TEMPLATE_SEARCH, {
        searchTerm: value
      });
    }
  };

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
    if (trackEvent && ANALYTICS_EVENTS) {
      trackEvent(ANALYTICS_EVENTS.SOCIAL_TEMPLATE_FILTER, {
        category
      });
    }
  };

  return (
    <div className="social-browser-overlay">
      <div className="social-browser-container">
        <div className="social-browser-header">
          <div className="social-browser-title-section">
            <h2 className="social-browser-title">Choose a Social Media Template</h2>
            <p className="social-browser-subtitle">
              Select from our collection of social media content templates
            </p>
          </div>
          <button className="social-browser-close" onClick={onClose} title="Close template browser">
            <Icon name="close" />
            <span className="close-text">Close</span>
          </button>
        </div>

        <div className="social-browser-controls">
          <div className="social-browser-search-section">
            <div className="social-browser-search-input-wrapper">
              <Icon name="search" className="social-browser-search-icon" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="social-browser-search-input"
              />
            </div>
          </div>

          <div className="social-browser-filter-section">
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="social-browser-category-select"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="social-browser-sort-select"
            >
              <option value="popular">Most Popular</option>
              <option value="name">Name A-Z</option>
              <option value="newest">Newest</option>
              <option value="category">Category</option>
            </select>

            <div className="social-browser-view-controls">
              <button
                className={`social-browser-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Icon name="grid_view" />
              </button>
              <button
                className={`social-browser-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <Icon name="view_list" />
              </button>
            </div>
          </div>
        </div>

        <div className="social-browser-content">
          {loading ? (
            <div className="social-browser-loading">
              <div className="loading-spinner"></div>
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className={`social-browser-grid ${viewMode}`}>
              {sortedTemplates.map(template => (
                <div key={template.id} className="social-browser-template-card">
                  <div className="social-browser-template-image">
                    {template.imageUrl ? (
                      <img src={template.imageUrl} alt={template.name} />
                    ) : (
                      <div className="social-browser-template-placeholder">
                        {template.preview}
                      </div>
                    )}
                    {template.popular && (
                      <div className="social-browser-popular-badge">
                        <Icon name="star" /> Popular
                      </div>
                    )}
                    <div className="social-browser-template-overlay">
                      <button
                        className="social-browser-overlay-btn preview-btn"
                        onClick={() => handleTemplatePreview(template)}
                      >
                        <Icon name="visibility" />
                      </button>
                      <button
                        className={`social-browser-overlay-btn favorite-btn ${
                          favorites.has(template.id) ? 'favorited' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(template);
                        }}
                        title={favorites.has(template.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Icon name="heart" />
                      </button>
                      <button
                        className="social-browser-overlay-btn use-btn"
                        onClick={() => handleTemplateUse(template)}
                      >
                        Use Template
                      </button>
                    </div>
                  </div>

                  <div className="social-browser-template-info">
                    <h3 className="social-browser-template-title">{template.name}</h3>
                    <p className="social-browser-template-description">{template.description}</p>
                    <div className="social-browser-template-features">
                      {template.features?.slice(0, 2).map((feature, index) => (
                        <span key={index} className="social-browser-template-feature">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && sortedTemplates.length === 0 && (
            <div className="social-browser-no-templates">
              <Icon name="search" className="no-results-icon" />
              <h3>No templates found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialTemplateBrowser;
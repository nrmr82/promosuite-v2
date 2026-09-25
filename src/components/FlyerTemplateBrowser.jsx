import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import favoritesService from '../services/favoritesService';
import templateService from '../services/templateService';
import { getCurrentUser } from '../utils/supabase';
import './FlyerTemplateBrowser.css';

const FlyerTemplateBrowser = ({ 
  templates = [], 
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
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [user, setUser] = useState(null);
  const [realTemplates, setRealTemplates] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load templates, categories, user data and favorites on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // Load templates and categories in parallel
        const [templatesResult, categoriesResult] = await Promise.all([
          templateService.getTemplates({
            limit: 50,
            orderBy: 'usage_count',
            ascending: false
          }),
          templateService.getCategories()
        ]);

        if (templatesResult.success) {
          // Transform templates to match the expected format
          const transformedTemplates = templatesResult.templates.map(template => ({
            id: template.id,
            name: template.name || template.title,
            category: template.template_categories?.name || 'General',
            preview: template.template_categories?.icon || '🏠',
            imageUrl: template.preview_image_url || template.thumbnail_url,
            popular: template.usage_count > 10,
            description: template.description || 'Professional real estate template',
            features: template.tags || []
          }));
          setRealTemplates(transformedTemplates);
        }

        if (categoriesResult.success) {
          // Transform categories to match expected format
          const transformedCategories = [
            { id: 'all', label: 'All Templates' },
            ...categoriesResult.categories.map(cat => ({
              id: cat.name,
              label: cat.name
            }))
          ];
          setCategories(transformedCategories);
        }

        // Load user and favorites
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
        console.error('Error loading data:', error);
        // Fallback to empty arrays but don't fail completely
        setRealTemplates([]);
        setCategories([{ id: 'all', label: 'All Templates' }]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
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
        'flyer_template'
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

  // Use real templates from database, fallback to provided templates, then empty array
  const templatesToUse = realTemplates.length > 0 ? realTemplates : (templates.length > 0 ? templates : []);
  
  // Use dynamic categories from database or fallback
  const categoriesToUse = categories.length > 0 ? categories : [
    { id: 'all', label: 'All Templates' },
    { id: 'Luxury', label: 'Luxury Homes' },
    { id: 'Modern', label: 'Modern Properties' },
    { id: 'Traditional', label: 'Traditional Homes' },
    { id: 'Residential', label: 'Residential' },
    { id: 'Commercial', label: 'Commercial' },
    { id: 'Condos', label: 'Condos & Apartments' },
    { id: 'Waterfront', label: 'Waterfront' },
    { id: 'Rural', label: 'Rural Properties' },
    { id: 'Rentals', label: 'Rental Properties' },
    { id: 'New Builds', label: 'New Construction' }
  ];
  
  const filteredTemplates = templatesToUse.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || (a.name || '').localeCompare(b.name || '');
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'newest':
        // For UUIDs, we can't do numeric comparison, use name as fallback
        return (a.name || '').localeCompare(b.name || '');
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      default:
        return 0;
    }
  });

  const handleTemplateUse = (template) => {
    if (trackEvent && ANALYTICS_EVENTS) {
      trackEvent(ANALYTICS_EVENTS.TEMPLATE_SELECTED, {
        templateId: template.id,
        templateName: template.name,
        category: template.category
      });
    }
    onTemplateSelect?.(template);
  };

  const handleTemplatePreview = (template) => {
    if (trackEvent && ANALYTICS_EVENTS) {
      trackEvent(ANALYTICS_EVENTS.TEMPLATE_PREVIEW, {
        templateId: template.id,
        templateName: template.name
      });
    }
    onTemplatePreview?.(template);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim() && trackEvent && ANALYTICS_EVENTS) {
      trackEvent(ANALYTICS_EVENTS.TEMPLATE_SEARCH, {
        searchTerm: value
      });
    }
  };

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
    if (trackEvent && ANALYTICS_EVENTS) {
      trackEvent(ANALYTICS_EVENTS.TEMPLATE_FILTER, {
        category
      });
    }
  };

  return (
    <div className="flyer-browser-overlay">
      <div className="flyer-browser-container">
        <div className="flyer-browser-header">
          <div className="flyer-browser-title-section">
            <h2 className="flyer-browser-title">Choose a Template</h2>
            <p className="flyer-browser-subtitle">
              Select from our collection of professional real estate flyer templates
            </p>
          </div>
          <button className="flyer-browser-close" onClick={onClose} title="Close template browser">
            <Icon name="close" />
            <span className="close-text">Close</span>
          </button>
        </div>

        <div className="flyer-browser-controls">
          <div className="flyer-browser-search-section">
            <div className="flyer-browser-search-input-wrapper">
              <Icon name="search" className="flyer-browser-search-icon" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flyer-browser-search-input"
              />
            </div>
          </div>

          <div className="flyer-browser-filter-section">
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flyer-browser-category-select"
            >
              {categoriesToUse.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flyer-browser-sort-select"
            >
              <option value="popular">Most Popular</option>
              <option value="name">Name A-Z</option>
              <option value="newest">Newest</option>
              <option value="category">Category</option>
            </select>

            <div className="flyer-browser-view-controls">
              <button
                className={`flyer-browser-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Icon name="grid_view" />
              </button>
              <button
                className={`flyer-browser-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <Icon name="view_list" />
              </button>
            </div>
          </div>
        </div>

        <div className="flyer-browser-content">
          {loading ? (
            <div className="flyer-browser-loading">
              <div className="loading-spinner"></div>
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className={`flyer-browser-grid ${viewMode}`}>
              {sortedTemplates.map(template => (
                <div key={template.id} className="flyer-browser-template-card">
                  <div className="flyer-browser-template-image">
                    {template.imageUrl ? (
                      <img src={template.imageUrl} alt={template.name} />
                    ) : (
                      <div className="flyer-browser-template-placeholder">
                        {template.preview}
                      </div>
                    )}
                    {template.popular && (
                      <div className="flyer-browser-popular-badge">
                        <Icon name="star" /> Popular
                      </div>
                    )}
                    <div className="flyer-browser-template-overlay">
                      <button
                        className="flyer-browser-overlay-btn preview-btn"
                        onClick={() => handleTemplatePreview(template)}
                      >
                        <Icon name="visibility" />
                      </button>
                      <button
                        className={`flyer-browser-overlay-btn favorite-btn ${
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
                        className="flyer-browser-overlay-btn use-btn"
                        onClick={() => handleTemplateUse(template)}
                      >
                        Use Template
                      </button>
                    </div>
                  </div>

                  <div className="flyer-browser-template-info">
                    <h3 className="flyer-browser-template-title">{template.name}</h3>
                    <p className="flyer-browser-template-description">{template.description}</p>
                    <div className="flyer-browser-template-features">
                      {template.features?.slice(0, 2).map((feature, index) => (
                        <span key={index} className="flyer-browser-template-feature">
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
            <div className="flyer-browser-no-templates">
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

export default FlyerTemplateBrowser;
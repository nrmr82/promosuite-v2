import React, { useState } from 'react';
import Icon from './Icon';
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
  const [loading, setLoading] = useState(false);

  const categories = [
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

  const filteredTemplates = templates.filter(template => {
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
          <button className="flyer-browser-close" onClick={onClose}>
            <Icon name="close" />
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
              {categories.map(category => (
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
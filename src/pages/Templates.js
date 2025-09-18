import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import './Templates.css';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');

  // Mock template data
  useEffect(() => {
    // Simulate loading templates
    setTimeout(() => {
      setTemplates([
        {
          id: 1,
          title: 'Luxury Home Listing',
          category: 'luxury',
          thumbnail: '/api/placeholder/300/400',
          isPremium: true,
          rating: 4.8,
          downloads: 1234,
          tags: ['luxury', 'modern', 'residential']
        },
        {
          id: 2,
          title: 'Open House Event',
          category: 'events',
          thumbnail: '/api/placeholder/300/400',
          isPremium: false,
          rating: 4.6,
          downloads: 856,
          tags: ['open house', 'event', 'promotion']
        },
        {
          id: 3,
          title: 'Just Listed - Modern',
          category: 'just-listed',
          thumbnail: '/api/placeholder/300/400',
          isPremium: true,
          rating: 4.9,
          downloads: 2108,
          tags: ['just listed', 'modern', 'clean']
        },
        {
          id: 4,
          title: 'Sold Property Success',
          category: 'sold',
          thumbnail: '/api/placeholder/300/400',
          isPremium: false,
          rating: 4.7,
          downloads: 945,
          tags: ['sold', 'success', 'celebration']
        },
        {
          id: 5,
          title: 'Commercial Property',
          category: 'commercial',
          thumbnail: '/api/placeholder/300/400',
          isPremium: true,
          rating: 4.5,
          downloads: 623,
          tags: ['commercial', 'business', 'investment']
        },
        {
          id: 6,
          title: 'Coming Soon Teaser',
          category: 'coming-soon',
          thumbnail: '/api/placeholder/300/400',
          isPremium: false,
          rating: 4.4,
          downloads: 789,
          tags: ['coming soon', 'teaser', 'anticipation']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'luxury', label: 'Luxury Homes' },
    { id: 'just-listed', label: 'Just Listed' },
    { id: 'sold', label: 'Sold Properties' },
    { id: 'events', label: 'Open Houses' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'coming-soon', label: 'Coming Soon' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleUseTemplate = (template) => {
    console.log('Using template:', template.title);
    // Navigate to editor with template
  };

  const handlePreviewTemplate = (template) => {
    console.log('Previewing template:', template.title);
    // Open preview modal
  };

  return (
    <div className="templates-page">
      <div className="templates-header">
        <div className="templates-title-section">
          <h1 className="templates-title">Templates</h1>
          <p className="templates-subtitle">
            Choose from our collection of professional real estate flyer templates
          </p>
        </div>

        <div className="templates-stats">
          <div className="stat-item">
            <span className="stat-number">{templates.length}</span>
            <span className="stat-label">Templates</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{templates.filter(t => t.isPremium).length}</span>
            <span className="stat-label">Premium</span>
          </div>
        </div>
      </div>

      <div className="templates-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Icon name="search" className="search-icon" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
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
            className="sort-select"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
          </select>

          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Icon name="grid_view" />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <Icon name="view_list" />
            </button>
          </div>
        </div>
      </div>

      <div className="templates-content">
        {loading ? (
          <div className="templates-loading">
            <div className="loading-spinner"></div>
            <p>Loading templates...</p>
          </div>
        ) : (
          <div className={`templates-grid ${viewMode}`}>
            {sortedTemplates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-image">
                  <img src={template.thumbnail} alt={template.title} />
                  {template.isPremium && (
                    <div className="premium-badge">
                      <Icon name="star" /> Premium
                    </div>
                  )}
                  <div className="template-overlay">
                    <button
                      className="overlay-btn preview-btn"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Icon name="visibility" />
                    </button>
                    <button
                      className="overlay-btn use-btn"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </button>
                  </div>
                </div>

                <div className="template-info">
                  <h3 className="template-title">{template.title}</h3>
                  <div className="template-stats">
                    <div className="stat">
                      <Icon name="star" className="star-icon" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="stat">
                      <Icon name="download" className="download-icon" />
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="template-tags">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="template-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sortedTemplates.length === 0 && (
          <div className="no-templates">
            <Icon name="search" className="no-results-icon" />
            <h3>No templates found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;

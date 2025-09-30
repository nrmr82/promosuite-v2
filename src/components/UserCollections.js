import React, { useState, useEffect } from 'react';
import {
  Search, 
  Grid, 
  List, 
  Calendar,
  Edit3,
  Trash2,
  X,
  Sparkles,
  Palette,
  FileText,
  Heart
} from 'lucide-react';
import templateService from '../services/templateService';
import flyerProService from '../services/flyerProService';
import favoritesService from '../services/favoritesService';
import collectionService from '../services/collectionService';
import { getCurrentUser, supabase, TABLES } from '../utils/supabase';
import './UserCollections.css';

const UserCollections = ({ onEditTemplate, onEditFlyer, onClose, mode = 'modal' }) => {
  const [activeTab, setActiveTab] = useState('templates');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // Data states
  const [templates, setTemplates] = useState([]);
  const [flyers, setFlyers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [itemOwnership, setItemOwnership] = useState(new Map()); // Track which items user owns
  
  // Expose refresh function
  const refreshFavorites = async () => {
    if (user) {
      await loadUserFavorites(user.id);
    }
  };

  // Auto-refresh favorites every 5 seconds in dashboard mode
  useEffect(() => {
    if (mode === 'dashboard' && user) {
      const interval = setInterval(() => {
        refreshFavorites();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [mode, user]);

  // Load user and data
  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setError('Please log in to view your collections');
          return;
        }
        setUser(currentUser);
        
        // Load templates, flyers, and favorites
        await Promise.all([
          loadUserTemplates(currentUser.id),
          loadUserFlyers(currentUser.id),
          loadUserFavorites(currentUser.id)
        ]);
      } catch (error) {
        console.error('Error loading collections:', error);
        setError('Failed to load your collections');
      } finally {
        setLoading(false);
      }
    };

    loadUserAndData();
  }, []); // Empty dependency array is intentional - we only want to load once on mount

  // Load user's generated templates
  const loadUserTemplates = async (userId) => {
    try {
      // First, load templates created by the user
      const { data: ownedTemplates, error: ownedError } = await supabase
        .from(TABLES.TEMPLATES)
        .select(`
          *,
          template_categories (
            name,
            slug,
            color
          )
        `)
        .eq('created_by', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (ownedError) throw ownedError;

      // Then, load templates from user's collections
      let collectionTemplates = [];
      try {
        const collectionTemplateIds = await getUserCollectionTemplateIds(userId);
        if (collectionTemplateIds.length > 0) {
          const { data: collectedTemplates, error: collectedError } = await supabase
            .from(TABLES.TEMPLATES)
            .select(`
              *,
              template_categories (
                name,
                slug,
                color
              )
            `)
            .in('id', collectionTemplateIds)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (collectedError) {
            console.warn('Error loading collection templates:', collectedError);
          } else {
            collectionTemplates = collectedTemplates || [];
          }
        }
      } catch (collectionError) {
        console.warn('Error loading collection templates:', collectionError);
      }

      // Combine and deduplicate templates
      const allTemplates = [...(ownedTemplates || []), ...collectionTemplates];
      const uniqueTemplates = allTemplates.filter((template, index, self) => 
        index === self.findIndex(t => t.id === template.id)
      );

      const processedTemplates = uniqueTemplates.map(template => {
        const isOwner = template.created_by === userId;
        
        // Track ownership
        setItemOwnership(prev => new Map(prev.set(`template_${template.id}`, isOwner)));
        
        return {
          ...template,
          type: 'template',
          isAIGenerated: template.template_data?.aiGenerated || false,
          generatedAt: template.template_data?.generatedAt || template.created_at,
          previewData: template.template_data || {},
          isOwner, // Flag to indicate ownership
          inCollection: !isOwner // If not owner, it's in their collection
        };
      });

      setTemplates(processedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Helper function to get template IDs from user's collections
  const getUserCollectionTemplateIds = async (userId) => {
    try {
      // Get user's collections first
      const { data: collections, error: collectionsError } = await supabase
        .from(TABLES.COLLECTIONS)
        .select('id')
        .eq('user_id', userId);

      if (collectionsError) throw collectionsError;
      if (!collections || collections.length === 0) return [];

      const collectionIds = collections.map(c => c.id);

      // Get template IDs from collection items
      const { data: items, error: itemsError } = await supabase
        .from(TABLES.COLLECTION_ITEMS)
        .select('template_id')
        .in('collection_id', collectionIds)
        .not('template_id', 'is', null);

      if (itemsError) throw itemsError;
      return (items || []).map(item => item.template_id);
    } catch (error) {
      console.error('Error loading collection template IDs:', error);
      return [];
    }
  };

  // Load user's generated flyers
  const loadUserFlyers = async (userId) => {
    try {
      const { flyers } = await flyerProService.getUserFlyers({
        orderBy: 'created_at',
        ascending: false
      });

      const processedFlyers = (flyers || []).map(flyer => {
        const isOwner = flyer.user_id === userId;
        
        // Track ownership
        setItemOwnership(prev => new Map(prev.set(`flyer_${flyer.id}`, isOwner)));
        
        return {
          ...flyer,
          type: 'flyer',
          isAIGenerated: flyer.flyer_data?.aiGenerated || false,
          generatedAt: flyer.flyer_data?.generatedAt || flyer.created_at,
          previewData: flyer.flyer_data || {},
          isOwner // All flyers are owned by the user (from getUserFlyers)
        };
      });

      setFlyers(processedFlyers);
    } catch (error) {
      console.error('Error loading flyers:', error);
    }
  };

  // Load user's favorite templates
  const loadUserFavorites = async (userId) => {
    try {
      console.log('Loading user favorites...');
      const { data, success } = await favoritesService.getUserFavorites(userId);
      
      if (!success || !data) {
        console.warn('No favorites data received');
        setFavorites([]);
        return;
      }
      
      console.log('Favorites data received:', data);
      
      // Get the actual template data for favorited templates
      const templateIds = data.map(fav => fav.template_id).filter(Boolean);
      
      if (templateIds.length === 0) {
        setFavorites([]);
        return;
      }
      
      const { data: favoriteTemplates, error: templatesError } = await supabase
        .from(TABLES.TEMPLATES)
        .select(`
          *,
          template_categories (
            name,
            slug,
            color
          )
        `)
        .in('id', templateIds)
        .eq('is_active', true);
        
      if (templatesError) {
        console.error('Error loading favorite templates:', templatesError);
        setFavorites([]);
        return;
      }
      
      const processedFavorites = (favoriteTemplates || []).map(template => ({
        ...template,
        type: 'favorite',
        isAIGenerated: template.template_data?.aiGenerated || false,
        generatedAt: template.created_at,
        previewData: template.template_data || {},
        is_favorite: true,
        isOwner: template.created_by === userId
      }));

      console.log('Processed favorites:', processedFavorites);
      setFavorites(processedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  // Handle item actions
  const handleEdit = (item) => {
    if (item.type === 'template' && onEditTemplate) {
      onEditTemplate(item);
    } else if (item.type === 'flyer' && onEditFlyer) {
      onEditFlyer(item);
    }
  };

  const handleDelete = async (item) => {
    console.log('🗑️ Delete clicked for:', {
      id: item.id,
      type: item.type,
      activeTab,
      isOwner: item.isOwner,
      ownership: itemOwnership.get(`${item.type}_${item.id}`)
    });

    let actionType, actionVerb, willDeletePermanently;

    if (activeTab === 'favorites') {
      // We're in the favorites tab - this is always "remove from favorites"
      actionType = 'remove from your favorites';
      actionVerb = 'Remove';
      willDeletePermanently = false;
    } else {
      // We're in templates or flyers tab - check ownership
      const isOwner = itemOwnership.get(`${item.type}_${item.id}`) || item.isOwner;
      actionType = isOwner ? 'permanently delete' : 'remove from your collection';
      actionVerb = isOwner ? 'Delete' : 'Remove';
      willDeletePermanently = isOwner;
    }
    
    if (!window.confirm(
      `Are you sure you want to ${actionType} this ${item.type}?\n\n` +
      (willDeletePermanently
        ? 'This will permanently delete the item from the database.' 
        : 'This will only remove it from your collection/favorites. The item will still be available in the template browser.'
      )
    )) {
      return;
    }

    try {
      if (activeTab === 'favorites') {
        // Remove from favorites (template_likes table)
        console.log('🔥 Removing from favorites:', item.id);
        const result = await favoritesService.removeFromFavorites(user.id, item.id);
        console.log('🔥 Favorites remove result:', result);
        
        if (result.success) {
          // Reload favorites to reflect changes
          await loadUserFavorites(user.id);
          alert(`${item.name || item.title} removed from favorites!`);
        } else {
          throw new Error(result.error || 'Failed to remove from favorites');
        }
      } else if (willDeletePermanently) {
        // Permanent deletion - user owns this item
        console.log('💀 Permanently deleting owned item:', item.id);
        if (item.type === 'template') {
          await supabase
            .from(TABLES.TEMPLATES)
            .delete()
            .eq('id', item.id)
            .eq('created_by', user.id);
        } else if (item.type === 'flyer') {
          await flyerProService.deleteFlyer(item.id);
        }
        alert(`${item.name || item.title} permanently deleted!`);
        
        // Update UI immediately
        if (item.type === 'template') {
          setTemplates(prev => prev.filter(t => t.id !== item.id));
        } else if (item.type === 'flyer') {
          setFlyers(prev => prev.filter(f => f.id !== item.id));
        }
      } else {
        // Remove from collection - user doesn't own this item
        console.log('📂 Removing from collection:', item.id);
        const result = await collectionService.removeFromCollection(item.id, item.type);
        console.log('📂 Collection remove result:', result);
        
        if (result.success) {
          alert(`${item.name || item.title} removed from your collection!`);
          // Reload the templates/flyers to reflect changes
          if (item.type === 'template') {
            await loadUserTemplates(user.id);
          } else if (item.type === 'flyer') {
            await loadUserFlyers(user.id);
          }
        } else {
          throw new Error('Failed to remove from collection');
        }
      }
      
    } catch (error) {
      console.error(`❌ Error ${willDeletePermanently ? 'deleting' : 'removing'} item:`, error);
      alert(`Failed to ${actionVerb.toLowerCase()} ${item.name || item.title}: ${error.message || error}`);
    }
  };

  const handleToggleFavorite = async (item) => {
    try {
      if (item.type === 'template') {
        await templateService.toggleFavorite(user.id, item.id);
        // Reload templates to reflect changes
        await loadUserTemplates(user.id);
      } else if (item.type === 'flyer') {
        await flyerProService.toggleFavorite(item.id);
        // Reload flyers to reflect changes  
        await loadUserFlyers(user.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Filter and sort items
  const getFilteredItems = () => {
    const items = activeTab === 'templates' ? templates : 
                  activeTab === 'flyers' ? flyers : favorites;
    
    let filtered = items.filter(item => {
      if (searchTerm && !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (filterBy === 'ai' && !item.isAIGenerated) return false;
      if (filterBy === 'manual' && item.isAIGenerated) return false;
      if (filterBy === 'favorites' && !item.is_favorite) return false;
      
      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.generatedAt || b.created_at) - new Date(a.generatedAt || a.created_at);
        case 'oldest':
          return new Date(a.generatedAt || a.created_at) - new Date(b.generatedAt || b.created_at);
        case 'name':
          return (a.name || a.title || '').localeCompare(b.name || b.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Render item card
  const renderItemCard = (item) => {
    const isTemplate = item.type === 'template';
    const title = item.name || item.title || 'Untitled';
    const description = item.description || 'No description';
    const createdAt = new Date(item.generatedAt || item.created_at).toLocaleDateString();
    const isOwner = itemOwnership.get(`${item.type}_${item.id}`) || item.isOwner;

    return (
      <div key={`${item.type}-${item.id}`} className="collection-item-card">
        <div className="item-preview">
          <div className="preview-placeholder">
            {isTemplate ? (
              <Palette size={24} className="preview-icon" />
            ) : (
              <FileText size={24} className="preview-icon" />
            )}
            {item.isAIGenerated && (
              <div className="ai-badge">
                <Sparkles size={12} />
                AI
              </div>
            )}
            {/* Ownership indicator */}
            {!isOwner && (
              <div className="collection-badge" title="In your collection">
                <Heart size={10} />
                Collection
              </div>
            )}
            {item.thumbnail_url && (
              <img 
                src={item.thumbnail_url} 
                alt={title}
                className="preview-image"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>
          
          <div className="item-actions">
            <button 
              className="action-btn"
              onClick={() => handleEdit(item)}
              title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button 
              className="action-btn"
              onClick={() => handleToggleFavorite(item)}
              title={item.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={14} className={item.is_favorite ? 'favorited' : ''} />
            </button>
            <button 
              className={`action-btn ${isOwner ? 'delete' : 'remove'}`}
              onClick={() => handleDelete(item)}
              title={isOwner ? "Delete permanently" : "Remove from collection"}
            >
              {isOwner ? <Trash2 size={14} /> : <X size={14} />}
            </button>
          </div>
        </div>

        <div className="item-info">
          <h4 className="item-title">{title}</h4>
          <p className="item-description">{description}</p>
          <div className="item-meta">
            <span className="meta-date">
              <Calendar size={12} />
              {createdAt}
            </span>
            <span className={`meta-type ${item.isAIGenerated ? 'ai' : 'manual'}`}>
              {item.isAIGenerated ? 'AI Generated' : 'Manual'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render list view
  const renderItemList = (item) => {
    const isTemplate = item.type === 'template';
    const title = item.name || item.title || 'Untitled';
    const createdAt = new Date(item.generatedAt || item.created_at).toLocaleDateString();
    const isOwner = itemOwnership.get(`${item.type}_${item.id}`) || item.isOwner;

    return (
      <div key={`${item.type}-${item.id}`} className="collection-item-row">
        <div className="row-preview">
          {isTemplate ? (
            <Palette size={16} className="row-icon" />
          ) : (
            <FileText size={16} className="row-icon" />
          )}
        </div>
        
        <div className="row-info">
          <div className="row-title">
            {title}
            {item.isAIGenerated && (
              <span className="ai-badge-small">
                <Sparkles size={10} />
                AI
              </span>
            )}
            {!isOwner && (
              <span className="collection-badge-small" title="In your collection">
                <Heart size={8} />
                Collection
              </span>
            )}
          </div>
          <div className="row-description">{item.description || 'No description'}</div>
        </div>
        
        <div className="row-meta">
          <span className="row-date">{createdAt}</span>
          <span className={`row-type ${item.isAIGenerated ? 'ai' : 'manual'}`}>
            {item.isAIGenerated ? 'AI' : 'Manual'}
          </span>
        </div>
        
        <div className="row-actions">
          <button className="action-btn" onClick={() => handleEdit(item)}>
            <Edit3 size={14} />
          </button>
          <button 
            className="action-btn"
            onClick={() => handleToggleFavorite(item)}
          >
            <Heart size={14} className={item.is_favorite ? 'favorited' : ''} />
          </button>
          <button 
            className={`action-btn ${isOwner ? 'delete' : 'remove'}`} 
            onClick={() => handleDelete(item)}
            title={isOwner ? "Delete permanently" : "Remove from collection"}
          >
            {isOwner ? <Trash2 size={14} /> : <X size={14} />}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="collections-container">
        <div className="collections-loading">
          <div className="loading-spinner"></div>
          <p>Loading your collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="collections-container">
        <div className="collections-error">
          <h3>Error Loading Collections</h3>
          <p>{error}</p>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const totalTemplates = templates.length;
  const totalFlyers = flyers.length;
  const totalFavorites = favorites.length;
  const aiTemplates = templates.filter(t => t.isAIGenerated).length;
  const aiFlyers = flyers.filter(f => f.isAIGenerated).length;

  const isDashboard = mode === 'dashboard';

  return (
    <div className={`collections-container ${isDashboard ? 'dashboard-mode' : ''}`}>
      {!isDashboard && (
        <div className="collections-header">
          <div className="header-left">
            <h2>My Collections</h2>
            <p>Manage your AI-generated and custom templates and flyers</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <Palette size={16} aria-hidden="true" />
              <div>
                <span className="stat-number">{totalTemplates}</span>
                <span className="stat-label">Templates</span>
                <span className="stat-detail">({aiTemplates} AI)</span>
              </div>
            </div>
            <div className="stat-card">
              <FileText size={16} aria-hidden="true" />
              <div>
                <span className="stat-number">{totalFlyers}</span>
                <span className="stat-label">Flyers</span>
                <span className="stat-detail">({aiFlyers} AI)</span>
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      )}

      {/* Show tab controls in dashboard mode as well - this was the issue */}
      <div className="collections-controls">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Palette size={16} />
            Templates ({totalTemplates})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'flyers' ? 'active' : ''}`}
            onClick={() => setActiveTab('flyers')}
          >
            <FileText size={16} />
            Flyers ({totalFlyers})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('favorites');
              // Reload favorites when clicking the tab
              if (user) loadUserFavorites(user.id);
            }}
          >
            <Heart size={16} />
            Favorites ({totalFavorites})
          </button>
          </div>

        {!isDashboard && (
          <div className="controls-right">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Items</option>
                <option value="ai">AI Generated</option>
                <option value="manual">Manual</option>
                <option value="favorites">Favorites</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
            
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid size={16} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="collections-content">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'templates' ? <Palette size={48} /> : <FileText size={48} />}
            </div>
            <h3>No {activeTab} found</h3>
            <p>
              {searchTerm || filterBy !== 'all' 
                ? `No ${activeTab} match your current filters.`
                : `You haven't created any ${activeTab} yet. Start by using our AI generators!`
              }
            </p>
          </div>
        ) : (
          <div className={`collections-grid ${viewMode}`}>
            {viewMode === 'grid' 
              ? filteredItems.map(renderItemCard)
              : filteredItems.map(renderItemList)
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCollections;

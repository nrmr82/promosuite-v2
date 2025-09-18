/**
 * Template Service - Database Integration
 * Handles template loading, filtering, favorites, and categories from Supabase
 */

import { supabase, handleSupabaseError, TABLES } from '../utils/supabase';
// import apiClient from '../utils/api'; // Unused

class TemplateService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all template categories
   */
  async getCategories() {
    try {
      const cacheKey = 'template_categories';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const { data, error } = await supabase
        .from(TABLES.TEMPLATE_CATEGORIES)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      const result = {
        success: true,
        categories: data || []
      };

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Get categories error:', error);
      throw handleSupabaseError(error, 'fetching template categories');
    }
  }

  /**
   * Get templates with filtering and pagination
   */
  async getTemplates(options = {}) {
    try {
      const {
        categoryId = null,
        subcategory = null,
        tags = [],
        searchTerm = '',
        isPremium = null,
        limit = 50,
        offset = 0,
        orderBy = 'usage_count',
        ascending = false
      } = options;

      let query = supabase
        .from(TABLES.TEMPLATES)
        .select(`
          *,
          template_categories (
            name,
            slug,
            color
          )
        `)
        .eq('is_active', true)
        .eq('is_public', true);

      // Apply filters
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }

      if (isPremium !== null) {
        query = query.eq('is_premium', isPremium);
      }

      if (tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`
        );
      }

      // Apply ordering and pagination
      query = query
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        templates: data || [],
        total: count,
        hasMore: (data?.length || 0) === limit
      };
    } catch (error) {
      console.error('Get templates error:', error);
      throw handleSupabaseError(error, 'fetching templates');
    }
  }

  /**
   * Get template by ID with full details
   */
  async getTemplateById(templateId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPLATES)
        .select(`
          *,
          template_categories (
            name,
            slug,
            color
          )
        `)
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return {
        success: true,
        template: data
      };
    } catch (error) {
      console.error('Get template by ID error:', error);
      throw handleSupabaseError(error, 'fetching template details');
    }
  }

  /**
   * Get user's favorite templates
   */
  async getUserFavorites(userId) {
    try {
      if (!userId) return { success: true, favorites: [] };

      const { data, error } = await supabase
        .from('template_likes')
        .select(`
          template_id,
          templates (
            id,
            name,
            preview_image_url,
            category_id,
            template_categories (
              name,
              slug
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return {
        success: true,
        favorites: data?.map(item => ({
          ...item.templates,
          liked_at: item.created_at
        })) || []
      };
    } catch (error) {
      console.error('Get user favorites error:', error);
      throw handleSupabaseError(error, 'fetching favorite templates');
    }
  }

  /**
   * Toggle template favorite
   */
  async toggleFavorite(userId, templateId) {
    try {
      if (!userId) {
        throw new Error('User must be logged in to save favorites');
      }

      // Check if already favorited
      const { data: existing, error: checkError } = await supabase
        .from('template_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        // Remove from favorites
        const { error: deleteError } = await supabase
          .from('template_likes')
          .delete()
          .eq('user_id', userId)
          .eq('template_id', templateId);

        if (deleteError) throw deleteError;

        return {
          success: true,
          action: 'removed',
          isFavorite: false
        };
      } else {
        // Add to favorites
        const { error: insertError } = await supabase
          .from('template_likes')
          .insert({
            user_id: userId,
            template_id: templateId
          });

        if (insertError) throw insertError;

        return {
          success: true,
          action: 'added',
          isFavorite: true
        };
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw handleSupabaseError(error, 'updating favorite template');
    }
  }

  /**
   * Track template usage
   */
  async trackTemplateUsage(templateId, userId = null) {
    try {
      // Increment usage count
      const { error: updateError } = await supabase.rpc('increment_template_usage', {
        template_uuid: templateId
      });

      if (updateError) {
        console.warn('Failed to update template usage count:', updateError);
      }

      // If user is logged in, track usage for subscription limits
      if (userId) {
        const { error: usageError } = await supabase.rpc('increment_usage_counter', {
          user_uuid: userId,
          resource_type: 'template'
        });

        if (usageError) {
          console.warn('Failed to update user usage counter:', usageError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Track template usage error:', error);
      // Don't throw error for tracking failures
      return { success: false };
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit = 12) {
    try {
      return await this.getTemplates({
        limit,
        orderBy: 'usage_count',
        ascending: false
      });
    } catch (error) {
      console.error('Get popular templates error:', error);
      throw error;
    }
  }

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(limit = 8) {
    try {
      return await this.getTemplates({
        limit,
        orderBy: 'likes_count',
        ascending: false
      });
    } catch (error) {
      console.error('Get featured templates error:', error);
      throw error;
    }
  }

  /**
   * Search templates with advanced filtering
   */
  async searchTemplates(searchTerm, filters = {}) {
    try {
      return await this.getTemplates({
        searchTerm,
        ...filters
      });
    } catch (error) {
      console.error('Search templates error:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(templateId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPLATES)
        .select('usage_count, likes_count, created_at')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      return {
        success: true,
        stats: data
      };
    } catch (error) {
      console.error('Get template stats error:', error);
      throw handleSupabaseError(error, 'fetching template statistics');
    }
  }

  /**
   * Check if user can use template (subscription limits)
   */
  async canUserUseTemplate(userId, templateId) {
    try {
      if (!userId) return { canUse: true, reason: null };

      // Get template details
      const { template } = await this.getTemplateById(templateId);
      
      // Check subscription limits
      const { data: canUse, error } = await supabase.rpc('check_user_limits', {
        user_uuid: userId,
        resource_type: 'flyer'
      });

      if (error) {
        console.warn('Failed to check user limits:', error);
        return { canUse: true, reason: null };
      }

      if (!canUse) {
        return {
          canUse: false,
          reason: 'subscription_limit',
          message: 'You have reached your subscription limit for this month.'
        };
      }

      // Check if template is premium and user has access
      if (template.is_premium) {
        // TODO: Check if user has premium subscription
        // For now, allow all templates
        return { canUse: true, reason: null };
      }

      return { canUse: true, reason: null };
    } catch (error) {
      console.error('Check template access error:', error);
      // Default to allowing access if check fails
      return { canUse: true, reason: null };
    }
  }
}

// Create singleton instance
const templateService = new TemplateService();

export default templateService;

// Named exports for specific functions
export {
  templateService as TemplateService
};

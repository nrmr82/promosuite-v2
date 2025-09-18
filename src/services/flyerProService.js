/**
 * PromoSuite V2 - FlyerPro Supabase Service
 * Handles flyer templates, creation, and management using Supabase
 */

import { supabase, handleSupabaseError, getCurrentUser, TABLES, BUCKETS, uploadFile, getPublicUrl, deleteFile } from '../utils/supabase';

class FlyerProService {
  /**
   * Get all template categories
   */
  async getTemplateCategories() {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPLATE_CATEGORIES)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return { success: true, categories: data };
    } catch (error) {
      console.error('Get template categories error:', error);
      throw handleSupabaseError(error, 'getting template categories');
    }
  }

  /**
   * Get templates with optional filtering
   */
  async getTemplates(options = {}) {
    try {
      let query = supabase
        .from(TABLES.TEMPLATES)
        .select(`
          *,
          category:template_categories(*)
        `)
        .eq('is_active', true);

      // Apply filters
      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options.isPremium !== undefined) {
        query = query.eq('is_premium', options.isPremium);
      }

      if (options.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags);
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Apply ordering
      const orderBy = options.orderBy || 'created_at';
      const ascending = options.ascending !== false;
      query = query.order(orderBy, { ascending });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { success: true, templates: data, count };
    } catch (error) {
      console.error('Get templates error:', error);
      throw handleSupabaseError(error, 'getting templates');
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPLATES)
        .select(`
          *,
          category:template_categories(*)
        `)
        .eq('id', templateId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;

      // Increment usage count
      await this.incrementTemplateUsage(templateId);

      return { success: true, template: data };
    } catch (error) {
      console.error('Get template by ID error:', error);
      throw handleSupabaseError(error, 'getting template');
    }
  }

  /**
   * Increment template usage count
   */
  async incrementTemplateUsage(templateId) {
    try {
      await supabase.rpc('increment_template_usage', {
        template_id: templateId
      });
    } catch (error) {
      // Don't throw error for usage count - it's not critical
      console.warn('Failed to increment template usage:', error);
    }
  }

  /**
   * Get user's flyers
   */
  async getUserFlyers(options = {}) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from(TABLES.FLYERS)
        .select(`
          *,
          template:templates(id, title, thumbnail_url)
        `)
        .eq('user_id', currentUser.id);

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.isFavorite !== undefined) {
        query = query.eq('is_favorite', options.isFavorite);
      }

      if (options.templateId) {
        query = query.eq('template_id', options.templateId);
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Apply ordering
      const orderBy = options.orderBy || 'updated_at';
      const ascending = options.ascending === true;
      query = query.order(orderBy, { ascending });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { success: true, flyers: data, count };
    } catch (error) {
      console.error('Get user flyers error:', error);
      throw handleSupabaseError(error, 'getting user flyers');
    }
  }

  /**
   * Create new flyer
   */
  async createFlyer(flyerData) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const flyerRecord = {
        user_id: currentUser.id,
        template_id: flyerData.templateId,
        title: flyerData.title || 'Untitled Flyer',
        description: flyerData.description || '',
        flyer_data: flyerData.flyerData || {},
        thumbnail_url: flyerData.thumbnailUrl,
        status: flyerData.status || 'draft',
        metadata: flyerData.metadata || {}
      };

      const { data, error } = await supabase
        .from(TABLES.FLYERS)
        .insert(flyerRecord)
        .select(`
          *,
          template:templates(id, title, thumbnail_url)
        `)
        .single();

      if (error) throw error;

      // Log user activity
      await this.logUserActivity('create_flyer', 'flyer', data.id);

      return { success: true, flyer: data };
    } catch (error) {
      console.error('Create flyer error:', error);
      throw handleSupabaseError(error, 'creating flyer');
    }
  }

  /**
   * Update existing flyer
   */
  async updateFlyer(flyerId, updates) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(TABLES.FLYERS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', flyerId)
        .eq('user_id', currentUser.id)
        .select(`
          *,
          template:templates(id, title, thumbnail_url)
        `)
        .single();

      if (error) throw error;

      // Log user activity
      await this.logUserActivity('update_flyer', 'flyer', flyerId);

      return { success: true, flyer: data };
    } catch (error) {
      console.error('Update flyer error:', error);
      throw handleSupabaseError(error, 'updating flyer');
    }
  }

  /**
   * Delete flyer
   */
  async deleteFlyer(flyerId) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get flyer data to clean up associated files
      const { data: flyer, error: fetchError } = await supabase
        .from(TABLES.FLYERS)
        .select('*')
        .eq('id', flyerId)
        .eq('user_id', currentUser.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete associated files from storage
      if (flyer.thumbnail_url) {
        try {
          const fileName = flyer.thumbnail_url.split('/').pop();
          await deleteFile(BUCKETS.FLYERS, `${currentUser.id}/thumbnails/${fileName}`);
        } catch (storageError) {
          console.warn('Failed to delete thumbnail:', storageError);
        }
      }

      if (flyer.export_urls) {
        // Delete exported files
        Object.values(flyer.export_urls).forEach(async (url) => {
          try {
            if (typeof url === 'string') {
              const fileName = url.split('/').pop();
              await deleteFile(BUCKETS.FLYERS, `${currentUser.id}/exports/${fileName}`);
            }
          } catch (storageError) {
            console.warn('Failed to delete export file:', storageError);
          }
        });
      }

      // Delete flyer record
      const { error: deleteError } = await supabase
        .from(TABLES.FLYERS)
        .delete()
        .eq('id', flyerId)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;

      // Log user activity
      await this.logUserActivity('delete_flyer', 'flyer', flyerId);

      return { success: true };
    } catch (error) {
      console.error('Delete flyer error:', error);
      throw handleSupabaseError(error, 'deleting flyer');
    }
  }

  /**
   * Duplicate flyer
   */
  async duplicateFlyer(flyerId) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get original flyer
      const { data: originalFlyer, error: fetchError } = await supabase
        .from(TABLES.FLYERS)
        .select('*')
        .eq('id', flyerId)
        .eq('user_id', currentUser.id)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const duplicateData = {
        user_id: currentUser.id,
        template_id: originalFlyer.template_id,
        title: `${originalFlyer.title} (Copy)`,
        description: originalFlyer.description,
        flyer_data: originalFlyer.flyer_data,
        status: 'draft',
        metadata: {
          ...originalFlyer.metadata,
          duplicated_from: flyerId
        }
      };

      const { data, error } = await supabase
        .from(TABLES.FLYERS)
        .insert(duplicateData)
        .select(`
          *,
          template:templates(id, title, thumbnail_url)
        `)
        .single();

      if (error) throw error;

      // Log user activity
      await this.logUserActivity('duplicate_flyer', 'flyer', data.id);

      return { success: true, flyer: data };
    } catch (error) {
      console.error('Duplicate flyer error:', error);
      throw handleSupabaseError(error, 'duplicating flyer');
    }
  }

  /**
   * Upload flyer thumbnail
   */
  async uploadThumbnail(flyerId, thumbnailFile) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Generate unique filename
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${flyerId}_${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/thumbnails/${fileName}`;

      // Upload to Supabase Storage
      /* const uploadResult = */ await uploadFile(BUCKETS.FLYERS, filePath, thumbnailFile); // Unused variable
      const publicUrl = getPublicUrl(BUCKETS.FLYERS, filePath);

      // Update flyer record with thumbnail URL
      const { data, error } = await supabase
        .from(TABLES.FLYERS)
        .update({ thumbnail_url: publicUrl })
        .eq('id', flyerId)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        thumbnailUrl: publicUrl,
        flyer: data
      };
    } catch (error) {
      console.error('Upload thumbnail error:', error);
      throw handleSupabaseError(error, 'uploading thumbnail');
    }
  }

  /**
   * Export flyer to different formats
   */
  async exportFlyer(flyerId, format = 'pdf', options = {}) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get flyer data
      const { data: flyer, error: fetchError } = await supabase
        .from(TABLES.FLYERS)
        .select('*')
        .eq('id', flyerId)
        .eq('user_id', currentUser.id)
        .single();

      if (fetchError) throw fetchError;

      // This would typically call an export service or Edge Function
      // For now, we'll simulate the export process
      // const exportData = {
      //   flyerId,
      //   format,
      //   flyerData: flyer.flyer_data,
      //   options,
      //   timestamp: new Date().toISOString()
      // }; // Unused variable

      // Generate export filename
      const fileName = `${flyer.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${format}`;
      // const filePath = `${currentUser.id}/exports/${fileName}`; // Unused variable

      // Here you would typically:
      // 1. Call a serverless function to generate the export
      // 2. Upload the generated file to storage
      // 3. Return the public URL

      // For demo purposes, we'll just update the export URLs
      const currentExportUrls = flyer.export_urls || {};
      const exportUrl = `https://example.com/exports/${fileName}`; // Placeholder

      const updatedExportUrls = {
        ...currentExportUrls,
        [format]: exportUrl
      };

      // Update flyer with export URL
      const { data, error } = await supabase
        .from(TABLES.FLYERS)
        .update({ export_urls: updatedExportUrls })
        .eq('id', flyerId)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) throw error;

      // Log user activity
      await this.logUserActivity('export_flyer', 'flyer', flyerId, { format });

      return {
        success: true,
        exportUrl,
        format,
        flyer: data
      };
    } catch (error) {
      console.error('Export flyer error:', error);
      throw handleSupabaseError(error, 'exporting flyer');
    }
  }

  /**
   * Toggle flyer favorite status
   */
  async toggleFavorite(flyerId) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get current favorite status
      const { data: flyer, error: fetchError } = await supabase
        .from(TABLES.FLYERS)
        .select('is_favorite')
        .eq('id', flyerId)
        .eq('user_id', currentUser.id)
        .single();

      if (fetchError) throw fetchError;

      // Toggle favorite status
      const { data, error } = await supabase
        .from(TABLES.FLYERS)
        .update({ is_favorite: !flyer.is_favorite })
        .eq('id', flyerId)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        isFavorite: data.is_favorite,
        flyer: data
      };
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw handleSupabaseError(error, 'toggling favorite status');
    }
  }

  /**
   * Log user activity for analytics
   */
  async logUserActivity(action, resourceType, resourceId, metadata = {}) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      await supabase
        .from(TABLES.USER_USAGE)
        .insert({
          user_id: currentUser.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata
        });
    } catch (error) {
      console.warn('Failed to log user activity:', error);
      // Don't throw error - analytics logging is not critical
    }
  }

  /**
   * Get flyer analytics for user
   */
  async getFlyerAnalytics(period = '30d') {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const startDate = new Date();
      const days = parseInt(period.replace('d', ''));
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from(TABLES.USER_USAGE)
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('resource_type', 'flyer')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process analytics data
      const analytics = {
        totalActions: data.length,
        actionsByType: {},
        dailyActivity: {},
        topActions: []
      };

      data.forEach(activity => {
        const action = activity.action;
        const date = activity.created_at.split('T')[0];

        // Count actions by type
        analytics.actionsByType[action] = (analytics.actionsByType[action] || 0) + 1;

        // Daily activity
        analytics.dailyActivity[date] = (analytics.dailyActivity[date] || 0) + 1;
      });

      // Get top actions
      analytics.topActions = Object.entries(analytics.actionsByType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => ({ action, count }));

      return { success: true, analytics, period };
    } catch (error) {
      console.error('Get flyer analytics error:', error);
      throw handleSupabaseError(error, 'getting flyer analytics');
    }
  }
}

// Create singleton instance
const flyerProService = new FlyerProService();

export default flyerProService;

// Also export the class for testing or custom instances
export { FlyerProService };

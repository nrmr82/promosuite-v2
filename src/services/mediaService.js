/**
 * PromoSuite V2 - Media Service with Supabase Storage
 * Handles file uploads, media library, and asset management using Supabase Storage
 */

import { supabase, handleSupabaseError, getCurrentUser, TABLES, BUCKETS, uploadFile, getPublicUrl, deleteFile } from '../utils/supabase';

class MediaService {
  /**
   * Upload media file to Supabase Storage
   */
  async uploadMedia(file, options = {}) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Validate file
      this.validateFile(file, options);

      // Generate unique filename
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${currentUser.id}/${options.folder || 'uploads'}/${fileName}`;

      // Upload to Supabase Storage
      const uploadResult = await uploadFile(BUCKETS.USER_UPLOADS, filePath, file, {
        cacheControl: '3600',
        upsert: false,
        ...options.storageOptions
      });

      const publicUrl = getPublicUrl(BUCKETS.USER_UPLOADS, filePath);

      // Save media record to database
      const mediaRecord = {
        user_id: currentUser.id,
        filename: fileName,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_path: filePath,
        public_url: publicUrl,
        alt_text: options.altText || '',
        tags: options.tags || [],
        metadata: {
          ...options.metadata,
          uploaded_at: new Date().toISOString(),
          file_extension: fileExt,
          folder: options.folder || 'uploads'
        }
      };

      const { data, error } = await supabase
        .from(TABLES.MEDIA)
        .insert(mediaRecord)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        media: data,
        publicUrl
      };
    } catch (error) {
      console.error('Upload media error:', error);
      throw handleSupabaseError(error, 'uploading media');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleMedia(files, options = {}) {
    try {
      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          const result = await this.uploadMedia(file, {
            ...options,
            folder: options.folder || 'batch-uploads'
          });
          results.push(result);
        } catch (error) {
          errors.push({
            file: file.name,
            error: error.message
          });
        }
      }

      return {
        success: results.length > 0,
        results,
        errors,
        uploaded: results.length,
        failed: errors.length
      };
    } catch (error) {
      console.error('Upload multiple media error:', error);
      throw handleSupabaseError(error, 'uploading multiple files');
    }
  }

  /**
   * Get user's media library
   */
  async getUserMedia(options = {}) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from(TABLES.MEDIA)
        .select('*')
        .eq('user_id', currentUser.id);

      // Apply filters
      if (options.mimeType) {
        if (Array.isArray(options.mimeType)) {
          query = query.in('mime_type', options.mimeType);
        } else {
          query = query.eq('mime_type', options.mimeType);
        }
      }

      if (options.folder) {
        query = query.eq('metadata->>folder', options.folder);
      }

      if (options.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags);
      }

      if (options.search) {
        query = query.or(`original_name.ilike.%${options.search}%,alt_text.ilike.%${options.search}%`);
      }

      if (options.minSize) {
        query = query.gte('file_size', options.minSize);
      }

      if (options.maxSize) {
        query = query.lte('file_size', options.maxSize);
      }

      // Apply ordering
      const orderBy = options.orderBy || 'created_at';
      const ascending = options.ascending === true;
      query = query.order(orderBy, { ascending });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { success: true, media: data, count };
    } catch (error) {
      console.error('Get user media error:', error);
      throw handleSupabaseError(error, 'getting user media');
    }
  }

  /**
   * Get media by ID
   */
  async getMediaById(mediaId) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(TABLES.MEDIA)
        .select('*')
        .eq('id', mediaId)
        .eq('user_id', currentUser.id)
        .single();
      
      if (error) throw error;
      return { success: true, media: data };
    } catch (error) {
      console.error('Get media by ID error:', error);
      throw handleSupabaseError(error, 'getting media');
    }
  }

  /**
   * Update media metadata
   */
  async updateMedia(mediaId, updates) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(TABLES.MEDIA)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', mediaId)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, media: data };
    } catch (error) {
      console.error('Update media error:', error);
      throw handleSupabaseError(error, 'updating media');
    }
  }

  /**
   * Delete media file and record
   */
  async deleteMedia(mediaId) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get media record to get file path
      const { data: media, error: fetchError } = await supabase
        .from(TABLES.MEDIA)
        .select('*')
        .eq('id', mediaId)
        .eq('user_id', currentUser.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete file from storage
      try {
        await deleteFile(BUCKETS.USER_UPLOADS, media.file_path);
      } catch (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete record from database
      const { error: deleteError } = await supabase
        .from(TABLES.MEDIA)
        .delete()
        .eq('id', mediaId)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Delete media error:', error);
      throw handleSupabaseError(error, 'deleting media');
    }
  }

  /**
   * Delete multiple media files
   */
  async deleteMultipleMedia(mediaIds) {
    try {
      const results = [];
      const errors = [];

      for (const mediaId of mediaIds) {
        try {
          await this.deleteMedia(mediaId);
          results.push({ id: mediaId, success: true });
        } catch (error) {
          errors.push({
            id: mediaId,
            error: error.message
          });
        }
      }

      return {
        success: results.length > 0,
        results,
        errors,
        deleted: results.length,
        failed: errors.length
      };
    } catch (error) {
      console.error('Delete multiple media error:', error);
      throw handleSupabaseError(error, 'deleting multiple media files');
    }
  }

  /**
   * Get media usage statistics
   */
  async getMediaStats() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get total count and size
      const { data, error } = await supabase
        .from(TABLES.MEDIA)
        .select('file_size, mime_type, created_at')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      const stats = {
        totalFiles: data.length,
        totalSize: data.reduce((sum, item) => sum + (item.file_size || 0), 0),
        fileTypes: {},
        uploadsByMonth: {}
      };

      // Analyze data
      data.forEach(item => {
        // File types
        const type = item.mime_type?.split('/')[0] || 'unknown';
        stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;

        // Uploads by month
        if (item.created_at) {
          const month = item.created_at.substring(0, 7); // YYYY-MM
          stats.uploadsByMonth[month] = (stats.uploadsByMonth[month] || 0) + 1;
        }
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Get media stats error:', error);
      throw handleSupabaseError(error, 'getting media statistics');
    }
  }

  /**
   * Search media files
   */
  async searchMedia(searchTerm, options = {}) {
    try {
      const searchOptions = {
        ...options,
        search: searchTerm,
        limit: options.limit || 20
      };

      return await this.getUserMedia(searchOptions);
    } catch (error) {
      console.error('Search media error:', error);
      throw error;
    }
  }

  /**
   * Get media by tag
   */
  async getMediaByTag(tag, options = {}) {
    try {
      const tagOptions = {
        ...options,
        tags: [tag],
        limit: options.limit || 20
      };

      return await this.getUserMedia(tagOptions);
    } catch (error) {
      console.error('Get media by tag error:', error);
      throw error;
    }
  }

  /**
   * Get recent media uploads
   */
  async getRecentMedia(limit = 10) {
    try {
      return await this.getUserMedia({
        limit,
        orderBy: 'created_at',
        ascending: false
      });
    } catch (error) {
      console.error('Get recent media error:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file, options = {}) {
    const maxSize = options.maxSize || (10 * 1024 * 1024); // 10MB default
    const allowedTypes = options.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'audio/mpeg'
    ];

    if (file.size > maxSize) {
      throw new Error(`File size ${this.formatFileSize(file.size)} exceeds maximum allowed size ${this.formatFileSize(maxSize)}`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type category
   */
  getFileTypeCategory(mimeType) {
    if (!mimeType) return 'unknown';
    
    const type = mimeType.split('/')[0];
    const categories = {
      'image': 'image',
      'video': 'video', 
      'audio': 'audio',
      'application': mimeType === 'application/pdf' ? 'document' : 'file',
      'text': 'document'
    };
    
    return categories[type] || 'file';
  }

  /**
   * Generate thumbnail for image files (placeholder - would use image processing service)
   */
  async generateThumbnail(mediaId, options = {}) {
    try {
      // This would typically call an image processing service
      // For now, just return a placeholder response
      return {
        success: true,
        thumbnailUrl: 'placeholder-thumbnail-url',
        message: 'Thumbnail generation would be implemented with image processing service'
      };
    } catch (error) {
      console.error('Generate thumbnail error:', error);
      throw handleSupabaseError(error, 'generating thumbnail');
    }
  }

  /**
   * Create media folder/collection
   */
  async createFolder(folderName) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // For now, folders are just metadata tags
      // In a more complex system, you might have a separate folders table
      return {
        success: true,
        folder: {
          name: folderName,
          created_at: new Date().toISOString(),
          user_id: currentUser.id
        }
      };
    } catch (error) {
      console.error('Create folder error:', error);
      throw handleSupabaseError(error, 'creating folder');
    }
  }
}

// Create singleton instance
const mediaService = new MediaService();

export default mediaService;

// Also export the class for testing or custom instances
export { MediaService };

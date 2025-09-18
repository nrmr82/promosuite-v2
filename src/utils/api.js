/**
 * PromoSuite V2 - Supabase-based API Client
 * Centralized API client using Supabase for database operations and file storage
 */

import { supabase, handleSupabaseError, TABLES, BUCKETS, uploadFile, getPublicUrl, deleteFile } from './supabase';

/**
 * Supabase API Client
 * Provides a unified interface for all database operations
 */
class SupabaseApiClient {
  constructor() {
    this.client = supabase;
    this.tables = TABLES;
    this.buckets = BUCKETS;
  }

  /**
   * Get current user from Supabase Auth
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Generic database query method
   */
  async query(table) {
    return this.client.from(table);
  }

  /**
   * Get single record by ID
   */
  async getById(table, id) {
    try {
      const { data, error } = await this.client
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error(`Get ${table} by ID error:`, error);
      throw handleSupabaseError(error, `getting ${table}`);
    }
  }

  /**
   * Get multiple records with optional filtering
   */
  async getMany(table, options = {}) {
    try {
      let query = this.client.from(table).select('*');
      
      // Apply filters if provided
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.ascending !== false 
        });
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      return { success: true, data, count };
    } catch (error) {
      console.error(`Get many ${table} error:`, error);
      throw handleSupabaseError(error, `getting ${table} records`);
    }
  }

  /**
   * Create new record
   */
  async create(table, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Create ${table} error:`, error);
      throw handleSupabaseError(error, `creating ${table}`);
    }
  }

  /**
   * Update existing record
   */
  async update(table, id, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Update ${table} error:`, error);
      throw handleSupabaseError(error, `updating ${table}`);
    }
  }

  /**
   * Delete record
   */
  async delete(table, id) {
    try {
      const { error } = await this.client
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Delete ${table} error:`, error);
      throw handleSupabaseError(error, `deleting ${table}`);
    }
  }

  /**
   * Upload file to storage
   */
  async uploadFile(bucket, filePath, file, options = {}) {
    try {
      const result = await uploadFile(bucket, filePath, file, options);
      const publicUrl = getPublicUrl(bucket, filePath);
      
      return {
        success: true,
        data: {
          ...result,
          publicUrl
        }
      };
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket, filePath) {
    try {
      const result = await deleteFile(bucket, filePath);
      return { success: true, data: result };
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  /**
   * Get public URL for file
   */
  getFileUrl(bucket, filePath) {
    return getPublicUrl(bucket, filePath);
  }

  /**
   * Execute raw SQL query (for complex queries)
   */
  async executeQuery(query, params = []) {
    try {
      const { data, error } = await this.client.rpc('execute_query', {
        query,
        params
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Execute query error:', error);
      throw handleSupabaseError(error, 'executing query');
    }
  }

  /**
   * Subscribe to real-time changes
   */
  subscribeToTable(table, callback, filter = {}) {
    return this.client
      .channel(`${table}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        ...filter
      }, callback)
      .subscribe();
  }

  /**
   * Unsubscribe from real-time changes
   */
  unsubscribeFromTable(channel) {
    if (channel) {
      this.client.removeChannel(channel);
    }
  }
}

// Create singleton instance
const apiClient = new SupabaseApiClient();

export default apiClient;

/**
 * Supabase Table and Operation Mappings
 * Maps legacy API endpoints to Supabase operations
 */
export const SUPABASE_OPERATIONS = {
  // Authentication (handled by Supabase Auth)
  AUTH: {
    LOGIN: 'auth.signInWithPassword',
    REGISTER: 'auth.signUp',
    LOGOUT: 'auth.signOut',
    REFRESH_TOKEN: 'auth.refreshSession',
    FORGOT_PASSWORD: 'auth.resetPasswordForEmail',
    RESET_PASSWORD: 'auth.updateUser',
    SOCIAL_AUTH: 'auth.signInWithOAuth',
  },

  // User Management
  USER: {
    PROFILE: { table: TABLES.PROFILES, operation: 'select' },
    UPDATE_PROFILE: { table: TABLES.PROFILES, operation: 'update' },
    USAGE_STATS: { table: TABLES.USER_USAGE, operation: 'select' },
    PREFERENCES: { table: TABLES.PROFILES, operation: 'update', field: 'preferences' },
  },

  // Subscription Management
  SUBSCRIPTION: {
    PLANS: { table: TABLES.SUBSCRIPTION_PLANS, operation: 'select' },
    CURRENT: { table: TABLES.SUBSCRIPTIONS, operation: 'select' },
    CREATE: { table: TABLES.SUBSCRIPTIONS, operation: 'insert' },
    UPDATE: { table: TABLES.SUBSCRIPTIONS, operation: 'update' },
    CANCEL: { table: TABLES.SUBSCRIPTIONS, operation: 'update', field: 'status' },
    HISTORY: { table: TABLES.SUBSCRIPTIONS, operation: 'select' },
  },

  // FlyerPro - Flyer Creation Tool
  FLYERPRO: {
    TEMPLATES: { table: TABLES.TEMPLATES, operation: 'select' },
    TEMPLATE_BY_ID: { table: TABLES.TEMPLATES, operation: 'select' },
    CATEGORIES: { table: TABLES.TEMPLATE_CATEGORIES, operation: 'select' },
    CREATE_FLYER: { table: TABLES.FLYERS, operation: 'insert' },
    SAVE_FLYER: { table: TABLES.FLYERS, operation: 'update' },
    EXPORT_FLYER: { table: TABLES.FLYERS, operation: 'select', storage: BUCKETS.FLYERS },
    USER_FLYERS: { table: TABLES.FLYERS, operation: 'select' },
    DUPLICATE_FLYER: { table: TABLES.FLYERS, operation: 'insert' },
  },

  // SocialSpark - Social Media Tool
  SOCIALSPARK: {
    TEMPLATES: { table: TABLES.TEMPLATES, operation: 'select', filter: 'social' },
    CREATE_POST: { table: TABLES.SOCIAL_POSTS, operation: 'insert' },
    SCHEDULE_POST: { table: TABLES.SOCIAL_POSTS, operation: 'update' },
    USER_POSTS: { table: TABLES.SOCIAL_POSTS, operation: 'select' },
    PLATFORMS: 'external_api', // This would connect to social media APIs
    CONNECT_PLATFORM: 'external_api',
    DISCONNECT_PLATFORM: 'external_api',
  },

  // Media Management
  MEDIA: {
    UPLOAD: { storage: BUCKETS.USER_UPLOADS, operation: 'upload' },
    USER_MEDIA: { table: TABLES.MEDIA, operation: 'select' },
    DELETE_MEDIA: { table: TABLES.MEDIA, operation: 'delete', storage: BUCKETS.USER_UPLOADS },
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: { table: TABLES.ANALYTICS, operation: 'select' },
    USAGE_REPORT: { table: TABLES.USER_USAGE, operation: 'select' },
    PERFORMANCE: { table: TABLES.ANALYTICS, operation: 'select' },
  },
};

/**
 * Supabase Error Types (mapped from PostgreSQL and Supabase errors)
 */
export const SUPABASE_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'PGRST116', // PostgREST not found
  DUPLICATE_KEY: '23505', // PostgreSQL unique violation
  FOREIGN_KEY_VIOLATION: '23503', // PostgreSQL foreign key violation
  RLS_VIOLATION: 'PGRST301', // Row Level Security violation
  JWT_EXPIRED: 'JWT_EXPIRED',
  RATE_LIMIT: '429',
};

/**
 * Helper function to determine error type from Supabase error
 */
export const getSupabaseErrorType = (error) => {
  if (!error) return SUPABASE_ERROR_TYPES.NETWORK_ERROR;
  
  const code = error.code || error.error_description || '';
  const message = error.message || '';
  
  // Authentication errors
  if (code === 'invalid_credentials' || message.includes('Invalid login credentials')) {
    return SUPABASE_ERROR_TYPES.AUTHENTICATION_ERROR;
  }
  
  if (code === 'email_not_confirmed' || message.includes('Email not confirmed')) {
    return SUPABASE_ERROR_TYPES.AUTHENTICATION_ERROR;
  }
  
  if (message.includes('JWT expired')) {
    return SUPABASE_ERROR_TYPES.JWT_EXPIRED;
  }
  
  // Authorization errors
  if (code === 'PGRST301' || message.includes('Row Level Security')) {
    return SUPABASE_ERROR_TYPES.RLS_VIOLATION;
  }
  
  // Validation errors
  if (code === '23505') return SUPABASE_ERROR_TYPES.DUPLICATE_KEY;
  if (code === '23503') return SUPABASE_ERROR_TYPES.FOREIGN_KEY_VIOLATION;
  
  // Not found
  if (code === 'PGRST116') return SUPABASE_ERROR_TYPES.NOT_FOUND;
  
  // Rate limiting
  if (code === '429') return SUPABASE_ERROR_TYPES.RATE_LIMIT;
  
  // Server errors
  if (code.startsWith('5') || code.startsWith('PGRST5')) {
    return SUPABASE_ERROR_TYPES.SERVER_ERROR;
  }
  
  return SUPABASE_ERROR_TYPES.VALIDATION_ERROR;
};

/**
 * Legacy API Error Types (for backward compatibility)
 */
export const API_ERROR_TYPES = SUPABASE_ERROR_TYPES;
export const getErrorType = getSupabaseErrorType;

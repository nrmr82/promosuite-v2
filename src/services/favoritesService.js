import { supabase, TABLES } from '../utils/supabase';

export const favoritesService = {
  // Add a template to user's favorites  
  async addToFavorites(userId, templateId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPLATE_LIKES)
        .insert([
          {
            user_id: userId,
            template_id: templateId
          }
        ])
        .select();

      if (error) {
        console.error('Failed to add to favorites:', error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove a template from user's favorites
  async removeFromFavorites(userId, templateId) {
    try {
      const { error } = await supabase
        .from(TABLES.TEMPLATE_LIKES)
        .delete()
        .match({ 
          user_id: userId, 
          template_id: templateId 
        });

      if (error) {
        console.error('Failed to remove from favorites:', error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if a template is favorited by user
  async isFavorite(userId, templateId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPLATE_LIKES)
        .select('id')
        .match({ 
          user_id: userId, 
          template_id: templateId 
        })
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite status:', error.message);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  // Get all user's favorites
  async getUserFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPLATE_LIKES)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user favorites:', error.message);
        return { success: false, data: [], error: error.message };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error getting user favorites:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Toggle favorite status
  async toggleFavorite(userId, templateId) {
    try {
      const isFav = await this.isFavorite(userId, templateId);
      
      if (isFav) {
        return await this.removeFromFavorites(userId, templateId);
      } else {
        return await this.addToFavorites(userId, templateId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error: error.message };
    }
  }
};

export default favoritesService;
/**
 * Debug helper for testing favorites removal
 * Use in browser console to check favorites functionality
 */

import { supabase, getCurrentUser, TABLES } from './supabase';
import favoritesService from '../services/favoritesService';

export const debugFavoritesRemoval = async (templateId) => {
  console.log('🔍 Debugging favorites removal for template:', templateId);
  
  try {
    // Step 1: Get current user
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }
    console.log('✅ User:', user.email);

    // Step 2: Check if template is currently favorited
    console.log('2. Checking if template is favorited...');
    const isFavorited = await favoritesService.isFavorite(user.id, templateId);
    console.log(`✅ Is favorited: ${isFavorited}`);

    // Step 3: Get all user favorites before removal
    console.log('3. Getting all favorites before removal...');
    const beforeResult = await favoritesService.getUserFavorites(user.id);
    console.log('✅ Favorites before:', beforeResult);

    if (isFavorited) {
      // Step 4: Remove from favorites
      console.log('4. Removing from favorites...');
      const removeResult = await favoritesService.removeFromFavorites(user.id, templateId);
      console.log('✅ Remove result:', removeResult);

      // Step 5: Check favorites after removal
      console.log('5. Getting all favorites after removal...');
      const afterResult = await favoritesService.getUserFavorites(user.id);
      console.log('✅ Favorites after:', afterResult);

      // Step 6: Verify template is no longer favorited
      const isStillFavorited = await favoritesService.isFavorite(user.id, templateId);
      console.log(`✅ Still favorited after removal: ${isStillFavorited}`);

      console.log('🎉 Debug completed successfully!');
      return {
        success: true,
        removed: removeResult.success,
        beforeCount: beforeResult.data?.length || 0,
        afterCount: afterResult.data?.length || 0,
        stillFavorited: isStillFavorited
      };
    } else {
      console.log('⚠️ Template was not favorited, cannot test removal');
      return {
        success: true,
        message: 'Template was not favorited'
      };
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Check raw database state
export const checkFavoritesTable = async () => {
  console.log('🔍 Checking template_likes table directly...');
  
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    // Get all favorites directly from database
    const { data, error } = await supabase
      .from(TABLES.TEMPLATE_LIKES)
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Database error:', error);
      return { success: false, error };
    }

    console.log('✅ Raw favorites from database:', data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Check failed:', error);
    return { success: false, error: error.message };
  }
};

// Export for browser console
window.debugFavoritesRemoval = debugFavoritesRemoval;
window.checkFavoritesTable = checkFavoritesTable;
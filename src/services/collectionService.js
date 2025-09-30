/**
 * Collection Service
 * Handles user collections - different from deleting items from database
 * Collections allow users to organize templates/flyers without owning them
 */

import { supabase, getCurrentUser, handleSupabaseError, TABLES } from '../utils/supabase';

class CollectionService {
  /**
   * Create a new collection
   */
  async createCollection(name, description = '', isPublic = false) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(TABLES.COLLECTIONS)
        .insert({
          user_id: currentUser.id,
          name,
          description,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, collection: data };
    } catch (error) {
      console.error('Create collection error:', error);
      throw handleSupabaseError(error, 'creating collection');
    }
  }

  /**
   * Get user's collections
   */
  async getUserCollections() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(TABLES.COLLECTIONS)
        .select(`
          *,
          collection_items (
            id,
            template_id,
            flyer_id,
            added_at
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, collections: data || [] };
    } catch (error) {
      console.error('Get user collections error:', error);
      throw handleSupabaseError(error, 'getting collections');
    }
  }

  /**
   * Add template to a collection
   */
  async addTemplateToCollection(collectionId, templateId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COLLECTION_ITEMS)
        .insert({
          collection_id: collectionId,
          template_id: templateId
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, item: data };
    } catch (error) {
      console.error('Add template to collection error:', error);
      throw handleSupabaseError(error, 'adding template to collection');
    }
  }

  /**
   * Add flyer to a collection
   */
  async addFlyerToCollection(collectionId, flyerId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COLLECTION_ITEMS)
        .insert({
          collection_id: collectionId,
          flyer_id: flyerId
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, item: data };
    } catch (error) {
      console.error('Add flyer to collection error:', error);
      throw handleSupabaseError(error, 'adding flyer to collection');
    }
  }

  /**
   * Remove item from collection (NOT delete from database)
   */
  async removeFromCollection(itemId, itemType) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // First get all collection IDs owned by the user
      const { data: userCollections, error: collectionsError } = await supabase
        .from(TABLES.COLLECTIONS)
        .select('id')
        .eq('user_id', currentUser.id);

      if (collectionsError) throw collectionsError;

      if (!userCollections || userCollections.length === 0) {
        // User has no collections, nothing to remove
        return { success: true };
      }

      const collectionIds = userCollections.map(c => c.id);

      // Remove from collection_items where the item matches and collection is owned by user
      const { error } = await supabase
        .from(TABLES.COLLECTION_ITEMS)
        .delete()
        .eq(itemType === 'template' ? 'template_id' : 'flyer_id', itemId)
        .in('collection_id', collectionIds);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Remove from collection error:', error);
      throw handleSupabaseError(error, 'removing item from collection');
    }
  }

  /**
   * Check if item is in user's collections
   */
  async isInUserCollections(itemId, itemType) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return false;
      }

      // Check if item is in any of user's collections
      const { data, error } = await supabase
        .from(TABLES.COLLECTION_ITEMS)
        .select(`
          id,
          collections!inner(user_id)
        `)
        .eq(itemType === 'template' ? 'template_id' : 'flyer_id', itemId)
        .eq('collections.user_id', currentUser.id)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Check collection status error:', error);
      return false;
    }
  }

  /**
   * Get items in a specific collection
   */
  async getCollectionItems(collectionId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COLLECTION_ITEMS)
        .select(`
          *,
          templates (*),
          flyers (*)
        `)
        .eq('collection_id', collectionId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return { success: true, items: data || [] };
    } catch (error) {
      console.error('Get collection items error:', error);
      throw handleSupabaseError(error, 'getting collection items');
    }
  }

  /**
   * Delete collection permanently
   */
  async deleteCollection(collectionId) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from(TABLES.COLLECTIONS)
        .delete()
        .eq('id', collectionId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete collection error:', error);
      throw handleSupabaseError(error, 'deleting collection');
    }
  }

  /**
   * Check if user owns a template/flyer (can delete permanently)
   */
  async canDeletePermanently(itemId, itemType) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return false;
      }

      const table = itemType === 'template' ? 'templates' : 'flyers';
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('id', itemId)
        .eq(itemType === 'template' ? 'created_by' : 'user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Check ownership error:', error);
      return false;
    }
  }
}

// Create singleton instance
const collectionService = new CollectionService();
export default collectionService;
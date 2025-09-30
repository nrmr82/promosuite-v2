/**
 * Test utility for collection functionality
 * Use this to verify that the collection system works as expected
 */

import collectionService from '../services/collectionService';
import { supabase, TABLES } from './supabase';

export const testCollectionFunctionality = async () => {
  console.log('🧪 Testing Collection Functionality...');
  
  try {
    // Test 1: Check if user has collections
    console.log('1. Testing getUserCollections...');
    const { collections } = await collectionService.getUserCollections();
    console.log(`✅ Found ${collections.length} collections`);

    // Test 2: Check if we can detect ownership
    console.log('2. Testing ownership detection...');
    
    // Get a sample template
    const { data: templates } = await supabase
      .from(TABLES.TEMPLATES)
      .select('id, name, created_by')
      .limit(1);
      
    if (templates && templates.length > 0) {
      const template = templates[0];
      const canDelete = await collectionService.canDeletePermanently(template.id, 'template');
      console.log(`✅ Template "${template.name}" - Can delete: ${canDelete}`);
    }

    // Test 3: Check if item is in collections
    if (templates && templates.length > 0) {
      const template = templates[0];
      const inCollection = await collectionService.isInUserCollections(template.id, 'template');
      console.log(`✅ Template "${template.name}" - In collections: ${inCollection}`);
    }

    console.log('🎉 Collection functionality test completed successfully!');
    
    return {
      success: true,
      collectionsCount: collections.length,
      message: 'All tests passed'
    };

  } catch (error) {
    console.error('❌ Collection functionality test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Tests failed'
    };
  }
};

// Helper function to simulate collection operations
export const simulateCollectionOperations = async () => {
  console.log('🎭 Simulating collection operations...');
  
  try {
    // 1. Create a test collection
    console.log('Creating test collection...');
    const { collection } = await collectionService.createCollection(
      'Test Collection',
      'A test collection for verification'
    );
    console.log(`✅ Created collection: ${collection.name} (ID: ${collection.id})`);

    // 2. Get all collections
    console.log('Fetching all collections...');
    const { collections } = await collectionService.getUserCollections();
    console.log(`✅ Total collections: ${collections.length}`);

    // 3. Clean up - delete the test collection
    console.log('Cleaning up test collection...');
    await collectionService.deleteCollection(collection.id);
    console.log('✅ Test collection deleted');

    return {
      success: true,
      message: 'Collection operations simulation completed successfully'
    };

  } catch (error) {
    console.error('❌ Collection operations simulation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export a function that can be called from the browser console
window.testCollections = testCollectionFunctionality;
window.simulateCollections = simulateCollectionOperations;
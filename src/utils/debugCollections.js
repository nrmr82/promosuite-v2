/**
 * Debug script to test collection functionality step by step
 * Run this in browser console to debug the "object is not iterable" error
 */

import { supabase, getCurrentUser, TABLES } from './supabase';
import collectionService from '../services/collectionService';

export const debugCollectionError = async () => {
  console.log('🔍 Debugging Collection Functionality...');
  
  try {
    // Step 1: Check if user is authenticated
    console.log('1. Checking authentication...');
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ User not authenticated');
      return false;
    }
    console.log('✅ User authenticated:', user.email);

    // Step 2: Check if collections table exists and has data
    console.log('2. Checking collections table...');
    const { data: collections, error: collectionsError } = await supabase
      .from(TABLES.COLLECTIONS)
      .select('*')
      .eq('user_id', user.id);
    
    if (collectionsError) {
      console.error('❌ Collections error:', collectionsError);
    } else {
      console.log(`✅ Collections found: ${collections?.length || 0}`, collections);
    }

    // Step 3: Check if collection_items table exists
    console.log('3. Checking collection_items table...');
    const { data: items, error: itemsError } = await supabase
      .from(TABLES.COLLECTION_ITEMS)
      .select('*')
      .limit(1);
    
    if (itemsError) {
      console.error('❌ Collection items error:', itemsError);
    } else {
      console.log('✅ Collection items table accessible:', items?.length || 0);
    }

    // Step 4: Test removeFromCollection with a fake ID
    console.log('4. Testing removeFromCollection...');
    try {
      const result = await collectionService.removeFromCollection('fake-id', 'template');
      console.log('✅ removeFromCollection worked:', result);
    } catch (removeError) {
      console.error('❌ removeFromCollection error:', removeError);
    }

    // Step 5: Check getUserCollections
    console.log('5. Testing getUserCollections...');
    try {
      const collectionsResult = await collectionService.getUserCollections();
      console.log('✅ getUserCollections worked:', collectionsResult);
    } catch (userCollectionError) {
      console.error('❌ getUserCollections error:', userCollectionError);
    }

    return true;

  } catch (error) {
    console.error('❌ Debug failed:', error);
    return false;
  }
};

// Test specific table access
export const testTableAccess = async () => {
  console.log('🔍 Testing table access...');
  
  const tables = [
    TABLES.COLLECTIONS,
    TABLES.COLLECTION_ITEMS,
    TABLES.TEMPLATES,
    TABLES.USER_FAVORITES
  ];

  for (const table of tables) {
    try {
      console.log(`Testing ${table}...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table}:`, error.message);
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    } catch (err) {
      console.error(`❌ ${table}:`, err.message);
    }
  }
};

// Export for browser console
window.debugCollectionError = debugCollectionError;
window.testTableAccess = testTableAccess;
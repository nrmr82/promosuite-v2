# Temporary Fixes and Dummy Code Documentation

## ⚠️ WARNING: This file documents ALL temporary/dummy code that needs proper fixes

### 1. **DUMMY TEMPLATE DATA** (Critical Issue)

**Files:**
- `src/components/FlyerTemplateBrowser.js` (lines 16-96)
- `src/components/SocialTemplateBrowser.js` (lines 92-213)

**Problem:** 
- Template browsers use hardcoded dummy templates with fake UUIDs
- These are NOT real templates from the database
- IDs like `'550e8400-e29b-41d4-a716-446655440001'` are completely fake

**Current Status:**
- Changed from integer IDs (1,2,3) to fake UUID format to fix database errors
- Database expects UUID format but these are still dummy data

**Proper Fix Needed:**
- Load real templates from Supabase `templates` table
- Remove all dummy template arrays
- Implement proper template loading with real UUIDs from database

---

### 2. **ALERT-BASED DEBUGGING** (Remove Before Production)

**Files:**
- `src/components/FlyerTemplateBrowser.js` (line 369)
- `src/components/SocialTemplateBrowser.js` (line 395)

**Temporary Code:**
```javascript
onClick={(e) => {
  e.stopPropagation();
  alert('Heart button clicked! Check console.'); // ← REMOVE THIS
  handleToggleFavorite(template);
}}
```

**Purpose:** Added to debug heart button clicks
**Remove:** All `alert()` calls added for debugging

---

### 3. **EXCESSIVE CONSOLE LOGGING** (Cleanup Required)

**Files:**
- `src/components/FlyerTemplateBrowser.js` (lines 127, 135, 142, 149, 156, 159, 164)
- `src/services/favoritesService.js` (multiple console.log statements)

**Temporary Debug Logs:**
```javascript
console.log('🔵 Heart button clicked!', ...);
console.log('🔵 Calling favoritesService.toggleFavorite...');
console.log('🔵 toggleFavorite result:', ...);
```

**Purpose:** Added to debug favorites functionality
**Proper Fix:** Remove excessive logging, keep only essential error logs

---

### 4. **MOCK DATA FALLBACKS** (Band-aid Solution)

**File:** `src/services/favoritesService.js`

**Problem:** Service returns fake success data when database fails:
```javascript
return {
  success: true, 
  data: {
    id: Date.now(), // ← Fake timestamp ID
    user_id: userId,
    template_id: templateId,
    template_type: templateType,
    created_at: new Date().toISOString(),
    isMockData: true  // ← Flag indicating fake data
  }
};
```

**Purpose:** Provides fallback when database operations fail
**Proper Fix:** Fix database schema/permissions instead of using mock data

---

### 5. **AUTO-REFRESH WORKAROUND** (Performance Issue)

**File:** `src/components/UserCollections.js` (lines 30-38)

**Temporary Code:**
```javascript
// Auto-refresh favorites every 5 seconds in dashboard mode
useEffect(() => {
  if (mode === 'dashboard' && user) {
    const interval = setInterval(() => {
      refreshFavorites();
    }, 5000); // ← Inefficient polling
    
    return () => clearInterval(interval);
  }
}, [mode, user]);
```

**Purpose:** Forces favorites to reload because real-time updates aren't working
**Proper Fix:** 
- Use Supabase real-time subscriptions
- Fix data flow so favorites update immediately
- Remove polling interval

---

### 6. **HARDCODED DIMENSIONS** (May Need Responsive Updates)

**File:** `src/components/Dashboard.css` (lines 1022-1024)

**Current Fix:**
```css
.social-dashboard-mini {
  padding: clamp(0.75rem, 1.5vw, 1.25rem);
  width: clamp(130px, 20vw, 190px);
  height: clamp(180px, 28vw, 260px);
}
```

**Status:** Fixed to match FlyerPro dimensions, but may need fine-tuning

---

### 7. **DATABASE SCHEMA ASSUMPTIONS**

**Issue:** Code assumes `user_favorites` table structure:
```sql
CREATE TABLE user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    template_id UUID NOT NULL,
    template_type TEXT DEFAULT 'template',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status:** Table should exist (user ran migration)
**Risk:** If table structure changes, favorites service will break

---

## 🔧 PRIORITY FIXES NEEDED:

### HIGH PRIORITY:
1. **Replace dummy templates with real database queries**
2. **Remove all debugging alerts and excessive console logs**
3. **Fix database permissions (400 errors in console)**

### MEDIUM PRIORITY:
1. **Replace auto-refresh polling with real-time subscriptions**
2. **Remove mock data fallbacks once database is stable**

### LOW PRIORITY:
1. **Fine-tune responsive dimensions**
2. **Clean up CSS comments and temporary styles**

---

## 🚨 CONSOLE ERRORS TO FIX:

Current errors show:
- `400 (Bad Request)` on `/templates` endpoint
- `400 (Bad Request)` on `/flyers` endpoint  
- `404` on `/social_connections` endpoint

These indicate database schema or RLS policy issues that need addressing.

---

## 📝 NOTES FOR FUTURE SESSIONS:

- User has Supabase credentials in `.env.local`
- Database migration was run but templates/flyers tables may have schema issues
- Heart button visual feedback works (pink color)
- Favorites are stored but may not display due to data loading issues
- SocialSpark dashboard layout should be fixed to match FlyerPro

---

**Last Updated:** 2025-09-29 by AI Assistant (300+ requests used)
**Status:** Partial fixes implemented, major refactoring still needed
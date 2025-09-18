# Mobile Responsive CSS - PromoSuite v2

## Overview
This folder contains **mobile-only CSS overrides** that make PromoSuite responsive on mobile devices without touching the desktop design or any React components.

## Key Principles
✅ **Desktop design is completely preserved** (≥1025px)  
✅ **No React component changes** - only CSS overrides  
✅ **No backend changes** - purely frontend responsive fixes  
✅ **Additive approach** - mobile CSS only adds/overrides, doesn't remove functionality  

## File Structure
```
/src/mobile/
├── mobile.css          # Main mobile CSS overrides
├── ISSUES.md           # Mobile issues tracking  
└── README.md           # This documentation
```

## How It Works
1. The mobile CSS is imported in `/src/index.js` as the last stylesheet
2. CSS media queries target mobile devices (`@media (max-width: 768px)`)
3. Higher specificity rules override desktop styles only on mobile
4. Desktop styles remain completely unchanged

## Key Mobile Fixes
- **Header overflow**: Navigation items now wrap and fit on mobile screens
- **Content cropping**: All content now fits within viewport boundaries  
- **Touch targets**: Buttons/links are now finger-friendly (44px minimum)
- **Typography**: Text scales appropriately for mobile reading
- **Horizontal scroll**: Eliminated through proper width constraints

## Breakpoints
- **Mobile Small**: ≤480px (iPhone SE, small phones)
- **Mobile Large**: 481px-768px (iPhone 12/13/14, most phones)  
- **Tablet**: 769px-1024px (iPad, Android tablets)
- **Desktop**: ≥1025px (unchanged - preserves existing design)

## Testing
The app should be tested on:
- iPhone Safari (375px × 667px)
- iPhone Plus/Max (414px × 896px)  
- Android Chrome (360px × 640px)
- iPad Safari (768px × 1024px)
- Chrome DevTools mobile simulation

## Maintenance Rules
🚨 **IMPORTANT**: All mobile changes must be made in this folder only!

### ✅ DO:
- Add new mobile CSS to `mobile.css`
- Use media queries for responsive behavior
- Update `ISSUES.md` when fixing mobile problems
- Test on real devices after changes

### ❌ DON'T:
- Modify any files outside `/src/mobile/`
- Change React component JSX
- Edit existing desktop CSS files
- Modify backend/API code

## CSS Architecture
The mobile.css file is organized into sections:
```css
/* Global fixes (overflow, box-sizing) */
/* Header & Navigation fixes */  
/* Content Layout fixes */
/* Typography & Spacing */
/* Touch-friendly elements */
/* Layout structure fixes */
/* Component-specific fixes */
/* Accessibility improvements */
```

Each section is clearly commented and uses `!important` only when necessary to override desktop styles.

## Performance
- Uses CSS-only approach (no JavaScript required)
- Lightweight file size (~15KB)
- Takes advantage of browser caching
- No impact on desktop performance

## Browser Support
- ✅ iOS Safari 12+
- ✅ Chrome Mobile 70+
- ✅ Samsung Internet 8+
- ✅ Firefox Mobile 60+
- ✅ All modern mobile browsers

## Debugging Mobile Issues
1. Open Chrome DevTools
2. Click device toolbar (mobile icon)
3. Select device preset or set custom dimensions
4. Use "Toggle device toolbar" to switch between desktop/mobile
5. Check for horizontal scrollbars or overflowing content
6. Verify header buttons are visible and clickable

## Support
For mobile-specific issues:
1. Check `ISSUES.md` for known problems
2. Add new issues to the checklist  
3. Apply fixes in `mobile.css` only
4. Test thoroughly on real devices
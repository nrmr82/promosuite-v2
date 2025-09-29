# Mobile Platform Components

## ⚠️ IMPORTANT - Mobile Platform Only ⚠️

**This folder contains MOBILE-SPECIFIC components and layouts.**

All modifications for mobile version should be made here:
- `components/` - Mobile-optimized React components
- `modals/` - Mobile modal dialogs and bottom sheets
- `layouts/` - Mobile page layouts and navigation
- `styles/` - Mobile-specific CSS and responsive styling

### Rules:
1. Only modify files in this folder for mobile changes
2. Import shared utilities from `../../shared/`
3. Test changes don't affect desktop or tablet versions
4. Use mobile-first design patterns (320px - 768px screens)
5. Consider touch interactions and mobile UX patterns

### Mobile-Specific Considerations:
- Touch-friendly button sizes (minimum 44px)
- Swipe gestures and mobile navigation patterns
- Mobile keyboard interactions
- Viewport considerations for different mobile devices
- Performance optimization for mobile networks

### Folder Structure:
```
mobile/
├── components/     # Mobile UI components
├── modals/        # Mobile modals & bottom sheets
├── layouts/       # Mobile page layouts
└── styles/        # Mobile-specific styles
```

**❌ DO NOT put desktop or tablet code in this folder**
**✅ DO use this folder for all mobile-specific UI elements**
**✅ DO prioritize mobile UX patterns and touch interactions**
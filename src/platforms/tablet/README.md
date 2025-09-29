# Tablet Platform Components

## ⚠️ IMPORTANT - Tablet Platform Only ⚠️

**This folder contains TABLET-SPECIFIC components and layouts.**

All modifications for tablet version should be made here:
- `components/` - Tablet-optimized React components
- `modals/` - Tablet modal dialogs and overlays
- `layouts/` - Tablet page layouts and navigation
- `styles/` - Tablet-specific CSS and responsive styling

### Rules:
1. Only modify files in this folder for tablet changes
2. Import shared utilities from `../../shared/`
3. Test changes don't affect desktop or mobile versions
4. Use tablet-appropriate design patterns (768px - 1024px screens)
5. Consider both portrait and landscape orientations

### Tablet-Specific Considerations:
- Hybrid touch and pointer interactions
- Orientation changes (portrait/landscape)
- Larger screen real estate than mobile
- Split-screen and multi-window support
- Touch-friendly but not mobile-constrained UI

### Folder Structure:
```
tablet/
├── components/     # Tablet UI components
├── modals/        # Tablet modal dialogs
├── layouts/       # Tablet page layouts
└── styles/        # Tablet-specific styles
```

**❌ DO NOT put desktop or mobile code in this folder**
**✅ DO use this folder for all tablet-specific UI elements**
**✅ DO consider both portrait and landscape layouts**
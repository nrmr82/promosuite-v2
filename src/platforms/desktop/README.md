# Desktop Platform Components

## ⚠️ IMPORTANT - Desktop Platform Only ⚠️

**This folder contains DESKTOP-SPECIFIC components and layouts.**

All modifications for desktop version should be made here:
- `components/` - Desktop-specific React components
- `modals/` - Desktop modal dialogs and overlays  
- `layouts/` - Desktop page layouts and structure
- `styles/` - Desktop-specific CSS and styling

### Rules:
1. Only modify files in this folder for desktop changes
2. Import shared utilities from `../../shared/`
3. Test changes don't affect mobile or tablet versions
4. Use responsive design patterns appropriate for desktop screens (1024px+)

### Folder Structure:
```
desktop/
├── components/     # Desktop UI components
├── modals/        # Desktop modal dialogs
├── layouts/       # Desktop page layouts
└── styles/        # Desktop-specific styles
```

**❌ DO NOT put mobile or tablet code in this folder**
**✅ DO use this folder for all desktop-specific UI elements**
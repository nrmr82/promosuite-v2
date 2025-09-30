# Development Constraints

## Platform Restrictions

### ❌ Currently NOT Supported
- **Mobile devices** (phones)
- **Tablet devices** (iPads, Android tablets)
- **Touch-optimized interfaces**

### ✅ Currently Supported
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- **Desktop applications**
- **Keyboard and mouse interactions**

## Implementation Guidelines

### CSS/Styling
- No mobile-first CSS approaches
- No touch-specific styling (touch-action, etc.)
- Avoid viewport meta tags for mobile optimization
- Skip responsive breakpoints below desktop sizes

### JavaScript/TypeScript
- No touch event listeners (touchstart, touchend, touchmove)
- No mobile detection logic
- No responsive behavior for small screens
- Focus on click events and keyboard navigation

### UI/UX
- Design for desktop screen sizes (1024px+)
- Optimize for mouse hover states
- Implement keyboard shortcuts
- Use desktop-appropriate component sizes

---
**Note:** Mobile and tablet support will be implemented in future development phases.
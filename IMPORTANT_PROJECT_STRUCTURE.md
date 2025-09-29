# 🚨 CRITICAL - READ FIRST BEFORE ANY CODE MODIFICATIONS 🚨

## Multi-Platform Project Structure

**IMPORTANT FOR ALL FUTURE WARP SESSIONS:** This project is organized into separate folders for different device platforms. **DO NOT** modify files without checking which platform folder you should be working in.

### Platform Folders:
- `src/platforms/desktop/` - Desktop version components, modals, and layouts
- `src/platforms/mobile/` - Mobile version components, modals, and layouts  
- `src/platforms/tablet/` - Tablet version components, modals, and layouts

### Shared Resources:
- `src/shared/` - Common utilities, hooks, API calls, and shared components
- `src/assets/` - Images, icons, and other static assets used across platforms

### Key Rules for Code Modifications:

1. **Always identify the target platform first** before making any changes
2. **Mobile changes go ONLY in `src/platforms/mobile/`**
3. **Desktop changes go ONLY in `src/platforms/desktop/`**
4. **Tablet changes go ONLY in `src/platforms/tablet/`**
5. **Shared functionality goes in `src/shared/`**

### Platform Detection:
The app automatically detects the device type and loads the appropriate platform-specific components.

### Before Making Any Changes:
1. Determine which platform(s) the change affects
2. Navigate to the correct platform folder
3. Make changes only within that platform's folder structure
4. Test changes don't break other platforms

**⚠️ VIOLATION OF THESE RULES WILL BREAK OTHER PLATFORM VERSIONS ⚠️**

---
*This structure was implemented to maintain clean separation between platform versions and prevent cross-platform conflicts.*
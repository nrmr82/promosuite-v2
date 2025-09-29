# Shared Resources

## 📚 Cross-Platform Utilities and Components

**This folder contains code shared across ALL platforms (desktop, mobile, tablet).**

### Folder Structure:
- `hooks/` - Custom React hooks used by multiple platforms
- `utils/` - Utility functions and helpers
- `api/` - API calls and data fetching logic
- `components/` - Platform-agnostic components

### Rules for Shared Code:
1. Code here must work across all platforms
2. Avoid platform-specific styling in shared components
3. Use responsive/adaptive patterns where needed
4. Focus on business logic, not presentation

### What Goes Here:
✅ **hooks/** - useMobileDetection, useAuth, useAPI, etc.
✅ **utils/** - Date formatting, validation, constants
✅ **api/** - Supabase calls, authentication logic
✅ **components/** - Platform-agnostic UI components

### What Doesn't Go Here:
❌ Platform-specific styling
❌ Platform-specific UI components
❌ Device-specific navigation logic

### Usage:
Import shared resources in platform-specific code:
```javascript
// In desktop/mobile/tablet components
import { useAuth } from '../../shared/hooks/useAuth';
import { formatDate } from '../../shared/utils/dateHelpers';
```

**Remember: Changes here affect ALL platforms - test thoroughly!**
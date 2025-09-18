# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

PromoSuite V2 is a React-based marketing suite for real estate professionals featuring two main tools:
- **FlyerPro**: Professional flyer creation with templates and customization
- **SocialSpark**: Social media automation and scheduling

The application is built with React 19, uses a freemium model with trial limitations, and requires a backend API for authentication and data management.

## Commands

### Development
```bash
npm start
```
Runs the development server at `http://localhost:3000` with hot reload.

### Build & Production
```bash
npm run build
```
Creates optimized production build in the `build/` folder. Uses Create React App's webpack configuration.

### Deployment
The built application can be deployed to any static hosting service:

```bash
npm run build
```

This creates a `build/` directory with optimized static files ready for production deployment. The app requires:
- A live backend API at the configured `REACT_APP_API_BASE_URL`
- HTTPS for production (required for social authentication)
- Proper CORS configuration on the backend for the frontend domain

### Testing
```bash
npm test
```
Launches Jest test runner in interactive watch mode.

To run tests without watch mode:
```bash
npm test -- --watchAll=false
```

### Linting
The project uses ESLint with Create React App's default configuration. Linting runs automatically during builds, but you can run it manually via:
```bash
npx eslint src/
```

## High-Level Architecture

### Application Structure
```
src/
├── components/           # React components (pages and UI)
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── services/            # Business logic and API clients
├── utils/               # Utility functions and helpers
├── App.js              # Main application component
└── index.js            # React app entry point
```

### Core Architecture Patterns

**State Management Strategy:**
- React Context API for shared state (TemplateContext)
- Local component state with useState/useReducer
- localStorage for persistence of user data and preferences
- Production authentication service with proper error handling

**Authentication & User Management:**
- `authService`: Handles login, registration, token refresh
- Supports both email/password and social authentication
- Trial system: Users get 2 free tool uses before requiring subscription
- Subscription management through `subscriptionService`

**Data Flow:**
1. **Authentication Layer**: `authService` manages user sessions and tokens
2. **Business Logic**: Services handle API communication with fallback mocks
3. **State Management**: Context providers manage shared state across components
4. **UI Components**: React components consume context and services
5. **Analytics**: Template usage tracking through `TemplateContext`

**API Architecture:**
- Centralized HTTP client (`utils/api.js`) with authentication headers
- Comprehensive endpoint configuration (`API_ENDPOINTS`)
- Automatic token refresh and error handling
- Production API endpoint: `https://api.promosuite.com/api`

### Key Components

**Main Application (`App.js`):**
- Navigation and routing logic
- Authentication state management
- Trial usage tracking and subscription enforcement
- Modal management (auth, subscription)

**Tool Components:**
- `FlyerPro`: Template-based flyer creation interface
- `SocialSpark`: Social media scheduling and automation
- `Dashboard`: User home page with tool overview

**Context Providers:**
- `TemplateProvider`: Manages template usage, favorites, and analytics
- Includes comprehensive event tracking and user behavior analytics

**Service Layer:**
- `authService`: Complete authentication system with social login support
- `subscriptionService`: Freemium model management and billing integration
- Production-ready services that require backend connectivity

### Error Handling & Accessibility

**Error Management:**
- Centralized error handling through `useErrorHandler` hook
- Error categorization (network, auth, template, etc.)
- Error logging and reporting infrastructure
- Network status monitoring with offline/online detection

**Accessibility Features:**
- Comprehensive accessibility hooks (`useAccessibility.js`)
- Focus management for modals and interactive elements
- Screen reader announcements
- Keyboard navigation support
- Reduced motion and high contrast preferences
- WCAG contrast ratio utilities

## Development Patterns

### Component Organization
- Components use functional React with hooks
- CSS modules pattern with component-specific stylesheets
- Separation of concerns: UI components, business logic services, and utility functions

### State Management
- Use React Context for cross-component state (user data, templates)
- Local state with `useState` for component-specific UI state
- `useReducer` for complex state logic (TemplateContext)
- Persistent state stored in localStorage with JSON serialization

### API Integration
- All API calls go through centralized `apiClient` in `utils/api.js`
- Automatic authentication header injection
- Production API calls require backend connectivity
- Comprehensive error handling and retry logic

### Authentication Flow
1. User authentication persisted in localStorage
2. Token-based authentication with automatic refresh
3. Trial system tracks tool usage per user
4. Subscription state determines feature access

### Testing Approach
- Jest and React Testing Library setup via Create React App
- Test files use `.test.js` extension
- Basic smoke test included (`App.test.js`)

## Environment Configuration

### Development Setup
- Node.js project using Create React App
- No additional build configuration required
- Environment variables supported via `.env` files
- Default API base URL: `https://api.promosuite.com/api` (configurable via `REACT_APP_API_BASE_URL`)

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required variables:
- `REACT_APP_API_BASE_URL`: Backend API base URL

Optional variables:
- `REACT_APP_GA_TRACKING_ID`: Google Analytics tracking ID
- `REACT_APP_ENABLE_SOCIAL_AUTH`: Enable/disable social authentication
- `REACT_APP_ENABLE_ANALYTICS`: Enable/disable analytics tracking
- `REACT_APP_ENVIRONMENT`: Current environment (development/staging/production)

### Technology Stack
- **Framework**: React 19.1.1
- **Build Tool**: Create React App 5.0.1 (webpack-based)
- **Icons**: Lucide React 0.543.0, React Icons 5.5.0
- **Animation**: Framer Motion 12.23.12
- **Testing**: Jest, React Testing Library
- **Styling**: CSS with CSS Modules pattern

### Browser Support
Configured for modern browsers with Create React App's default browserslist:
- Production: >0.2%, not dead, not op_mini all
- Development: last 1 chrome/firefox/safari version

## Key Development Notes

### Backend Dependencies
The application requires a live backend API for full functionality:
- Authentication and user management
- Subscription and billing operations
- Template and content management

### User Trial System
- New users get 2 free tool trials (tracked in `user.trialStatus`)
- Trial usage tracked per tool (flyerpro, socialspark)
- Subscription modal appears when trial limit reached
- Premium users have unlimited access

### Analytics Integration
- Template usage tracking through `TemplateContext`
- Event-based analytics with Google Analytics integration
- User behavior tracking for template previews, favorites, usage

### Accessibility Considerations
- Focus trap implementation for modals
- Screen reader announcements for dynamic content
- Keyboard navigation support throughout the application
- Support for reduced motion and high contrast preferences

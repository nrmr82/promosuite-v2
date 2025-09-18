# PromoSuite v2 Design System

## Color Palette

### Primary Colors
- **Primary Pink**: `#e91e63` (Main brand color, CTA buttons)
- **Primary Pink Dark**: `#d81b60` (Hover states)
- **Primary Pink Light**: `#c2185b` (Active states)

### Background Colors
- **Primary Background**: `#1a1a1a` (Main dark background)
- **Secondary Background**: `#2a2a2a` (Cards, elevated surfaces)
- **Tertiary Background**: `rgba(42, 42, 42, 0.7)` (Semi-transparent overlays)
- **Surface**: `rgba(26, 26, 26, 0.8)` (Tool previews, sidebars)

### Border Colors
- **Primary Border**: `#333` (Main borders)
- **Secondary Border**: `#444` (Card borders, stronger borders)
- **Subtle Border**: `rgba(51, 51, 51, 0.5)` (Light borders)
- **Tool Border**: `rgba(68, 68, 68, 0.5)` (Tool card borders)

### Text Colors
- **Primary Text**: `#ffffff` (Main text, headings)
- **Secondary Text**: `#aaaaaa` (Descriptions, subtitles)
- **Tertiary Text**: `#cccccc` (Navigation, secondary content)
- **Muted Text**: `#888888` (Labels, very subtle text)

### Gradient Backgrounds
```css
background: radial-gradient(circle at 30% 20%, rgba(70, 70, 70, 0.15) 0%, rgba(50, 50, 50, 0.08) 40%, transparent 70%),
            radial-gradient(circle at 70% 80%, rgba(60, 60, 60, 0.12) 0%, rgba(40, 40, 40, 0.06) 50%, transparent 80%),
            radial-gradient(circle at 20% 70%, rgba(80, 80, 80, 0.10) 0%, transparent 60%),
            #1a1a1a;
```

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Font Sizes (Desktop)
- **Hero Title**: `2rem` (32px)
- **Page Title**: `1.5rem` (24px) 
- **Section Title**: `1.25rem` (20px)
- **Body Large**: `1.1rem` (17.6px)
- **Body**: `1rem` (16px)
- **Body Small**: `0.9rem` (14.4px)
- **Caption**: `0.8rem` (12.8px)
- **Micro**: `0.7rem` (11.2px)

### Font Weights
- **Extra Bold**: `800` (Hero titles)
- **Bold**: `700` (Headings)
- **Semi Bold**: `600` (Buttons, labels)
- **Medium**: `500` (Body text emphasis)
- **Regular**: `400` (Body text)

## Spacing Scale

### Base Unit: 4px
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `0.75rem` (12px)
- **lg**: `1rem` (16px)
- **xl**: `1.5rem` (24px)
- **2xl**: `2rem` (32px)
- **3xl**: `3rem` (48px)

### Component Spacing
- **Button Padding**: `0.7rem 1.5rem`
- **Card Padding**: `1.5rem`
- **Section Margins**: `2rem - 3rem`
- **Container Padding**: `2rem`

## Component Styles

### Buttons
```css
.primary-button {
  background: #e91e63;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.primary-button:hover {
  background: #d81b60;
}
```

### Cards
```css
.card {
  background: rgba(42, 42, 42, 0.7);
  border: 1px solid rgba(68, 68, 68, 0.5);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: #e91e63;
  box-shadow: 0 10px 25px rgba(233, 30, 99, 0.2);
}
```

### Status Badges
```css
.status-pro {
  background: #2a2a2a;
  border: 1px solid #444;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
}

.status-trial {
  background: #e91e63;
  color: #ffffff;
}
```

## Layout System

### Grid System
- **Max Width**: `1200px`
- **Container Padding**: `2rem`
- **Grid Gaps**: `1.5rem - 2rem`

### Breakpoints
- **Mobile**: `≤768px`
- **Tablet**: `769px - 1024px`
- **Desktop**: `≥1025px`

## Interactive Elements

### Hover Effects
- **Cards**: `translateY(-4px)` + border glow
- **Buttons**: Color darkening
- **Links**: Color brightening

### Transitions
- **Standard**: `all 0.2s ease`
- **Card Hover**: `all 0.3s ease`
- **Complex Animations**: `cubic-bezier(0.4, 0, 0.2, 1)`

## Icon System
- **Tool Icons**: `48px × 48px`
- **Navigation Icons**: `20px × 20px`  
- **Status Icons**: `16px × 16px`
- **Logo Icon**: `28px × 28px`

## Features to Include in All Designs

### Core Features
1. **User Authentication** (Login/Signup)
2. **Navigation Menu** (Dashboard, Tools, Collections, Pricing)
3. **Tool Cards** (FlyerPro, SocialSpark)
4. **User Profile** & Status Badge
5. **Collections Preview**
6. **Responsive Tool Previews**

### Interactive Elements
1. **Hover States** (adapted for touch on mobile)
2. **Loading States**
3. **Form Elements**
4. **Modal/Overlay Support**
5. **Toast Notifications**

### Layout Components
1. **Header/Navigation**
2. **Sidebar** (Desktop) / **Mobile Menu** (Mobile)
3. **Hero Section**
4. **Tool Grid**
5. **Collections Section**
6. **Footer**
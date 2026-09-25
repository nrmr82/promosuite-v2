import { Building2, Sparkles, CalendarDays, Globe, Clapperboard, Palette } from 'lucide-react';

// Features on the roadmap, shown as "coming soon" in the app (order = planned phases)
export const UPCOMING = [
  {
    slug: 'brand-kit',
    title: 'Brand kit',
    icon: Palette,
    phase: 'Phase 1',
    summary: 'Your logo, colors, fonts, headshot and brokerage details applied to every design automatically.',
    points: ['Upload logo and headshot once', 'Brand colors and fonts in every template', 'License number and brokerage info on every ad'],
  },
  {
    slug: 'listings',
    title: 'Listings',
    icon: Building2,
    phase: 'Phase 1',
    summary: 'Enter a property once and every flyer, post and page fills itself in.',
    points: ['Address, price, beds, baths and photos in one place', 'One-click campaign packs: Just Listed, Open House, Just Sold', 'Designs in every size: print, Instagram, Stories, Facebook'],
  },
  {
    slug: 'ai-writer',
    title: 'AI writer',
    icon: Sparkles,
    phase: 'Phase 2',
    summary: 'Listing descriptions, captions and hashtags written from your property details and photos.',
    points: ['Describe a home from its photos', 'Captions for each social network', 'Fair Housing wording check'],
  },
  {
    slug: 'listing-pages',
    title: 'Listing pages',
    icon: Globe,
    phase: 'Phase 3',
    summary: 'A web page for every listing with photos, a map and a lead form. Flyers link to it with a QR code.',
    points: ['Photo gallery, map and mortgage calculator', 'Lead form that saves inquiries to PromoSuite', 'QR codes for flyers and yard signs'],
  },
  {
    slug: 'social-planner',
    title: 'Social planner',
    icon: CalendarDays,
    phase: 'Phase 4',
    summary: 'Plan posts on a calendar and publish to your social accounts.',
    points: ['Content calendar with reminders', 'Ready-to-post share kits', 'Direct posting where the networks allow it'],
  },
  {
    slug: 'video',
    title: 'Video reels',
    icon: Clapperboard,
    phase: 'Phase 5',
    summary: 'Turn listing photos into short videos for Reels, TikTok and Shorts.',
    points: ['Photo slideshows with motion and music', 'Text overlays with your branding', 'AI voiceover'],
  },
];

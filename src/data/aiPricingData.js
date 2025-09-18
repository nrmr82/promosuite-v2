// 🚧 FUTURE: AI-Powered Social Media Content Generation Pricing Plans
// This data structure represents the future subscription model for AI-generated
// Instagram/TikTok content with Replicate integration for video and image generation.

export const aiPricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '/month',
    billing: 'No payment required',
    savings: null,
    popular: false,
    comingSoon: true,
    aiReels: 5,
    aiImages: 50,
    nonAiTools: 'Unlimited uploads/templates',
    extras: [
      'Watermarked outputs',
      'Basic captions & music',
      'Standard export formats'
    ],
    features: [
      '5 AI-generated reels per month',
      '50 AI-generated images per month',
      'Unlimited template usage',
      'Unlimited file uploads',
      'Basic music library',
      'Auto-captioning (basic)',
      'Watermarked exports'
    ],
    limitations: [
      'PromoSuite watermark on exports',
      'Limited music selection',
      'Basic caption styles only'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: '/month',
    billing: 'Billed monthly',
    savings: null,
    popular: false,
    comingSoon: true,
    aiReels: 30,
    aiImages: 500,
    nonAiTools: 'Unlimited uploads/templates',
    extras: [
      'No watermark',
      'Auto-caption',
      'Basic music library'
    ],
    features: [
      '30 AI-generated reels per month',
      '500 AI-generated images per month', 
      'Unlimited template usage',
      'Unlimited file uploads',
      'No watermarks',
      'Auto-captioning (enhanced)',
      'Basic music library',
      'Standard export formats'
    ],
    limitations: [
      'Basic templates only',
      'Standard priority processing'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    period: '/month',
    billing: 'Billed monthly',
    savings: 'Most Popular',
    popular: true,
    comingSoon: true,
    aiReels: 100,
    aiImages: 2000,
    nonAiTools: 'Unlimited uploads/templates',
    extras: [
      'Advanced templates',
      'Caption styles',
      'Priority queue'
    ],
    features: [
      '100 AI-generated reels per month',
      '2,000 AI-generated images per month',
      'Unlimited template usage',
      'Unlimited file uploads',
      'No watermarks',
      'Advanced caption styles',
      'Premium music library',
      'Priority processing queue',
      'Advanced templates',
      'HD export quality'
    ],
    limitations: []
  },
  {
    id: 'creator-plus',
    name: 'Creator+',
    price: 149,
    period: '/month',
    billing: 'Billed monthly',
    savings: null,
    popular: false,
    comingSoon: true,
    aiReels: 250,
    aiImages: 5000,
    nonAiTools: 'Unlimited uploads/templates',
    teamSeats: 2,
    commercialRights: true,
    extras: [
      'Team access (2 seats)',
      'Commercial use',
      'Brand templates'
    ],
    features: [
      '250 AI-generated reels per month',
      '5,000 AI-generated images per month',
      'Unlimited template usage',
      'Unlimited file uploads',
      'Team access for 2 members',
      'Commercial usage rights',
      'Custom brand templates',
      'Advanced analytics',
      'Priority support',
      '4K export quality',
      'Custom music uploads'
    ],
    limitations: []
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 299,
    period: '/month',
    billing: 'Billed monthly',
    savings: null,
    popular: false,
    comingSoon: true,
    aiReels: 600,
    aiImages: 10000,
    nonAiTools: 'Unlimited uploads/templates',
    teamSeats: 5,
    commercialRights: true,
    apiAccess: true,
    extras: [
      'Team access (5 seats)',
      'API access',
      'Custom branding',
      'Priority queue'
    ],
    features: [
      '600 AI-generated reels per month',
      '10,000 AI-generated images per month',
      'Unlimited template usage',
      'Unlimited file uploads',
      'Team access for 5 members',
      'Full commercial usage rights',
      'White-label solutions',
      'API access for integrations',
      'Custom branding removal',
      'Priority processing queue',
      'Dedicated account manager',
      'Advanced analytics & reporting',
      '4K export quality',
      'Custom integrations'
    ],
    limitations: []
  }
];

// Additional metadata for the AI pricing section
export const aiPricingMetadata = {
  sectionTitle: 'AI-Powered Content Generation',
  sectionSubtitle: 'Create stunning Instagram & TikTok content with AI. Generate reels, images, and posts with just a prompt.',
  comingSoonBadge: 'Coming Soon',
  replicateNote: 'Powered by Replicate AI for high-quality video and image generation',
  waitlistCta: 'Join Waitlist',
  learnMoreCta: 'Learn More',
  features: {
    aiReels: 'AI-generated Instagram/TikTok reels',
    aiImages: 'AI-generated posts, stories & thumbnails',
    nonAiTools: 'DIY templates & uploads (unlimited)',
    teamAccess: 'Collaborative workspace',
    commercialRights: 'Commercial usage licensing',
    apiAccess: 'Developer API access',
    priorityQueue: 'Faster processing times',
    customBranding: 'White-label solutions'
  },
  faqs: [
    {
      question: 'How does AI content generation work?',
      answer: 'Simply describe what you want to create, and our AI will generate professional reels and images optimized for Instagram and TikTok.'
    },
    {
      question: 'What happens when I reach my monthly limits?',
      answer: 'You can still use unlimited templates and uploads. AI generation will resume next month or you can upgrade your plan.'
    },
    {
      question: 'Can I use the content commercially?',
      answer: 'Creator+ and Agency plans include commercial usage rights. Free, Starter, and Pro plans are for personal/business use only.'
    }
  ]
};

export default aiPricingPlans;

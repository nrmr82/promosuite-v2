/**
 * AI Service
 * Flyer copy, property analysis and image generation through the app's own
 * /api/ai/* endpoints (Cloudflare Workers AI, see functions/api/ai). No API keys
 * live in the browser; requests carry the user's Supabase session instead.
 */

import { supabase } from './supabase';

class AIService {
  constructor() {
    // Track current property data for intelligent fallbacks
    this.currentPropertyData = {};
  }

  async callApi(path, body) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Please sign in to use AI features');

    const response = await fetch(`/api/ai/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `AI request failed (${response.status})`);
    return result;
  }

  /**
   * Generate text; falls back to template copy if the AI endpoint is unavailable
   */
  async generateTextWithFallback(prompt, maxTokens = 500) {
    try {
      const { text } = await this.callApi('text', { prompt, maxTokens });
      if (text) return text;
    } catch (error) {
      console.warn('AI text generation unavailable, using fallback:', error.message);
    }
    return this.generateIntelligentFallback(prompt, this.currentPropertyData);
  }

  /**
   * Generate an image with FLUX.1 [schnell]; returns a data URL
   */
  async generateImage(prompt, options = {}) {
    try {
      const { image } = await this.callApi('image', { prompt, steps: options.steps });
      return {
        success: true,
        image: {
          url: image,
          prompt,
          model: 'flux-1-schnell',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('AI image generation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate intelligent fallback content (same as before)
   */
  generateIntelligentFallback(prompt, propertyData = {}) {
    const variations = {
      headlines: [
        `Stunning ${propertyData.bedrooms || '3'}BR Home in Prime Location`,
        `Exceptional ${propertyData.propertyType || 'Residential'} Property Available Now`,
        `Beautiful ${propertyData.bedrooms || '3'}-Bedroom Home Ready for You`,
        `Discover Your Dream ${propertyData.propertyType || 'Home'} Today`,
        `Move-In Ready ${propertyData.bedrooms || '3'}BR ${propertyData.bathrooms || '2'}BA Home`
      ],
      subheadlines: [
        "Don't Miss This Amazing Opportunity",
        "Premium Living Awaits • Move-In Ready",
        "Exceptional Value • Prime Location",
        "Your New Home Journey Starts Here",
        "Modern Comfort Meets Classic Charm"
      ],
      descriptions: [
        `Experience luxury living in this meticulously maintained ${propertyData.bedrooms || '3'} bedroom, ${propertyData.bathrooms || '2'} bathroom home${propertyData.squareFeet ? ` spanning ${propertyData.squareFeet} square feet` : ''}. Nestled in a sought-after neighborhood, this property seamlessly blends comfort with sophistication.`,
        `Welcome to your new sanctuary! This beautifully appointed ${propertyData.bedrooms || '3'}-bedroom residence offers ${propertyData.squareFeet ? `${propertyData.squareFeet} square feet of ` : ''}thoughtfully designed living space. Every detail has been carefully considered to create the perfect home.`,
        `Discover the perfect blend of style and functionality in this remarkable ${propertyData.propertyType?.toLowerCase() || 'residential'} property. With ${propertyData.bedrooms || '3'} spacious bedrooms and ${propertyData.bathrooms || '2'} full bathrooms, this home is ideal for modern living.`
      ]
    };
    
    const timeVariation = Math.floor(Date.now() / 10000) % variations.headlines.length;
    
    // Analyze the prompt to determine what type of content to generate
    if (prompt.includes('JSON format') || prompt.includes('template')) {
      return JSON.stringify({
        "headline": variations.headlines[timeVariation],
        "subheadline": variations.subheadlines[timeVariation],
        "description": variations.descriptions[timeVariation],
        "keyFeatures": ["Modern Design", "Prime Location", "Move-in Ready", "Great Value"],
        "callToAction": "Schedule Your Private Showing Today!",
        "aiGenerated": false,
        "fallbackUsed": true
      });
    }
    
    return variations.descriptions[timeVariation];
  }

  async generateFlyer(propertyData, userPreferences = {}) {
    this.currentPropertyData = propertyData;
    
    try {
      const analysis = await this.analyzeProperty(propertyData);
      const marketingContent = await this.generateMarketingContent(propertyData, analysis, userPreferences);
      
      const flyerData = {
        id: `ai_flyer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        property: propertyData,
        analysis: analysis,
        content: marketingContent,
        aiGenerated: true,
        provider: 'cloudflare-workers-ai',
        generatedAt: new Date().toISOString(),
        version: '2.0'
      };

      return {
        success: true,
        flyer: flyerData
      };
      
    } catch (error) {
      console.error('❌ AI flyer generation failed:', error);
      throw new Error(`AI flyer generation failed: ${error.message}`);
    }
  }

  async analyzeProperty(propertyData) {
    const prompt = `
      Analyze this real estate property and provide detailed insights for marketing:
      
      Property Details:
      - Address: ${propertyData.address || 'Not provided'}
      - Price: ${propertyData.price || 'Not provided'}
      - Bedrooms: ${propertyData.bedrooms || 'Not provided'}
      - Bathrooms: ${propertyData.bathrooms || 'Not provided'}
      - Square Feet: ${propertyData.squareFeet || 'Not provided'}
      - Property Type: ${propertyData.propertyType || 'Not provided'}
      
      Provide analysis in JSON format with these fields:
      - propertyType: luxury|family|starter|investment
      - targetAudience: array of target buyers
      - keySellingPoints: array of main selling points
      - marketPosition: premium|competitive|value
      - recommendedStyle: modern|classic|luxury|minimal
      - emotionalTriggers: array of emotional appeals
      - lifestyleMatch: description of ideal buyer lifestyle
    `;

    const analysisText = await this.generateTextWithFallback(prompt, 400);
    
    let analysis = null;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.log('Using fallback analysis due to parsing error');
    }
    
    return analysis || {
      propertyType: 'family',
      targetAudience: ['families', 'professionals'],
      keySellingPoints: ['Great location', 'Move-in ready', 'Good value'],
      marketPosition: 'competitive',
      recommendedStyle: 'modern',
      emotionalTriggers: ['comfort', 'convenience'],
      lifestyleMatch: 'Perfect for modern living',
      confidence: 0.8,
      fallbackUsed: true
    };
  }

  async generateMarketingContent(propertyData, analysis, userPreferences) {
    const prompt = `
      Create compelling marketing content for this real estate property:
      
      Property: ${propertyData.address}
      Price: ${propertyData.price}
      Details: ${propertyData.bedrooms}BR/${propertyData.bathrooms}BA
      Target Audience: ${analysis.targetAudience?.join(', ')}
      
      Generate content in JSON format with:
      - headline: attention-grabbing main headline
      - subheadline: supporting subheadline
      - description: compelling 2-3 sentence description
      - keyFeatures: array of 4 key features
      - callToAction: strong call to action
    `;

    const contentText = await this.generateTextWithFallback(prompt, 500);
    
    let content = null;
    try {
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.log('Using fallback content due to parsing error');
    }
    
    return content || {
      headline: `Beautiful ${propertyData.bedrooms}BR Home Available Now`,
      subheadline: 'Don\'t miss this amazing opportunity',
      description: `Discover this wonderful ${propertyData.bedrooms} bedroom home featuring modern amenities and great location.`,
      keyFeatures: ['Great Location', 'Move-in Ready', 'Modern Updates', 'Excellent Value'],
      callToAction: 'Schedule Your Showing Today!',
      aiGenerated: false,
      fallbackUsed: true
    };
  }

  /**
   * Get AI service capabilities
   */
  getAICapabilities() {
    return {
      flyerGeneration: true,
      propertyAnalysis: true,
      textGeneration: true,
      imageGeneration: true,
      videoGeneration: false,
      provider: 'cloudflare-workers-ai',
    };
  }
}

const aiService = new AIService();

export default aiService;
export { AIService };

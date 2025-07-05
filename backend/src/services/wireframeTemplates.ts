import { WireframeComponent } from './huggingface';

// Enhanced component types for professional wireframes
export type WireframeComponentType = 
  // Navigation
  | 'header' | 'navbar' | 'sidebar' | 'breadcrumb' | 'tabs' | 'pagination'
  // Content
  | 'hero' | 'text' | 'heading' | 'paragraph' | 'image' | 'video' | 'carousel' | 'gallery'
  // Forms
  | 'form' | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'button' | 'search'
  // Data Display
  | 'table' | 'chart' | 'card' | 'list' | 'grid' | 'stats' | 'progress' | 'badge'
  // Feedback
  | 'modal' | 'alert' | 'tooltip' | 'notification' | 'loading' | 'empty-state'
  // Layout
  | 'container' | 'section' | 'divider' | 'spacer' | 'footer' | 'columns'
  // E-commerce
  | 'product-card' | 'shopping-cart' | 'checkout' | 'price' | 'rating' | 'filter'
  // Dashboard
  | 'widget' | 'metric' | 'timeline' | 'calendar' | 'profile' | 'settings';

export interface WireframeTemplate {
  id: string;
  name: string;
  category: 'landing' | 'dashboard' | 'ecommerce' | 'form' | 'blog' | 'other';
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
  components: WireframeComponent[];
  keywords: string[];
}

export class WireframeTemplateService {
  private templates: WireframeTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    this.templates = [
      // LANDING PAGE TEMPLATES
      {
        id: 'saas-landing-modern',
        name: 'Modern SaaS Landing',
        category: 'landing',
        description: 'Clean, modern SaaS landing page with hero, features, and pricing',
        complexity: 'medium',
        keywords: ['saas', 'software', 'app', 'product', 'startup', 'tech', 'modern'],
        components: [
          // Header with navigation
          {
            id: 'header_1',
            type: 'header',
            x: 0, y: 0, width: 100, height: 8,
            content: 'Main Header',
            style: { 
              backgroundColor: '#ffffff', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 5%'
            }
          },
          {
            id: 'navbar_1',
            type: 'navbar',
            x: 10, y: 2, width: 60, height: 4,
            content: 'Product | Features | Pricing | Contact',
            style: { 
              display: 'flex',
              gap: '2rem',
              fontSize: '14px',
              fontWeight: '500'
            }
          },
          {
            id: 'button_nav',
            type: 'button',
            x: 80, y: 2, width: 15, height: 4,
            content: 'Get Started',
            style: { 
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '600'
            }
          },

          // Hero Section
          {
            id: 'hero_1',
            type: 'hero',
            x: 0, y: 8, width: 100, height: 45,
            content: 'Build Amazing Products with AI - Empower your team with cutting-edge AI tools that transform ideas into reality. Join thousands of companies already building the future.',
            style: { 
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '4rem 2rem'
            }
          },

          // Features Section
          {
            id: 'section_features',
            type: 'section',
            x: 0, y: 53, width: 100, height: 35,
            content: 'Features Section',
            style: { 
              backgroundColor: '#ffffff',
              padding: '4rem 5%'
            }
          },
          {
            id: 'heading_features',
            type: 'heading',
            x: 35, y: 58, width: 30, height: 5,
            content: 'Powerful Features',
            style: { 
              fontSize: '32px',
              fontWeight: '600',
              textAlign: 'center',
              color: '#1f2937'
            }
          },
          // Feature Cards
          {
            id: 'card_feature_1',
            type: 'card',
            x: 8, y: 68, width: 25, height: 15,
            content: 'AI-Powered Analytics',
            style: { 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }
          },
          {
            id: 'card_feature_2',
            type: 'card',
            x: 37.5, y: 68, width: 25, height: 15,
            content: 'Real-time Collaboration',
            style: { 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }
          },
          {
            id: 'card_feature_3',
            type: 'card',
            x: 67, y: 68, width: 25, height: 15,
            content: 'Enterprise Security',
            style: { 
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }
          },

          // Footer
          {
            id: 'footer_1',
            type: 'footer',
            x: 0, y: 92, width: 100, height: 8,
            content: 'Footer Content',
            style: { 
              backgroundColor: '#1f2937',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }
        ]
      },

      // E-COMMERCE TEMPLATE
      {
        id: 'ecommerce-shop',
        name: 'E-commerce Shop',
        category: 'ecommerce',
        description: 'Online store with product grid, filters, and shopping cart',
        complexity: 'medium',
        keywords: ['shop', 'store', 'ecommerce', 'products', 'buy', 'cart', 'retail'],
        components: [
          // Header
          {
            id: 'header_shop',
            type: 'header',
            x: 0, y: 0, width: 100, height: 10,
            content: 'Shop Header',
            style: { 
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e7eb',
              padding: '0 2rem'
            }
          },
          // Search Bar
          {
            id: 'search_bar',
            type: 'search',
            x: 25, y: 12, width: 50, height: 6,
            content: 'Search products...',
            style: { 
              backgroundColor: '#f9fafb',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }
          },
          // Filter Sidebar
          {
            id: 'filter_sidebar',
            type: 'filter',
            x: 0, y: 18, width: 20, height: 70,
            content: 'Product Filters',
            style: { 
              backgroundColor: '#f9fafb',
              borderRight: '1px solid #e5e7eb',
              padding: '1rem'
            }
          },
          // Product Grid
          {
            id: 'product_grid',
            type: 'grid',
            x: 22, y: 18, width: 78, height: 70,
            content: 'Product Grid',
            style: { 
              backgroundColor: '#ffffff',
              display: 'grid',
              gap: '1rem',
              padding: '1rem'
            }
          },
          // Shopping Cart
          {
            id: 'shopping_cart',
            type: 'shopping-cart',
            x: 80, y: 2, width: 18, height: 6,
            content: 'Cart (0)',
            style: { 
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '6px'
            }
          }
        ]
      },

      // DASHBOARD TEMPLATE
      {
        id: 'admin-dashboard',
        name: 'Admin Dashboard',
        category: 'dashboard',
        description: 'Comprehensive admin dashboard with sidebar navigation and data widgets',
        complexity: 'complex',
        keywords: ['dashboard', 'admin', 'analytics', 'data', 'management', 'charts'],
        components: [
          // Sidebar Navigation
          {
            id: 'sidebar_1',
            type: 'sidebar',
            x: 0, y: 0, width: 20, height: 100,
            content: 'Navigation Sidebar',
            style: { 
              backgroundColor: '#1f2937',
              color: 'white',
              padding: '1rem'
            }
          },
          // Main Header
          {
            id: 'header_dashboard',
            type: 'header',
            x: 20, y: 0, width: 80, height: 8,
            content: 'Dashboard Header',
            style: { 
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem'
            }
          },
          // Stats Cards
          {
            id: 'stats_1',
            type: 'stats',
            x: 25, y: 12, width: 15, height: 12,
            content: 'Total Users: 10,247',
            style: { 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center'
            }
          },
          {
            id: 'stats_2',
            type: 'stats',
            x: 42.5, y: 12, width: 15, height: 12,
            content: 'Revenue: $45,230',
            style: { 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center'
            }
          },
          {
            id: 'stats_3',
            type: 'stats',
            x: 60, y: 12, width: 15, height: 12,
            content: 'Growth: +12.5%',
            style: { 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center'
            }
          },
          // Chart Widget
          {
            id: 'chart_1',
            type: 'chart',
            x: 25, y: 28, width: 50, height: 25,
            content: 'Revenue Analytics Chart',
            style: { 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem'
            }
          },
          // Data Table
          {
            id: 'table_1',
            type: 'table',
            x: 25, y: 58, width: 70, height: 30,
            content: 'User Management Table',
            style: { 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }
          }
        ]
      },

      // BLOG TEMPLATE
      {
        id: 'blog-page',
        name: 'Blog Page',
        category: 'blog',
        description: 'Clean blog layout with article content and sidebar',
        complexity: 'simple',
        keywords: ['blog', 'article', 'content', 'news', 'post', 'writing', 'story'],
        components: [
          // Header
          {
            id: 'header_blog',
            type: 'header',
            x: 0, y: 0, width: 100, height: 10,
            content: 'Blog Header',
            style: { 
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e7eb'
            }
          },
          // Main Article
          {
            id: 'article_main',
            type: 'text',
            x: 10, y: 12, width: 60, height: 70,
            content: 'Blog Article Content',
            style: { 
              backgroundColor: '#ffffff',
              padding: '2rem',
              fontSize: '16px',
              lineHeight: '1.6'
            }
          },
          // Sidebar
          {
            id: 'sidebar_blog',
            type: 'sidebar',
            x: 72, y: 12, width: 25, height: 70,
            content: 'Blog Sidebar',
            style: { 
              backgroundColor: '#f9fafb',
              padding: '1rem',
              borderLeft: '1px solid #e5e7eb'
            }
          },
          // Footer
          {
            id: 'footer_blog',
            type: 'footer',
            x: 0, y: 85, width: 100, height: 15,
            content: 'Blog Footer',
            style: { 
              backgroundColor: '#1f2937',
              color: 'white'
            }
          }
        ]
      }
    ];
  }

  // Smart template selection based on user input
  selectTemplate(description: string, pageType?: string): WireframeTemplate {
    const keywords = description.toLowerCase().split(' ');
    console.log('Template selection - Description:', description);
    console.log('Template selection - Keywords:', keywords);
    console.log('Template selection - Page type:', pageType);
    
    // Score ALL templates based on keyword matches first
    const allScored = this.templates.map(template => {
      const score = template.keywords.reduce((acc, keyword) => {
        // Check if any word in description contains the keyword or vice versa
        const hasMatch = keywords.some(k => 
          k.includes(keyword) || 
          keyword.includes(k) ||
          k === keyword ||
          (k.length >= 3 && keyword.length >= 3 && (k.startsWith(keyword) || keyword.startsWith(k)))
        );
        return acc + (hasMatch ? 1 : 0);
      }, 0);
      return { template, score };
    });

    // Smart template selection with aggressive keyword override
    let candidates = allScored;
    if (pageType && pageType !== 'other') {
      const pageTypeMatches = allScored.filter(s => s.template.category === pageType);
      const bestOverallScore = Math.max(...allScored.map(s => s.score));
      const bestPageTypeScore = pageTypeMatches.length > 0 ? Math.max(...pageTypeMatches.map(s => s.score)) : 0;
      
      // Use pageType filter only if:
      // 1. There are pageType matches AND
      // 2. Best pageType score is within 1 point of best overall score (or best overall is 0)
      if (pageTypeMatches.length > 0 && (bestPageTypeScore >= bestOverallScore - 1 || bestOverallScore <= 1)) {
        candidates = pageTypeMatches;
      }
      // Otherwise, ignore pageType and use all templates (keyword matching wins)
    }

    // Sort by score and return the best match
    candidates.sort((a, b) => b.score - a.score);
    
    console.log('Template selection - All scored results:', allScored.map(s => ({ name: s.template.name, category: s.template.category, score: s.score })));
    console.log('Template selection - Final candidates:', candidates.map(s => ({ name: s.template.name, category: s.template.category, score: s.score })));
    
    // Return the best template or fallback to the first one
    const selected = candidates.length > 0 ? candidates[0].template : this.templates[0];
    console.log('Template selection - Selected:', selected.name);
    
    return selected;
  }

  // Get all templates for a specific category
  getTemplatesByCategory(category: string): WireframeTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  // Get template by ID
  getTemplateById(id: string): WireframeTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  // Customize template based on user input
  customizeTemplate(template: WireframeTemplate, description: string, device: string = 'desktop'): WireframeTemplate {
    const customized = JSON.parse(JSON.stringify(template)); // Deep clone
    
    // Adjust dimensions based on device
    const scale = this.getDeviceScale(device);
    customized.components = customized.components.map((component: WireframeComponent) => ({
      ...component,
      width: component.width * scale.width,
      height: component.height * scale.height,
      x: component.x * scale.width,
      y: component.y * scale.height
    }));

    // Customize content based on description
    this.injectContentFromDescription(customized, description);

    return customized;
  }

  private getDeviceScale(device: string): { width: number; height: number } {
    switch (device) {
      case 'mobile':
        return { width: 0.4, height: 0.8 };
      case 'tablet':
        return { width: 0.7, height: 0.9 };
      case 'desktop':
      default:
        return { width: 1, height: 1 };
    }
  }

  private injectContentFromDescription(template: WireframeTemplate, description: string) {
    const words = description.toLowerCase();
    
    // Update hero content if it mentions specific products/services
    const heroComponent = template.components.find(c => c.type === 'hero');
    if (heroComponent) {
      if (words.includes('ai')) {
        heroComponent.content = 'AI-Powered Solution';
      } else if (words.includes('saas')) {
        heroComponent.content = 'SaaS Platform';
      } else if (words.includes('ecommerce') || words.includes('shop')) {
        heroComponent.content = 'E-commerce Platform';
      }
    }

    // Add more intelligent content injection based on keywords
    // This is where we can add more sophisticated NLP later
  }
}

export default WireframeTemplateService; 
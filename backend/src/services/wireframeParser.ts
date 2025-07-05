import { WireframeComponent } from './huggingface';

export interface ParsedWireframe {
  title: string;
  description: string;
  components: WireframeComponent[];
  layout: 'standard' | 'dashboard' | 'ecommerce' | 'blog' | 'form';
  complexity: 'simple' | 'medium' | 'complex';
}

export interface ComponentMention {
  type: string;
  content?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'main';
  importance: number;
  context: string[];
}

export class WireframeParser {
  
  // Extract components mentioned in the description
  private extractComponents(description: string): ComponentMention[] {
    const text = description.toLowerCase();
    const mentions: ComponentMention[] = [];
    
    // Define component patterns with their keywords and importance
    const componentPatterns = [
      // Navigation
      { keywords: ['header', 'navigation', 'nav', 'menu bar', 'top bar', 'navbar'], type: 'header', position: 'top', importance: 9 },
      { keywords: ['sidebar', 'side menu', 'side nav', 'side panel', 'menu'], type: 'sidebar', position: 'left', importance: 7 },
      { keywords: ['footer', 'bottom'], type: 'footer', position: 'bottom', importance: 6 },
      { keywords: ['breadcrumb', 'breadcrumbs'], type: 'breadcrumb', position: 'top', importance: 4 },
      { keywords: ['tabs', 'tab menu', 'tabbed'], type: 'tabs', position: 'top', importance: 5 },
      
      // Content areas
      { keywords: ['hero', 'hero section', 'main banner', 'landing banner'], type: 'hero', position: 'center', importance: 8 },
      { keywords: ['content', 'main content', 'article', 'post', 'text', 'feed', 'timeline'], type: 'text', position: 'main', importance: 7 },
      { keywords: ['image', 'photo', 'picture', 'gallery', 'avatar', 'profile picture'], type: 'image', position: 'center', importance: 5 },
      { keywords: ['video', 'media', 'player'], type: 'video', position: 'center', importance: 6 },
      { keywords: ['carousel', 'slider', 'slideshow'], type: 'carousel', position: 'center', importance: 6 },
      
      // Interactive elements
      { keywords: ['button', 'call to action', 'cta', 'action button'], type: 'button', position: 'center', importance: 7 },
      { keywords: ['form', 'contact form', 'signup', 'register', 'login', 'booking form'], type: 'form', position: 'center', importance: 8 },
      { keywords: ['search', 'search bar', 'search box'], type: 'search', position: 'top', importance: 6 },
      { keywords: ['input', 'text field', 'input field'], type: 'input', position: 'center', importance: 5 },
      
      // Data display
      { keywords: ['table', 'data table', 'list', 'grid', 'product grid'], type: 'table', position: 'main', importance: 7 },
      { keywords: ['chart', 'graph', 'analytics', 'visualization', 'metrics', 'dashboard'], type: 'chart', position: 'main', importance: 7 },
      { keywords: ['card', 'cards', 'card layout'], type: 'card', position: 'center', importance: 6 },
      { keywords: ['stats', 'statistics', 'metrics', 'numbers', 'real-time'], type: 'stats', position: 'top', importance: 6 },
      
      // E-commerce specific
      { keywords: ['product', 'products', 'items', 'catalog'], type: 'product-card', position: 'main', importance: 8 },
      { keywords: ['cart', 'shopping cart', 'basket'], type: 'shopping-cart', position: 'top', importance: 7 },
      { keywords: ['filter', 'filters', 'search filters'], type: 'filter', position: 'left', importance: 6 },
      { keywords: ['price', 'pricing', 'cost'], type: 'price', position: 'center', importance: 6 },
      
      // Social media specific
      { keywords: ['messaging', 'chat', 'messages', 'inbox'], type: 'text', position: 'main', importance: 8 },
      { keywords: ['profile', 'user profile', 'account'], type: 'card', position: 'center', importance: 7 },
      { keywords: ['notification', 'notifications', 'alerts'], type: 'card', position: 'top', importance: 6 },
      
      // Calendar/booking specific
      { keywords: ['calendar', 'schedule', 'booking', 'appointment'], type: 'chart', position: 'main', importance: 8 },
      { keywords: ['date picker', 'time slot', 'availability'], type: 'input', position: 'center', importance: 7 },
      
      // App-specific
      { keywords: ['app', 'mobile app', 'application'], type: 'container', position: 'main', importance: 5 },
      { keywords: ['platform', 'system', 'tool'], type: 'container', position: 'main', importance: 4 },
      
      // Layout sections
      { keywords: ['section', 'area', 'region', 'block'], type: 'section', position: 'main', importance: 4 },
      { keywords: ['container', 'wrapper', 'layout'], type: 'container', position: 'main', importance: 3 }
    ];
    
    // Find component mentions in the text
    componentPatterns.forEach(pattern => {
      pattern.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          // Extract context around the mention
          const keywordIndex = text.indexOf(keyword);
          const contextStart = Math.max(0, keywordIndex - 30);
          const contextEnd = Math.min(text.length, keywordIndex + keyword.length + 30);
          const context = description.substring(contextStart, contextEnd).split(' ');
          
                      mentions.push({
              type: pattern.type,
              content: this.extractContentForComponent(pattern.type, context),
              position: pattern.position as 'top' | 'bottom' | 'left' | 'right' | 'center' | 'main',
              importance: pattern.importance,
              context
            });
        }
      });
    });
    
    // Remove duplicates and sort by importance
    const uniqueMentions = mentions.filter((mention, index, self) => 
      index === self.findIndex(m => m.type === mention.type)
    );
    
    return uniqueMentions.sort((a, b) => b.importance - a.importance);
  }
  
  // Extract specific content for components based on context
  private extractContentForComponent(type: string, context: string[]): string {
    const contextText = context.join(' ').toLowerCase();
    
    switch (type) {
      case 'header':
        if (contextText.includes('company') || contextText.includes('brand')) return 'Company Header';
        if (contextText.includes('admin') || contextText.includes('dashboard')) return 'Admin Header';
        return 'Main Header';
        
      case 'hero':
        if (contextText.includes('ai') || contextText.includes('artificial')) return 'AI-Powered Solution';
        if (contextText.includes('saas') || contextText.includes('software')) return 'SaaS Platform';
        if (contextText.includes('ecommerce') || contextText.includes('shop')) return 'Online Store';
        return 'Welcome Message';
        
      case 'button':
        if (contextText.includes('signup') || contextText.includes('register')) return 'Sign Up';
        if (contextText.includes('buy') || contextText.includes('purchase')) return 'Buy Now';
        if (contextText.includes('contact')) return 'Contact Us';
        if (contextText.includes('learn')) return 'Learn More';
        return 'Get Started';
        
      case 'form':
        if (contextText.includes('contact')) return 'Contact Form';
        if (contextText.includes('signup') || contextText.includes('register')) return 'Registration Form';
        if (contextText.includes('login')) return 'Login Form';
        return 'Form';
        
      case 'search':
        if (contextText.includes('product')) return 'Search products...';
        if (contextText.includes('article') || contextText.includes('content')) return 'Search articles...';
        return 'Search...';
        
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }
  
  // Determine layout structure based on components
  private determineLayout(mentions: ComponentMention[]): 'standard' | 'dashboard' | 'ecommerce' | 'blog' | 'form' {
    const types = mentions.map(m => m.type);
    
    // Dashboard indicators
    if (types.includes('sidebar') && (types.includes('chart') || types.includes('stats') || types.includes('table'))) {
      return 'dashboard';
    }
    
    // E-commerce indicators
    if (types.includes('product-card') || types.includes('shopping-cart') || types.includes('filter')) {
      return 'ecommerce';
    }
    
    // Blog indicators
    if (types.includes('text') && (types.includes('sidebar') || mentions.some(m => m.context.some(c => c.includes('article') || c.includes('blog'))))) {
      return 'blog';
    }
    
    // Form-heavy layout
    if (types.filter(t => ['form', 'input', 'button'].includes(t)).length >= 2) {
      return 'form';
    }
    
    // Default standard layout
    return 'standard';
  }
  
  // Generate component positions based on layout
  private generatePositions(mentions: ComponentMention[], layout: string): WireframeComponent[] {
    const components: WireframeComponent[] = [];
    let currentY = 0;
    
    // Sort components by logical order
    const sortedMentions = this.sortComponentsByLayout(mentions, layout);
    
    sortedMentions.forEach((mention, index) => {
      const component = this.createComponent(mention, currentY, layout);
      components.push(component);
      currentY += component.height + 2; // Add gap between components
    });
    
    return components;
  }
  
  // Sort components in logical display order
  private sortComponentsByLayout(mentions: ComponentMention[], layout: string): ComponentMention[] {
    const order: Record<string, number> = {
      'header': 0,
      'breadcrumb': 1,
      'search': 2,
      'hero': 3,
      'tabs': 4,
      'sidebar': 5, // Will be positioned differently
      'stats': 6,
      'chart': 7,
      'table': 8,
      'card': 9,
      'product-card': 10,
      'form': 11,
      'text': 12,
      'image': 13,
      'video': 14,
      'button': 15,
      'footer': 99
    };
    
    return mentions.sort((a, b) => (order[a.type] || 50) - (order[b.type] || 50));
  }
  
  // Create individual component with positioning
  private createComponent(mention: ComponentMention, baseY: number, layout: string): WireframeComponent {
    const id = `${mention.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Base dimensions and positions
    let x = 0, y = baseY, width = 100, height = 8;
    
    // Adjust based on component type and layout
    switch (mention.type) {
      case 'header':
        y = 0;
        height = 10;
        break;
        
      case 'sidebar':
        x = 0;
        y = layout === 'dashboard' ? 0 : 12;
        width = layout === 'dashboard' ? 20 : 25;
        height = layout === 'dashboard' ? 100 : 60;
        break;
        
      case 'hero':
        y = mention.position === 'top' ? 12 : baseY;
        height = 35;
        break;
        
      case 'search':
        x = 20;
        width = 60;
        height = 6;
        break;
        
      case 'stats':
        x = layout === 'dashboard' ? 25 : 10;
        width = 15;
        height = 12;
        break;
        
      case 'chart':
        x = layout === 'dashboard' ? 25 : 10;
        width = layout === 'dashboard' ? 50 : 80;
        height = 25;
        break;
        
      case 'table':
        x = layout === 'dashboard' ? 25 : 10;
        width = layout === 'dashboard' ? 70 : 80;
        height = 30;
        break;
        
      case 'form':
        x = 25;
        width = 50;
        height = 40;
        break;
        
      case 'button':
        x = 40;
        width = 20;
        height = 6;
        break;
        
      case 'product-card':
        x = layout === 'ecommerce' && mention.context.some(c => c.includes('sidebar')) ? 25 : 10;
        width = layout === 'ecommerce' ? 70 : 80;
        height = 50;
        break;
        
      case 'filter':
        x = 0;
        width = 20;
        height = 60;
        break;
        
      case 'footer':
        y = 90;
        height = 10;
        break;
        
      default:
        x = 10;
        width = 80;
        height = 15;
    }
    
    // Adjust for sidebar layouts
    if (layout === 'dashboard' && mention.type !== 'sidebar' && mention.type !== 'header') {
      x = Math.max(x, 25); // Push content right of sidebar
      width = Math.min(width, 70); // Reduce width to fit
    }
    
    return {
      id,
      type: mention.type as any,
      x, y, width, height,
      content: mention.content || `${mention.type} content`,
      style: this.generateComponentStyle(mention.type, layout)
    };
  }
  
  // Generate appropriate styling for components
  private generateComponentStyle(type: string, layout: string): Record<string, any> {
    const baseStyles = {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '1rem'
    };
    
    switch (type) {
      case 'header':
        return {
          ...baseStyles,
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e7eb',
          borderRadius: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: '600'
        };
        
      case 'sidebar':
        return {
          ...baseStyles,
          backgroundColor: layout === 'dashboard' ? '#1f2937' : '#f9fafb',
          color: layout === 'dashboard' ? 'white' : '#374151',
          borderRadius: '0',
          borderRight: '1px solid #e5e7eb'
        };
        
      case 'hero':
        return {
          ...baseStyles,
          backgroundColor: '#f8fafc',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: '700',
          padding: '3rem'
        };
        
      case 'button':
        return {
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        };
        
      case 'stats':
        return {
          ...baseStyles,
          textAlign: 'center',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        };
        
      case 'chart':
        return {
          ...baseStyles,
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        };
        
      case 'footer':
        return {
          ...baseStyles,
          backgroundColor: '#1f2937',
          color: 'white',
          borderRadius: '0',
          textAlign: 'center'
        };
        
      default:
        return baseStyles;
    }
  }
  
  // Add fallback components if too few detected
  private addFallbackComponents(mentions: ComponentMention[], description: string): ComponentMention[] {
    const enhancedMentions = [...mentions];
    
    // Always add a header if none exists
    if (!enhancedMentions.some(m => m.type === 'header')) {
      enhancedMentions.push({
        type: 'header',
        content: 'Header',
        position: 'top',
        importance: 9,
        context: ['fallback']
      });
    }
    
    // Add main content area if very few components
    if (enhancedMentions.length < 2) {
      enhancedMentions.push({
        type: 'text',
        content: 'Main Content',
        position: 'main',
        importance: 7,
        context: ['fallback']
      });
    }
    
    // Add navigation for app-like descriptions
    if (description.includes('app') || description.includes('platform')) {
      if (!enhancedMentions.some(m => m.type === 'sidebar')) {
        enhancedMentions.push({
          type: 'sidebar',
          content: 'Navigation',
          position: 'left',
          importance: 7,
          context: ['fallback']
        });
      }
    }
    
    // Add search for ecommerce or social media
    if ((description.includes('shop') || description.includes('social') || description.includes('search')) && 
        !enhancedMentions.some(m => m.type === 'search')) {
      enhancedMentions.push({
        type: 'search',
        content: 'Search',
        position: 'top',
        importance: 6,
        context: ['fallback']
      });
    }
    
    return enhancedMentions;
  }
  
  // Main parsing function
  public parseWireframe(description: string): ParsedWireframe {
    console.log('=== DYNAMIC WIREFRAME GENERATION ===');
    console.log('Input description:', description);
    
    // Extract components from description
    const mentions = this.extractComponents(description);
    console.log('Extracted components:', mentions.map((m: ComponentMention) => ({ type: m.type, content: m.content, importance: m.importance })));
    
    // Add fallback components if too few detected
    const enhancedMentions = this.addFallbackComponents(mentions, description);
    console.log('Enhanced with fallbacks:', enhancedMentions.map((m: ComponentMention) => ({ type: m.type, content: m.content, importance: m.importance })));
    
    // Determine layout
    const layout = this.determineLayout(enhancedMentions);
    console.log('Determined layout:', layout);
    
    // Generate components with positions
    const components = this.generatePositions(enhancedMentions, layout);
    console.log('Generated components:', components.length);
    
    // Determine complexity
    const complexity = mentions.length <= 3 ? 'simple' : mentions.length <= 6 ? 'medium' : 'complex';
    
    return {
      title: `Custom ${layout.charAt(0).toUpperCase() + layout.slice(1)} Wireframe`,
      description: `Dynamically generated wireframe based on: "${description}"`,
      components,
      layout,
      complexity
    };
  }
}

export default WireframeParser; 
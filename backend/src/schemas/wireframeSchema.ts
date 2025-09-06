// Comprehensive JSON schema for wireframe generation
export interface WireframeSchema {
  metadata: {
    title: string;
    description: string;
    pageType: 'landing' | 'dashboard' | 'ecommerce' | 'blog' | 'form' | 'app' | 'other';
    device: 'desktop' | 'tablet' | 'mobile';
    complexity: 'simple' | 'medium' | 'complex';
    theme: 'modern' | 'minimal' | 'corporate' | 'creative' | 'tech';
    colorScheme: 'light' | 'dark' | 'auto';
  };
  layout: {
    type: 'single-column' | 'two-column' | 'three-column' | 'grid' | 'sidebar' | 'dashboard' | 'hero-centered';
    maxWidth: number;
    spacing: 'tight' | 'normal' | 'loose';
    alignment: 'left' | 'center' | 'right' | 'justified';
  };
  components: WireframeComponent[];
  responsive: {
    breakpoints: {
      mobile: { maxWidth: 768; components: ComponentOverride[] };
      tablet: { maxWidth: 1024; components: ComponentOverride[] };
      desktop: { minWidth: 1025; components: ComponentOverride[] };
    };
  };
}

export interface WireframeComponent {
  id: string;
  type: ComponentType;
  position: {
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage
    zIndex: number;
  };
  content: {
    text?: string;
    placeholder?: string;
    icon?: string;
    image?: string;
    link?: string;
  };
  styling: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: string;
    margin?: string;
    fontSize?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
    display?: 'block' | 'flex' | 'grid' | 'inline-block';
    flexDirection?: 'row' | 'column';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    boxShadow?: string;
    opacity?: number;
  };
  behavior: {
    hover?: HoverEffect;
    click?: ClickAction;
    animation?: AnimationType;
  };
  accessibility: {
    ariaLabel?: string;
    role?: string;
    tabIndex?: number;
  };
  children?: WireframeComponent[];
}

export type ComponentType = 
  // Navigation
  | 'header' | 'navbar' | 'sidebar' | 'breadcrumb' | 'tabs' | 'pagination' | 'menu'
  // Content
  | 'hero' | 'text' | 'heading' | 'paragraph' | 'image' | 'video' | 'carousel' | 'gallery' | 'banner'
  // Forms
  | 'form' | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'button' | 'search' | 'datepicker'
  // Data Display
  | 'table' | 'chart' | 'card' | 'list' | 'grid' | 'stats' | 'progress' | 'badge' | 'tag' | 'avatar'
  // Feedback
  | 'modal' | 'alert' | 'tooltip' | 'notification' | 'loading' | 'empty-state' | 'toast'
  // Layout
  | 'container' | 'section' | 'divider' | 'spacer' | 'footer' | 'columns' | 'row'
  // E-commerce
  | 'product-card' | 'shopping-cart' | 'checkout' | 'price' | 'rating' | 'filter' | 'wishlist'
  // Dashboard
  | 'widget' | 'metric' | 'timeline' | 'calendar' | 'profile' | 'settings' | 'dashboard-card'
  // Social
  | 'comment' | 'like' | 'share' | 'follow' | 'feed'
  // Interactive
  | 'accordion' | 'tabs' | 'slider' | 'dropdown' | 'popover' | 'drawer';

export interface HoverEffect {
  scale?: number;
  shadow?: string;
  backgroundColor?: string;
  textColor?: string;
  transform?: string;
}

export interface ClickAction {
  type: 'navigate' | 'modal' | 'toggle' | 'submit' | 'custom';
  target?: string;
  data?: Record<string, any>;
}

export interface AnimationType {
  type: 'fade' | 'slide' | 'scale' | 'bounce' | 'pulse' | 'none';
  duration?: number;
  delay?: number;
  direction?: 'in' | 'out' | 'both';
}

export interface ComponentOverride {
  componentId: string;
  position?: Partial<WireframeComponent['position']>;
  styling?: Partial<WireframeComponent['styling']>;
  content?: Partial<WireframeComponent['content']>;
}

// Validation schema for LLM output
export const WIREFRAME_SCHEMA_VALIDATION = {
  type: "object",
  required: ["metadata", "layout", "components"],
  properties: {
    metadata: {
      type: "object",
      required: ["title", "pageType", "device"],
      properties: {
        title: { type: "string", minLength: 1, maxLength: 100 },
        description: { type: "string", maxLength: 500 },
        pageType: { 
          type: "string", 
          enum: ["landing", "dashboard", "ecommerce", "blog", "form", "app", "other"] 
        },
        device: { 
          type: "string", 
          enum: ["desktop", "tablet", "mobile"] 
        },
        complexity: { 
          type: "string", 
          enum: ["simple", "medium", "complex"] 
        },
        theme: { 
          type: "string", 
          enum: ["modern", "minimal", "corporate", "creative", "tech"] 
        }
      }
    },
    layout: {
      type: "object",
      required: ["type"],
      properties: {
        type: { 
          type: "string", 
          enum: ["single-column", "two-column", "three-column", "grid", "sidebar", "dashboard", "hero-centered"] 
        },
        maxWidth: { type: "number", minimum: 320, maximum: 1920 },
        spacing: { 
          type: "string", 
          enum: ["tight", "normal", "loose"] 
        }
      }
    },
    components: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["id", "type", "position"],
        properties: {
          id: { type: "string", pattern: "^[a-zA-Z0-9_-]+$" },
          type: { type: "string" },
          position: {
            type: "object",
            required: ["x", "y", "width", "height"],
            properties: {
              x: { type: "number", minimum: 0, maximum: 100 },
              y: { type: "number", minimum: 0, maximum: 100 },
              width: { type: "number", minimum: 1, maximum: 100 },
              height: { type: "number", minimum: 1, maximum: 100 },
              zIndex: { type: "number", minimum: 0 }
            }
          }
        }
      }
    }
  }
};

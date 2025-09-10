import { PaletteItem, ComponentType } from '../types/wireframeBuilder';

// Default component palette items
export const COMPONENT_PALETTE: PaletteItem[] = [
  {
    type: 'header',
    label: 'Header',
    icon: '📋',
    description: 'Navigation header with logo and menu',
    defaultContent: {
      text: 'Header',
      placeholder: 'Logo | Navigation | Search | Cart'
    },
    defaultStyling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      border: '1px solid #d0d0d0',
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: 'normal',
      textAlign: 'center'
    },
    defaultSize: { width: 100, height: 8 }
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: '🦶',
    description: 'Page footer with links and information',
    defaultContent: {
      text: 'Footer',
      placeholder: 'Copyright | Links | Social Media'
    },
    defaultStyling: {
      backgroundColor: '#f0f0f0',
      textColor: '#666666',
      border: '1px solid #d0d0d0',
      padding: '1rem',
      fontSize: '0.875rem',
      fontWeight: 'normal',
      textAlign: 'center'
    },
    defaultSize: { width: 100, height: 8 }
  },
  {
    type: 'button',
    label: 'Button',
    icon: '🔘',
    description: 'Interactive button element',
    defaultContent: {
      text: 'Button',
      placeholder: 'Click Me'
    },
    defaultStyling: {
      backgroundColor: '#f0f0f0',
      textColor: '#000000',
      border: '1px solid #000000',
      borderRadius: 4,
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      textAlign: 'center',
      cursor: 'pointer'
    },
    defaultSize: { width: 20, height: 5 }
  },
  {
    type: 'text',
    label: 'Text',
    icon: '📝',
    description: 'Text content block',
    defaultContent: {
      text: 'Text',
      placeholder: 'Lorem ipsum dolor sit amet'
    },
    defaultStyling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: 'normal',
      textAlign: 'left'
    },
    defaultSize: { width: 40, height: 10 }
  },
  {
    type: 'image',
    label: 'Image',
    icon: '🖼️',
    description: 'Image placeholder',
    defaultContent: {
      text: 'Image',
      placeholder: 'Image Placeholder'
    },
    defaultStyling: {
      backgroundColor: '#f0f0f0',
      textColor: '#666666',
      border: '1px solid #d0d0d0',
      textAlign: 'center',
      padding: '2rem',
      fontSize: '1rem',
      fontWeight: 'normal'
    },
    defaultSize: { width: 30, height: 20 }
  },
  {
    type: 'card',
    label: 'Card',
    icon: '🃏',
    description: 'Content card container',
    defaultContent: {
      text: 'Card',
      placeholder: 'Card Title\nCard Description\nCard Content'
    },
    defaultStyling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      border: '1px solid #d0d0d0',
      borderRadius: 8,
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: 'normal'
    },
    defaultSize: { width: 25, height: 20 }
  },
  {
    type: 'form',
    label: 'Form',
    icon: '📋',
    description: 'Form with input fields',
    defaultContent: {
      text: 'Form',
      placeholder: 'Name: [Input Field]\nEmail: [Input Field]\nMessage: [Text Area]\n[Submit Button]'
    },
    defaultStyling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      border: '1px solid #d0d0d0',
      borderRadius: 4,
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: 'normal'
    },
    defaultSize: { width: 35, height: 25 }
  },
  {
    type: 'navigation',
    label: 'Navigation',
    icon: '🧭',
    description: 'Navigation menu',
    defaultContent: {
      text: 'Navigation',
      placeholder: 'Home | About | Services | Contact'
    },
    defaultStyling: {
      backgroundColor: '#f0f0f0',
      textColor: '#000000',
      border: '1px solid #d0d0d0',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      fontWeight: 'normal',
      textAlign: 'center'
    },
    defaultSize: { width: 100, height: 6 }
  },
  {
    type: 'hero',
    label: 'Hero Section',
    icon: '🎯',
    description: 'Hero banner section',
    defaultContent: {
      text: 'Hero',
      placeholder: 'Hero Title\nHero Description\n[Call to Action Button]'
    },
    defaultStyling: {
      backgroundColor: '#f8f8f8',
      textColor: '#000000',
      textAlign: 'center',
      padding: '3rem 2rem',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    defaultSize: { width: 100, height: 30 }
  },
  {
    type: 'sidebar',
    label: 'Sidebar',
    icon: '📑',
    description: 'Side navigation panel',
    defaultContent: {
      text: 'Sidebar',
      placeholder: 'Menu Item 1\nMenu Item 2\nMenu Item 3\nMenu Item 4'
    },
    defaultStyling: {
      backgroundColor: '#f0f0f0',
      textColor: '#000000',
      border: '1px solid #d0d0d0',
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: 'normal'
    },
    defaultSize: { width: 20, height: 60 }
  }
];

// Component categories for organized palette
export const COMPONENT_CATEGORIES = {
  layout: ['header', 'footer', 'sidebar', 'hero', 'container', 'section'],
  content: ['text', 'image', 'card', 'list', 'table'],
  interactive: ['button', 'form', 'navigation', 'modal', 'dropdown'],
  data: ['chart', 'table', 'metric', 'widget'],
  ecommerce: ['product-card', 'shopping-cart', 'checkout', 'price', 'rating'],
  social: ['comment', 'like', 'share', 'follow', 'feed'],
  ui: ['alert', 'modal', 'accordion', 'tabs', 'slider', 'popover']
} as const;

// Default grid configuration
export const DEFAULT_GRID_CONFIG = {
  size: 20,
  snapToGrid: true,
  showGrid: true,
  color: '#e0e0e0',
  opacity: 0.5
};

// Canvas dimensions for different devices
export const DEVICE_DIMENSIONS = {
  desktop: { width: 1200, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
} as const;

// Default component styling
export const DEFAULT_COMPONENT_STYLING = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  borderColor: '#d0d0d0',
  borderRadius: 0,
  padding: '1rem',
  margin: '0',
  fontSize: '1rem',
  fontWeight: 'normal' as const,
  textAlign: 'left' as const,
  display: 'block' as const,
  border: '1px solid #d0d0d0'
};

// Helper function to get component by type
export const getComponentByType = (type: ComponentType): PaletteItem | undefined => {
  return COMPONENT_PALETTE.find(component => component.type === type);
};

// Helper function to get components by category
export const getComponentsByCategory = (category: keyof typeof COMPONENT_CATEGORIES): PaletteItem[] => {
  const types = COMPONENT_CATEGORIES[category] as readonly ComponentType[];
  return COMPONENT_PALETTE.filter(component => types.includes(component.type));
};

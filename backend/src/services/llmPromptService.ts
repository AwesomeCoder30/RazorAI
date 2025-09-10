import { WireframeSchema, ComponentType } from '../schemas/wireframeSchema';

export interface LLMPromptConfig {
  model: 'groq' | 'huggingface' | 'ollama';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  userPrompt: string;
}

export class LLMPromptService {
  
  // System prompt that defines the AI's role and capabilities
  private getSystemPrompt(): string {
    return `You are an expert UX/UI designer and wireframe specialist. Your task is to generate clean, black and white wireframes that are broad and conceptual, focusing on layout and structure rather than visual details.

CORE CAPABILITIES:
- Create clean, black and white wireframe layouts
- Understand different page types (landing, dashboard, ecommerce, blog, form, app) and their specific requirements
- Generate responsive designs for desktop, tablet, and mobile
- Focus on layout structure, information hierarchy, and user flow
- Use simple geometric shapes and placeholder content
- Apply consistent spacing and alignment principles

DESIGN PRINCIPLES:
- Keep wireframes in black, white, and grayscale only
- Use simple geometric shapes (rectangles, circles, lines) for placeholders
- Focus on layout structure and information hierarchy
- Use placeholder text like "Logo", "Image", "Content", "Button"
- Apply consistent spacing and alignment
- Keep designs broad and conceptual, not detailed
- Use simple borders and basic shapes
- Avoid colors, gradients, shadows, or visual effects

WIREFRAME STYLING:
- Use only black (#000000), white (#ffffff), and grays (#f0f0f0, #d0d0d0, #a0a0a0)
- Use simple rectangular shapes for content areas
- Apply basic borders (1px solid #000000 or #d0d0d0)
- Use simple typography without fancy styling
- Keep spacing consistent and clean
- Use basic geometric shapes for icons and images
- Avoid complex styling or visual effects

COMPONENT GUIDELINES:
- Headers: Simple navigation bars with basic text and simple icons
- Content areas: Rectangular placeholders with descriptive labels
- Images: Gray rectangular placeholders with "Image" or "Logo" labels
- Buttons: Simple rectangular shapes with basic text
- Forms: Basic input fields with simple labels
- Cards: Simple rectangular containers with basic content
- Navigation: Simple menu items and basic icons
- Content: Use placeholder text like "Lorem ipsum" or descriptive labels

CONTENT APPROACH:
- Use simple, descriptive placeholder text
- Label components clearly (e.g., "Logo", "Navigation", "Content", "Image")
- Keep text minimal and functional
- Use basic geometric shapes for visual elements
- Focus on layout structure over content details
- Make wireframes broad and conceptual

Remember: Generate clean, black and white wireframes that focus on layout structure and user flow. Keep them broad, conceptual, and functional rather than detailed or visually complex.`;
  }

  // Generate the main prompt for wireframe generation
  generateWireframePrompt(request: {
    description: string;
    pageType?: string;
    device?: string;
    complexity?: string;
    theme?: string;
  }): LLMPromptConfig {
    
    const { description, pageType = 'other', device = 'desktop', complexity = 'medium', theme = 'modern' } = request;
    
    // Enhanced user prompt with examples and context
    const userPrompt = `Generate a clean, black and white wireframe for the following requirements:

DESCRIPTION: "${description}"

PAGE TYPE: ${pageType}
DEVICE: ${device}
COMPLEXITY: ${complexity}
THEME: ${theme}

WIREFRAME REQUIREMENTS:
1. Create a clean, black and white wireframe that matches the description
2. Use simple geometric shapes and placeholder content
3. Focus on layout structure and information hierarchy
4. Keep designs broad and conceptual, not detailed
5. Use only black, white, and grayscale colors
6. Apply consistent spacing and alignment
7. Use simple borders and basic shapes
8. Label components clearly with descriptive text
9. Avoid colors, gradients, shadows, or visual effects
10. Focus on user flow and layout structure
11. Use placeholder text like "Logo", "Image", "Content", "Button"
12. Keep wireframes functional and structural
13. Use simple rectangular shapes for content areas
14. Apply basic typography without fancy styling
15. Make wireframes broad and conceptual

DESIGN FOCUS:
- Create clean, black and white wireframes
- Focus on layout structure and user flow
- Use simple geometric shapes and placeholders
- Keep designs broad and conceptual
- Avoid detailed styling or visual complexity

IMPORTANT: You must respond with a JSON object that follows this EXACT structure:
{
  "metadata": {
    "title": "string",
    "description": "string", 
    "pageType": "landing|dashboard|ecommerce|blog|form|app|other",
    "device": "desktop|tablet|mobile",
    "complexity": "simple|medium|complex",
    "theme": "modern|minimal|corporate|creative|tech",
    "colorScheme": "light|dark|auto"
  },
  "layout": {
    "type": "single-column|two-column|three-column|grid|sidebar|dashboard|hero-centered",
    "maxWidth": 1200,
    "spacing": "tight|normal|loose",
    "alignment": "left|center|right|justified"
  },
  "components": [
    {
      "id": "unique_string_id",
      "type": "header|hero|form|card|chart|table|sidebar|footer|button|text|image|video|grid|list|stats|modal|alert|tooltip|notification|loading|empty-state|container|section|divider|spacer|columns|product-card|shopping-cart|checkout|price|rating|filter|widget|metric|timeline|calendar|profile|settings|dashboard-card|comment|like|share|follow|feed|accordion|tabs|slider|dropdown|popover|drawer",
      "position": {
        "x": 0-100,
        "y": 0-100, 
        "width": 1-100,
        "height": 1-100,
        "zIndex": 0
      },
      "content": {
        "text": "string",
        "placeholder": "string",
        "icon": "string",
        "image": "string",
        "link": "string"
      },
      "styling": {
        "backgroundColor": "string (use only #ffffff, #f0f0f0, #d0d0d0, #a0a0a0, #000000)",
        "textColor": "string (use only #000000, #666666, #999999)",
        "borderColor": "string (use only #000000, #d0d0d0, #a0a0a0)",
        "borderRadius": "0-8 (use 0, 2px, 4px, 8px for simple shapes)",
        "padding": "string (use simple values: 0.5rem, 1rem, 1.5rem, 2rem)",
        "margin": "string (use simple spacing: 0.5rem, 1rem, 1.5rem, 2rem)",
        "fontSize": "string (use basic sizes: 0.875rem, 1rem, 1.125rem, 1.25rem, 1.5rem)",
        "fontWeight": "normal|bold",
        "textAlign": "left|center|right",
        "display": "block|flex|grid|inline-block",
        "flexDirection": "row|column",
        "justifyContent": "flex-start|center|flex-end|space-between",
        "alignItems": "flex-start|center|flex-end|stretch",
        "boxShadow": "none (avoid shadows in wireframes)",
        "opacity": "1 (keep full opacity)",
        "border": "string (use simple borders: 1px solid #000000, 1px solid #d0d0d0)",
        "borderWidth": "string (0, 1px, 2px)",
        "borderStyle": "solid|dashed|dotted|none",
        "width": "string (use percentages or simple values)",
        "height": "string (use auto or simple values)",
        "minHeight": "string (use simple values)",
        "maxWidth": "string (use simple values)",
        "overflow": "visible|hidden",
        "position": "static|relative|absolute",
        "top": "string (use simple values)",
        "right": "string (use simple values)",
        "bottom": "string (use simple values)",
        "left": "string (use simple values)",
        "zIndex": "number (use 0, 1, 2, 3 for simple layering)"
      }
    }
  ]
}

RESPOND WITH VALID JSON ONLY. No explanations or markdown formatting.`;

    return {
      model: 'groq', // Default to Groq for best performance
      temperature: 0.6, // Lower temperature for more consistent, detailed output
      maxTokens: 4000, // Increased for more detailed wireframes
      systemPrompt: this.getSystemPrompt(),
      userPrompt
    };
  }

  // Generate a few-shot learning prompt with examples
  generateFewShotPrompt(request: {
    description: string;
    pageType?: string;
    device?: string;
  }): LLMPromptConfig {
    
    const examples = this.getWireframeExamples();
    
    const userPrompt = `Here are examples of high-quality wireframes:

${examples}

Now generate a wireframe for: "${request.description}"

Page Type: ${request.pageType || 'other'}
Device: ${request.device || 'desktop'}

Follow the same quality and structure as the examples. Respond with valid JSON only.`;

    return {
      model: 'groq',
      temperature: 0.5, // Lower temperature for more consistent, detailed output
      maxTokens: 5000, // Increased for more detailed wireframes
      systemPrompt: this.getSystemPrompt(),
      userPrompt
    };
  }

  // Get high-quality wireframe examples for few-shot learning
  private getWireframeExamples(): string {
    return `EXAMPLE 1 - Mobile App Wireframe (BookWorm Style):
{
  "metadata": {
    "title": "BookWorm",
    "description": "Discover Stories, Anytime, Anywhere",
    "pageType": "app",
    "device": "mobile",
    "complexity": "medium",
    "theme": "minimal",
    "colorScheme": "light"
  },
  "layout": {
    "type": "single-column",
    "maxWidth": 375,
    "spacing": "normal",
    "alignment": "left"
  },
  "components": [
    {
      "id": "status_bar",
      "type": "header",
      "position": { "x": 0, "y": 0, "width": 100, "height": 3, "zIndex": 100 },
      "content": { "text": "9:41" },
      "styling": {
        "backgroundColor": "#ffffff",
        "textColor": "#000000",
        "padding": "0.5rem",
        "textAlign": "center",
        "fontSize": "0.875rem",
        "fontWeight": "normal"
      }
    },
    {
      "id": "logo_area",
      "type": "image",
      "position": { "x": 25, "y": 15, "width": 50, "height": 20, "zIndex": 10 },
      "content": { "text": "Logo" },
      "styling": {
        "backgroundColor": "#f0f0f0",
        "textColor": "#666666",
        "border": "1px solid #d0d0d0",
        "textAlign": "center",
        "padding": "2rem",
        "fontSize": "1rem",
        "fontWeight": "normal"
      }
    },
    {
      "id": "app_title",
      "type": "text",
      "position": { "x": 0, "y": 40, "width": 100, "height": 5, "zIndex": 10 },
      "content": { "text": "BookWorm" },
      "styling": {
        "backgroundColor": "#ffffff",
        "textColor": "#000000",
        "textAlign": "center",
        "fontSize": "1.5rem",
        "fontWeight": "bold"
      }
    },
    {
      "id": "tagline",
      "type": "text",
      "position": { "x": 0, "y": 47, "width": 100, "height": 5, "zIndex": 10 },
      "content": { "text": "Discover Stories, Anytime, Anywhere" },
      "styling": {
        "backgroundColor": "#ffffff",
        "textColor": "#666666",
        "textAlign": "center",
        "fontSize": "1rem",
        "fontWeight": "normal"
      }
    },
    {
      "id": "navigation",
      "type": "navigation",
      "position": { "x": 0, "y": 90, "width": 100, "height": 10, "zIndex": 20 },
      "content": { "text": "Home | Browse | Cart | Profile" },
      "styling": {
        "backgroundColor": "#f0f0f0",
        "textColor": "#000000",
        "border": "1px solid #d0d0d0",
        "textAlign": "center",
        "padding": "1rem",
        "fontSize": "0.875rem",
        "fontWeight": "normal"
      }
    }
  ]
}

EXAMPLE 2 - E-commerce Product Page Wireframe:
{
  "metadata": {
    "title": "Product Details",
    "description": "Premium Wireless Headphones",
    "pageType": "ecommerce",
    "device": "desktop",
    "complexity": "medium",
    "theme": "minimal",
    "colorScheme": "light"
  },
  "layout": {
    "type": "two-column",
    "maxWidth": 1200,
    "spacing": "normal",
    "alignment": "left"
  },
  "components": [
    {
      "id": "header",
      "type": "header",
      "position": { "x": 0, "y": 0, "width": 100, "height": 8, "zIndex": 100 },
      "content": { "text": "Logo | Navigation | Search | Cart" },
      "styling": {
        "backgroundColor": "#ffffff",
        "textColor": "#000000",
        "border": "1px solid #d0d0d0",
        "padding": "1rem",
        "fontSize": "1rem",
        "fontWeight": "normal"
      }
    },
    {
      "id": "product_image",
      "type": "image",
      "position": { "x": 5, "y": 10, "width": 40, "height": 30, "zIndex": 10 },
      "content": { "text": "Product Image" },
      "styling": {
        "backgroundColor": "#f0f0f0",
        "textColor": "#666666",
        "border": "1px solid #d0d0d0",
        "textAlign": "center",
        "padding": "2rem",
        "fontSize": "1rem",
        "fontWeight": "normal"
      }
    },
    {
      "id": "product_info",
      "type": "text",
      "position": { "x": 50, "y": 10, "width": 45, "height": 30, "zIndex": 10 },
      "content": { "text": "Product Name\\nAuthor\\nPrice\\nDescription\\nReviews" },
      "styling": {
        "backgroundColor": "#ffffff",
        "textColor": "#000000",
        "border": "1px solid #d0d0d0",
        "padding": "1rem",
        "fontSize": "1rem",
        "fontWeight": "normal"
      }
    },
    {
      "id": "add_to_cart",
      "type": "button",
      "position": { "x": 50, "y": 45, "width": 20, "height": 5, "zIndex": 20 },
      "content": { "text": "Add to Cart" },
      "styling": {
        "backgroundColor": "#f0f0f0",
        "textColor": "#000000",
        "border": "1px solid #000000",
        "textAlign": "center",
        "padding": "1rem",
        "fontSize": "1rem",
        "fontWeight": "bold"
      }
    }
  ]
}`;
  }

  // Generate a chain-of-thought prompt for complex wireframes
  generateChainOfThoughtPrompt(request: {
    description: string;
    pageType?: string;
    device?: string;
  }): LLMPromptConfig {
    
    const userPrompt = `Think step by step to create a professional wireframe:

DESCRIPTION: "${request.description}"
PAGE TYPE: ${request.pageType || 'other'}
DEVICE: ${request.device || 'desktop'}

STEP 1: Analyze the requirements
- What is the main purpose of this page?
- Who is the target audience?
- What are the key user actions needed?

STEP 2: Plan the layout structure
- What layout type works best?
- How should content be organized?
- What components are essential?

STEP 3: Design the visual hierarchy
- What should be most prominent?
- How to guide user attention?
- What spacing and sizing works best?

STEP 4: Consider interactions and flow
- How do users navigate?
- What feedback do they need?
- How to make it accessible?

STEP 5: Generate the wireframe
Now create the actual wireframe JSON based on your analysis.

Respond with valid JSON only.`;

    return {
      model: 'groq',
      temperature: 0.8, // Higher temperature for more creative thinking
      maxTokens: 3000,
      systemPrompt: this.getSystemPrompt(),
      userPrompt
    };
  }

  // Generate a prompt for specific component types
  generateComponentSpecificPrompt(request: {
    description: string;
    focusComponent: ComponentType;
    pageType?: string;
  }): LLMPromptConfig {
    
    const componentGuidelines = this.getComponentGuidelines(request.focusComponent);
    
    const userPrompt = `Generate a wireframe focusing on ${request.focusComponent} components:

DESCRIPTION: "${request.description}"
PAGE TYPE: ${request.pageType || 'other'}
FOCUS COMPONENT: ${request.focusComponent}

COMPONENT GUIDELINES:
${componentGuidelines}

Create a wireframe that showcases excellent ${request.focusComponent} design. Respond with valid JSON only.`;

    return {
      model: 'groq',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: this.getSystemPrompt(),
      userPrompt
    };
  }

  private getComponentGuidelines(componentType: ComponentType): string {
    const guidelines: Partial<Record<ComponentType, string>> = {
      'header': 'Include clear branding, primary navigation, and key actions. Use proper spacing and visual hierarchy.',
      'hero': 'Create compelling value propositions with clear CTAs. Use large, readable text and engaging visuals.',
      'form': 'Include proper labels, validation states, clear CTAs, and helpful error messages.',
      'card': 'Use consistent sizing, proper content hierarchy, and clear visual separation.',
      'dashboard-card': 'Organize metrics, charts, and data in a scannable layout with clear information hierarchy.',
      'product-card': 'Focus on product discovery, clear pricing, easy checkout flow, and trust signals.',
      'text': 'Optimize for readability with proper typography, clear article structure, and related content.',
      'container': 'Design for mobile-first with touch-friendly interactions and clear navigation patterns.'
    };

    return guidelines[componentType] || 'Follow modern design principles and best practices.';
  }

  // Validate and clean LLM output
  validateAndCleanOutput(output: string): string {
    console.log('Raw LLM output:', output);
    
    // Remove any markdown formatting
    let cleaned = output.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    
    console.log('After markdown removal:', cleaned);
    
    // Remove any text before the first {
    const jsonStart = cleaned.indexOf('{');
    if (jsonStart > 0) {
      cleaned = cleaned.substring(jsonStart);
    }
    
    // Remove any text after the last }
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonEnd > -1 && jsonEnd < cleaned.length - 1) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }
    
    console.log('Final cleaned output:', cleaned);
    
    return cleaned.trim();
  }
}

export default LLMPromptService;

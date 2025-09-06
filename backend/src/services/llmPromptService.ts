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
    return `You are an expert UX/UI designer and wireframe specialist. Your task is to generate detailed, professional wireframes based on user descriptions.

CORE CAPABILITIES:
- Create modern, user-friendly wireframe layouts
- Understand different page types (landing, dashboard, ecommerce, blog, form, app)
- Generate responsive designs for desktop, tablet, and mobile
- Apply appropriate spacing, typography, and visual hierarchy
- Consider accessibility and usability best practices

DESIGN PRINCIPLES:
- Use modern design patterns and current UI trends
- Ensure proper visual hierarchy with clear content organization
- Apply consistent spacing and alignment
- Consider user flow and interaction patterns
- Make designs accessible and inclusive

OUTPUT FORMAT:
You must respond with a valid JSON object that follows the exact schema provided. The JSON should be complete, valid, and ready for parsing.

COMPONENT GUIDELINES:
- Headers: Include navigation, branding, and key actions
- Hero sections: Make them compelling with clear value propositions
- Forms: Include proper labels, validation states, and clear CTAs
- Cards: Use consistent sizing and proper content hierarchy
- Navigation: Make it intuitive and accessible
- Content: Organize with proper headings and readable text blocks

Remember: Generate wireframes that look professional and modern, not basic or placeholder-like.`;
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
    const userPrompt = `Generate a professional wireframe for the following requirements:

DESCRIPTION: "${description}"

PAGE TYPE: ${pageType}
DEVICE: ${device}
COMPLEXITY: ${complexity}
THEME: ${theme}

REQUIREMENTS:
1. Create a modern, professional wireframe that matches the description
2. Use appropriate components for the page type
3. Ensure proper visual hierarchy and spacing
4. Make it responsive and accessible
5. Include realistic content, not placeholder text
6. Apply modern design patterns

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
        "backgroundColor": "string",
        "textColor": "string",
        "borderColor": "string",
        "borderRadius": 0-20,
        "padding": "string",
        "margin": "string",
        "fontSize": "string",
        "fontWeight": "normal|medium|semibold|bold",
        "textAlign": "left|center|right",
        "display": "block|flex|grid|inline-block",
        "flexDirection": "row|column",
        "justifyContent": "flex-start|center|flex-end|space-between|space-around",
        "alignItems": "flex-start|center|flex-end|stretch",
        "boxShadow": "string",
        "opacity": 0-1
      }
    }
  ]
}

RESPOND WITH VALID JSON ONLY. No explanations or markdown formatting.`;

    return {
      model: 'groq', // Default to Groq for best performance
      temperature: 0.7,
      maxTokens: 2000,
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
      temperature: 0.6, // Lower temperature for more consistent output
      maxTokens: 2500,
      systemPrompt: this.getSystemPrompt(),
      userPrompt
    };
  }

  // Get high-quality wireframe examples for few-shot learning
  private getWireframeExamples(): string {
    return `EXAMPLE 1 - Modern SaaS Landing Page:
{
  "metadata": {
    "title": "AI-Powered Analytics Dashboard",
    "description": "Revolutionary analytics platform for modern businesses",
    "pageType": "landing",
    "device": "desktop",
    "complexity": "medium",
    "theme": "modern",
    "colorScheme": "light"
  },
  "layout": {
    "type": "single-column",
    "maxWidth": 1200,
    "spacing": "normal",
    "alignment": "center"
  },
  "components": [
    {
      "id": "header_main",
      "type": "header",
      "position": { "x": 0, "y": 0, "width": 100, "height": 8, "zIndex": 100 },
      "content": { "text": "AnalyticsAI" },
      "styling": {
        "backgroundColor": "#ffffff",
        "textColor": "#1f2937",
        "padding": "1rem 2rem",
        "display": "flex",
        "justifyContent": "space-between",
        "alignItems": "center",
        "boxShadow": "0 1px 3px rgba(0,0,0,0.1)"
      }
    },
    {
      "id": "hero_section",
      "type": "hero",
      "position": { "x": 0, "y": 8, "width": 100, "height": 40, "zIndex": 10 },
      "content": { 
        "text": "Transform Your Data Into Actionable Insights",
        "placeholder": "Advanced AI analytics for modern businesses"
      },
      "styling": {
        "backgroundColor": "#f8fafc",
        "textColor": "#1f2937",
        "textAlign": "center",
        "padding": "4rem 2rem",
        "fontSize": "3rem",
        "fontWeight": "bold"
      }
    }
  ]
}

EXAMPLE 2 - E-commerce Product Page:
{
  "metadata": {
    "title": "Premium Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "pageType": "ecommerce",
    "device": "desktop",
    "complexity": "medium",
    "theme": "modern"
  },
  "layout": {
    "type": "two-column",
    "maxWidth": 1200,
    "spacing": "normal"
  },
  "components": [
    {
      "id": "product_image",
      "type": "image",
      "position": { "x": 0, "y": 10, "width": 50, "height": 60, "zIndex": 10 },
      "content": { "image": "product-hero.jpg" },
      "styling": {
        "backgroundColor": "#f9fafb",
        "borderRadius": "8px",
        "padding": "2rem"
      }
    },
    {
      "id": "product_info",
      "type": "card",
      "position": { "x": 55, "y": 10, "width": 40, "height": 60, "zIndex": 10 },
      "content": { 
        "text": "Premium Wireless Headphones",
        "placeholder": "Experience crystal clear audio with our latest noise-canceling technology"
      },
      "styling": {
        "backgroundColor": "#ffffff",
        "padding": "2rem",
        "borderRadius": "8px",
        "boxShadow": "0 4px 6px rgba(0,0,0,0.1)"
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

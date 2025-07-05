import { HfInference } from '@huggingface/inference';
import WireframeParser from './wireframeParser';

export interface WireframeGenerationRequest {
  description: string;
  pageType?: 'landing' | 'dashboard' | 'form' | 'blog' | 'ecommerce' | 'other';
  device?: 'desktop' | 'tablet' | 'mobile';
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface WireframeComponent {
  id: string;
  type: 'header' | 'navbar' | 'sidebar' | 'breadcrumb' | 'tabs' | 'pagination' |
        'hero' | 'text' | 'heading' | 'paragraph' | 'image' | 'video' | 'carousel' | 'gallery' |
        'form' | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'button' | 'search' |
        'table' | 'chart' | 'card' | 'list' | 'grid' | 'stats' | 'progress' | 'badge' |
        'modal' | 'alert' | 'tooltip' | 'notification' | 'loading' | 'empty-state' |
        'container' | 'section' | 'divider' | 'spacer' | 'footer' | 'columns' |
        'product-card' | 'shopping-cart' | 'checkout' | 'price' | 'rating' | 'filter' |
        'widget' | 'metric' | 'timeline' | 'calendar' | 'profile' | 'settings' | 'navigation';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: Record<string, any>;
}

export interface WireframeGenerationResponse {
  success: boolean;
  wireframe?: {
    id: string;
    title: string;
    description: string;
    components: WireframeComponent[];
    device: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
  error?: string;
}

class HuggingFaceService {
  private hf: HfInference;
  private wireframeParser: WireframeParser;

  constructor() {
    this.hf = new HfInference(process.env.HUGGING_FACE_API_KEY || '');
    this.wireframeParser = new WireframeParser();
  }

  private hasApiKey(): boolean {
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    return !!(apiKey && apiKey.length > 0);
  }

  async generateWireframe(request: WireframeGenerationRequest): Promise<WireframeGenerationResponse> {
    try {
      if (!this.hasApiKey()) {
        console.log('No API key found, using mock wireframe');
        return this.getMockWireframe(request);
      }

      console.log('Using Hugging Face API for wireframe generation');
      
      // Create a prompt for wireframe generation
      const prompt = this.createWireframePrompt(request);
      
      // Use a text generation model (we'll use Llama or similar)
      const result = await this.hf.textGeneration({
        model: 'meta-llama/Llama-2-7b-chat-hf',
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          repetition_penalty: 1.2,
        },
      });

      console.log('Hugging Face API response received');

      // Parse the generated text into wireframe components
      const wireframe = this.parseWireframeResponse(result.generated_text, request);

      return {
        success: true,
        wireframe,
      };
    } catch (error) {
      console.error('Error generating wireframe:', error);
      
      // If API fails, fallback to mock wireframe
      console.log('Falling back to mock wireframe due to error');
      return this.getMockWireframe(request);
    }
  }

  private createWireframePrompt(request: WireframeGenerationRequest): string {
    const { description, pageType = 'other', device = 'desktop', complexity = 'medium' } = request;
    
    return `Create a wireframe layout for a ${pageType} page with the following requirements:
    
Description: ${description}
Device: ${device}
Complexity: ${complexity}

Please generate a structured wireframe with components including headers, navigation, content sections, buttons, forms, and footers as appropriate. 

Format the response as a JSON structure with components, each having:
- type: component type (header, navigation, hero, button, text, image, form, input, card, footer, sidebar, section)
- position: x, y coordinates
- dimensions: width, height
- content: relevant text content

Start your response with "WIREFRAME_JSON:" followed by the JSON structure.`;
  }

  private parseWireframeResponse(generatedText: string, request: WireframeGenerationRequest): any {
    try {
      // Try to extract JSON from the generated text
      const jsonMatch = generatedText.match(/WIREFRAME_JSON:\s*({.*})/s);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[1]);
        return {
          id: `wireframe_${Date.now()}`,
          title: `${request.pageType || 'Custom'} Wireframe`,
          description: request.description,
          components: parsedData.components || [],
          device: request.device || 'desktop',
          dimensions: this.getDeviceDimensions(request.device || 'desktop'),
        };
      }
    } catch (error) {
      console.error('Error parsing wireframe response:', error);
    }

    // Fallback to mock wireframe if parsing fails
    return this.getMockWireframe(request).wireframe;
  }

  private getMockWireframe(request: WireframeGenerationRequest): WireframeGenerationResponse {
    // Use the dynamic parser to generate wireframe from description
    const parsedWireframe = this.wireframeParser.parseWireframe(request.description);

    const dimensions = this.getDeviceDimensions(request.device || 'desktop');

    return {
      success: true,
      wireframe: {
        id: `wireframe_${Date.now()}`,
        title: parsedWireframe.title,
        description: parsedWireframe.description,
        components: parsedWireframe.components,
        device: request.device || 'desktop',
        dimensions,
      },
    };
  }

  private getDeviceDimensions(device: string): { width: number; height: number } {
    switch (device) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
      default:
        return { width: 1200, height: 800 };
    }
  }

  async getAvailableModels(): Promise<{ models: string[]; status: string }> {
    try {
      if (!this.hasApiKey()) {
        return {
          models: ['Mock Model (No API Key)'],
          status: 'mock',
        };
      }

      return {
        models: [
          'meta-llama/Llama-2-7b-chat-hf',
          'mistralai/Mistral-7B-Instruct-v0.1',
          'microsoft/DialoGPT-medium',
        ],
        status: 'active',
      };
    } catch (error) {
      console.error('Error fetching models:', error);
      return {
        models: ['Error fetching models'],
        status: 'error',
      };
    }
  }
}

export default HuggingFaceService; 
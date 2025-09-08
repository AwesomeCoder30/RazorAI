import { HfInference } from '@huggingface/inference';
import WireframeParser from './wireframeParser';
import LLMService from './llmService';
import { WireframeSchema } from '../schemas/wireframeSchema';

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
  private llmService: LLMService;

  constructor() {
    this.hf = new HfInference(process.env.HUGGING_FACE_API_KEY || '');
    this.wireframeParser = new WireframeParser();
    this.llmService = new LLMService();
  }

  private hasApiKey(): boolean {
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    return !!(apiKey && apiKey.length > 0);
  }

  async generateWireframe(request: WireframeGenerationRequest): Promise<WireframeGenerationResponse> {
    try {
      // Try the new LLM service first
      const llmResponse = await this.llmService.generateWireframe({
        description: request.description,
        pageType: request.pageType,
        device: request.device,
        complexity: request.complexity,
        theme: 'modern',
        useFewShot: true // Use few-shot learning for better results
      });

      if (llmResponse.success && llmResponse.data) {
        try {
          // Convert the new schema format to the legacy format for compatibility
          const legacyWireframe = this.convertToLegacyFormat(llmResponse.data, request);
          
          return {
            success: true,
            wireframe: legacyWireframe,
          };
        } catch (conversionError) {
          console.error('Error converting LLM response to legacy format:', conversionError);
          // Fall through to fallback
        }
      }

      // Fallback to original Hugging Face API if LLM service fails
      if (this.hasApiKey()) {
        return await this.generateWithHuggingFace(request);
      }

      // Final fallback to mock wireframe
      return this.getEnhancedMockWireframe(request);
      
    } catch (error) {
      console.error('Error generating wireframe:', error);
      
      // If everything fails, fallback to mock wireframe
      return this.getEnhancedMockWireframe(request);
    }
  }

  private async generateWithHuggingFace(request: WireframeGenerationRequest): Promise<WireframeGenerationResponse> {
    const prompt = this.createWireframePrompt(request);
    
    const result = await this.hf.textGeneration({
      model: 'meta-llama/Llama-2-7b-chat-hf',
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        repetition_penalty: 1.2,
      },
    });

    const wireframe = this.parseWireframeResponse(result.generated_text, request);
    return {
      success: true,
      wireframe,
    };
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

  private convertToLegacyFormat(schema: WireframeSchema, request: WireframeGenerationRequest): any {
    const dimensions = this.getDeviceDimensions(request.device || 'desktop');
    
    return {
      id: `wireframe_${Date.now()}`,
      title: schema.metadata.title,
      description: schema.metadata.description,
      components: schema.components.map(comp => ({
        id: comp.id,
        type: comp.type,
        x: comp.position.x,
        y: comp.position.y,
        width: comp.position.width,
        height: comp.position.height,
        content: comp.content.text || comp.content.placeholder || comp.type,
        style: comp.styling
      })),
      device: request.device || 'desktop',
      dimensions,
    };
  }

  private getEnhancedMockWireframe(request: WireframeGenerationRequest): WireframeGenerationResponse {
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

  private getMockWireframe(request: WireframeGenerationRequest): WireframeGenerationResponse {
    return this.getEnhancedMockWireframe(request);
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
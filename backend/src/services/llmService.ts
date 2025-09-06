import { WireframeSchema, WIREFRAME_SCHEMA_VALIDATION } from '../schemas/wireframeSchema';
import LLMPromptService, { LLMPromptConfig } from './llmPromptService';

export interface LLMProvider {
  name: 'groq' | 'huggingface' | 'ollama';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface LLMResponse {
  success: boolean;
  data?: WireframeSchema;
  error?: string;
  provider: string;
  tokensUsed?: number;
  processingTime?: number;
}

export class LLMService {
  private promptService: LLMPromptService;
  private providers: LLMProvider[] = [];

  constructor() {
    this.promptService = new LLMPromptService();
    this.initializeProviders();
  }

  private initializeProviders() {
    this.providers = [
      {
        name: 'groq',
        apiKey: process.env.GROQ_API_KEY,
        baseUrl: 'https://api.groq.com/openai/v1',
        model: 'llama-3.3-70b-versatile',
        maxTokens: 4000,
        temperature: 0.7
      },
      {
        name: 'huggingface',
        apiKey: process.env.HUGGING_FACE_API_KEY,
        baseUrl: 'https://api-inference.huggingface.co',
        model: 'meta-llama/Llama-2-70b-chat-hf',
        maxTokens: 2000,
        temperature: 0.7
      },
      {
        name: 'ollama',
        apiKey: undefined,
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: 'llama3.1:70b',
        maxTokens: 3000,
        temperature: 0.7
      }
    ];
  }

  async generateWireframe(request: {
    description: string;
    pageType?: string;
    device?: string;
    complexity?: string;
    theme?: string;
    useFewShot?: boolean;
    useChainOfThought?: boolean;
  }): Promise<LLMResponse> {
    
    const startTime = Date.now();
    
    // Try providers in order of preference
    const providersToTry = this.getAvailableProviders();
    
    for (const provider of providersToTry) {
      try {
        console.log(`Trying ${provider.name} for wireframe generation...`);
        
        const response = await this.callLLMProvider(provider, request);
        
        if (response.success && response.data) {
          const processingTime = Date.now() - startTime;
          console.log(`Successfully generated wireframe using ${provider.name} in ${processingTime}ms`);
          
          return {
            ...response,
            provider: provider.name,
            processingTime
          };
        } else {
          console.log(`${provider.name} failed: ${response.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error(`Error with ${provider.name}:`, error);
        continue; // Try next provider
      }
    }
    
    // If all providers fail, return error
    return {
      success: false,
      error: 'All LLM providers failed to generate wireframe',
      provider: 'none',
      processingTime: Date.now() - startTime
    };
  }

  private getAvailableProviders(): LLMProvider[] {
    return this.providers.filter(provider => {
      if (provider.name === 'groq') return !!provider.apiKey;
      if (provider.name === 'huggingface') return !!provider.apiKey;
      if (provider.name === 'ollama') return false; // Skip Ollama for now - requires local setup
      return false;
    });
  }

  private async callLLMProvider(provider: LLMProvider, request: any): Promise<LLMResponse> {
    const promptConfig = this.generatePromptConfig(provider, request);
    
    switch (provider.name) {
      case 'groq':
        return await this.callGroqAPI(provider, promptConfig);
      case 'huggingface':
        return await this.callHuggingFaceAPI(provider, promptConfig);
      case 'ollama':
        return await this.callOllamaAPI(provider, promptConfig);
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  }

  private generatePromptConfig(provider: LLMProvider, request: any): LLMPromptConfig {
    if (request.useChainOfThought) {
      return this.promptService.generateChainOfThoughtPrompt(request);
    } else if (request.useFewShot) {
      return this.promptService.generateFewShotPrompt(request);
    } else {
      return this.promptService.generateWireframePrompt(request);
    }
  }

  private async callGroqAPI(provider: LLMProvider, promptConfig: LLMPromptConfig): Promise<LLMResponse> {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: promptConfig.systemPrompt },
          { role: 'user', content: promptConfig.userPrompt }
        ],
        temperature: promptConfig.temperature,
        max_tokens: promptConfig.maxTokens,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Groq API');
    }

    return this.parseAndValidateResponse(content, provider.name);
  }

  private async callHuggingFaceAPI(provider: LLMProvider, promptConfig: LLMPromptConfig): Promise<LLMResponse> {
    const fullPrompt = `${promptConfig.systemPrompt}\n\n${promptConfig.userPrompt}`;
    
    const response = await fetch(`${provider.baseUrl}/models/${provider.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: promptConfig.maxTokens,
          temperature: promptConfig.temperature,
          return_full_text: false,
          do_sample: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data[0]?.generated_text;
    
    if (!content) {
      throw new Error('No content received from Hugging Face API');
    }

    return this.parseAndValidateResponse(content, provider.name);
  }

  private async callOllamaAPI(provider: LLMProvider, promptConfig: LLMPromptConfig): Promise<LLMResponse> {
    const fullPrompt = `${promptConfig.systemPrompt}\n\n${promptConfig.userPrompt}`;
    
    const response = await fetch(`${provider.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: promptConfig.temperature,
          num_predict: promptConfig.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.response;
    
    if (!content) {
      throw new Error('No content received from Ollama API');
    }

    return this.parseAndValidateResponse(content, provider.name);
  }

  private parseAndValidateResponse(content: string, provider: string): LLMResponse {
    try {
      // Clean the response
      const cleanedContent = this.promptService.validateAndCleanOutput(content);
      
      // Parse JSON
      const parsedData = JSON.parse(cleanedContent);
      
      // Validate against schema
      const validationResult = this.validateWireframeSchema(parsedData);
      
      if (!validationResult.valid) {
        console.error('Schema validation failed:', validationResult.errors);
        throw new Error(`Invalid wireframe schema: ${validationResult.errors.join(', ')}`);
      }
      
      return {
        success: true,
        data: parsedData as WireframeSchema,
        provider
      };
      
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      return {
        success: false,
        error: `Failed to parse response from ${provider}: ${(error as Error).message}`,
        provider
      };
    }
  }

  private validateWireframeSchema(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic structure validation
    if (!data.metadata) {
      errors.push('Missing metadata section');
    }
    
    if (!data.layout) {
      errors.push('Missing layout section');
    }
    
    if (!data.components || !Array.isArray(data.components)) {
      errors.push('Missing or invalid components array');
    }
    
    // Validate metadata
    if (data.metadata) {
      if (!data.metadata.title || typeof data.metadata.title !== 'string') {
        errors.push('Invalid or missing title');
      }
      
      if (!data.metadata.pageType || !['landing', 'dashboard', 'ecommerce', 'blog', 'form', 'app', 'other'].includes(data.metadata.pageType)) {
        errors.push('Invalid pageType');
      }
    }
    
    // Validate components
    if (data.components && Array.isArray(data.components)) {
      data.components.forEach((component: any, index: number) => {
        if (!component.id) {
          errors.push(`Component ${index} missing id`);
        }
        
        if (!component.type) {
          errors.push(`Component ${index} missing type`);
        }
        
        if (!component.position || typeof component.position.x !== 'number' || typeof component.position.y !== 'number') {
          errors.push(`Component ${index} has invalid position`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get available providers and their status
  getProviderStatus(): Array<{ name: string; available: boolean; reason?: string }> {
    return this.providers.map(provider => {
      if (provider.name === 'groq') {
        return {
          name: 'Groq',
          available: !!provider.apiKey,
          reason: provider.apiKey ? undefined : 'API key not configured'
        };
      }
      
      if (provider.name === 'huggingface') {
        return {
          name: 'Hugging Face',
          available: !!provider.apiKey,
          reason: provider.apiKey ? undefined : 'API key not configured'
        };
      }
      
      if (provider.name === 'ollama') {
        return {
          name: 'Ollama (Local)',
          available: true,
          reason: 'Local installation required'
        };
      }
      
      return {
        name: provider.name,
        available: false,
        reason: 'Unknown provider'
      };
    });
  }
}

export default LLMService;

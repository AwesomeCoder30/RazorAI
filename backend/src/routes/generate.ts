import { Router, Request, Response } from 'express';
import HuggingFaceService, { WireframeGenerationRequest } from '../services/huggingface';

const router = Router();

// Lazy-load the HuggingFaceService to ensure environment variables are loaded first
let hfService: HuggingFaceService | null = null;
function getHfService(): HuggingFaceService {
  if (!hfService) {
    hfService = new HuggingFaceService();
  }
  return hfService;
}

// GET /api/generate/status
// Get the current status of the AI service
router.get('/status', async (req: Request, res: Response) => {
  try {
    const hasApiKey = !!process.env.HUGGING_FACE_API_KEY;
    const apiKeyLength = process.env.HUGGING_FACE_API_KEY?.length || 0;
    
    res.json({
      success: true,
      data: {
        hasApiKey,
        apiKeyLength,
        apiKeyPreview: hasApiKey ? `${process.env.HUGGING_FACE_API_KEY?.substring(0, 6)}...` : 'None',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      },
      message: 'AI service status retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting AI service status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI service status',
    });
  }
});

// GET /api/generate/providers
// Get the status of all LLM providers
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const { LLMService } = await import('../services/llmService');
    const llmService = new LLMService();
    const providers = llmService.getProviderStatus();
    
    res.json({
      success: true,
      data: {
        providers,
        timestamp: new Date().toISOString(),
      },
      message: 'LLM providers status retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting LLM providers status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get LLM providers status',
    });
  }
});

// GET /api/generate/test-llm
// Test the LLM service directly
router.get('/test-llm', async (req: Request, res: Response) => {
  try {
    const { LLMService } = await import('../services/llmService');
    const llmService = new LLMService();
    
    const result = await llmService.generateWireframe({
      description: 'Test simple page',
      pageType: 'landing',
      device: 'desktop',
      complexity: 'simple',
      theme: 'modern',
      useFewShot: true
    });
    
    res.json({
      success: true,
      data: result,
      message: 'LLM service test completed',
    });
  } catch (error) {
    console.error('Error testing LLM service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test LLM service',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/generate/test-hf
// Test the HuggingFaceService directly
router.get('/test-hf', async (req: Request, res: Response) => {
  try {
    const result = await getHfService().generateWireframe({
      description: 'Test simple page',
      pageType: 'landing',
      device: 'desktop',
      complexity: 'simple'
    });
    
    res.json({
      success: true,
      data: result,
      message: 'HuggingFaceService test completed',
    });
  } catch (error) {
    console.error('Error testing HuggingFaceService:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test HuggingFaceService',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/generate/debug-integration
// Debug the LLM integration step by step
router.get('/debug-integration', async (req: Request, res: Response) => {
  try {
    const { LLMService } = await import('../services/llmService');
    const llmService = new LLMService();
    
    // Test LLM service directly
    const llmResult = await llmService.generateWireframe({
      description: 'Test simple page',
      pageType: 'landing',
      device: 'desktop',
      complexity: 'simple',
      theme: 'modern',
      useFewShot: true
    });
    
    // Test HuggingFaceService
    const hfResult = await getHfService().generateWireframe({
      description: 'Test simple page',
      pageType: 'landing',
      device: 'desktop',
      complexity: 'simple'
    });
    
    res.json({
      success: true,
      data: {
        llmDirect: {
          success: llmResult.success,
          provider: llmResult.provider,
          hasData: !!llmResult.data,
          title: llmResult.data?.metadata?.title,
          componentCount: llmResult.data?.components?.length
        },
        hfService: {
          success: hfResult.success,
          title: hfResult.wireframe?.title,
          componentCount: hfResult.wireframe?.components?.length,
          usingMock: hfResult.wireframe?.title?.includes('Custom Standard')
        }
      },
      message: 'Integration debug completed',
    });
  } catch (error) {
    console.error('Error in debug integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to debug integration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/generate/test-conversion
// Test the conversion logic specifically
router.get('/test-conversion', async (req: Request, res: Response) => {
  try {
    const { LLMService } = await import('../services/llmService');
    const llmService = new LLMService();
    
    // Get LLM response
    const llmResult = await llmService.generateWireframe({
      description: 'Test simple page',
      pageType: 'landing',
      device: 'desktop',
      complexity: 'simple',
      theme: 'modern',
      useFewShot: true
    });
    
    if (llmResult.success && llmResult.data) {
      // Test conversion manually
      try {
        const dimensions = { width: 1200, height: 800 };
        const legacyWireframe = {
          id: `wireframe_${Date.now()}`,
          title: llmResult.data.metadata.title,
          description: llmResult.data.metadata.description,
          components: llmResult.data.components.map((comp: any) => ({
            id: comp.id,
            type: comp.type,
            x: comp.position.x,
            y: comp.position.y,
            width: comp.position.width,
            height: comp.position.height,
            content: comp.content.text || comp.content.placeholder || comp.type,
            style: comp.styling
          })),
          device: 'desktop',
          dimensions,
        };
        
        res.json({
          success: true,
          data: {
            llmData: llmResult.data,
            convertedWireframe: legacyWireframe,
            conversionWorked: true
          },
          message: 'Conversion test completed',
        });
      } catch (conversionError) {
        res.json({
          success: false,
          data: {
            llmData: llmResult.data,
            conversionError: conversionError instanceof Error ? conversionError.message : 'Unknown error',
            conversionWorked: false
          },
          message: 'Conversion test failed',
        });
      }
    } else {
      res.json({
        success: false,
        error: 'LLM service failed',
        details: llmResult.error
      });
    }
  } catch (error) {
    console.error('Error in conversion test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test conversion',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/generate/test-hf-llm
// Test if the HuggingFaceService's LLM service instance works
router.get('/test-hf-llm', async (req: Request, res: Response) => {
  try {
    // Access the private llmService instance through a test method
    // We'll add a test method to HuggingFaceService for this
    const testResult = await (getHfService() as any).testLLMService();
    
    res.json({
      success: true,
      data: testResult,
      message: 'HuggingFaceService LLM test completed',
    });
  } catch (error) {
    console.error('Error testing HuggingFaceService LLM:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test HuggingFaceService LLM',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/generate/wireframe
// Generate a wireframe from a description
router.post('/wireframe', async (req: Request, res: Response) => {
  try {
    const { description, pageType, device, complexity } = req.body;

    // Validate required fields
    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Description is required and must be a string',
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Description must be at least 10 characters long',
      });
    }

    const request: WireframeGenerationRequest = {
      description,
      pageType: pageType || 'other',
      device: device || 'desktop',
      complexity: complexity || 'medium',
    };

    console.log('Generating wireframe for:', request);

    const result = await getHfService().generateWireframe(request);

    if (result.success) {
      res.json({
        success: true,
        data: result.wireframe,
        message: 'Wireframe generated successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate wireframe',
      });
    }
  } catch (error) {
    console.error('Error in wireframe generation endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/generate/models
// Get available AI models
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = await getHfService().getAvailableModels();
    res.json({
      success: true,
      data: models,
      message: 'Models retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available models',
    });
  }
});

// GET /api/generate/test
// Test endpoint to verify the service is working
router.get('/test', async (req: Request, res: Response) => {
  try {
    const testRequest: WireframeGenerationRequest = {
      description: 'A simple landing page for a tech startup',
      pageType: 'landing',
      device: 'desktop',
      complexity: 'simple',
    };

    const result = await getHfService().generateWireframe(testRequest);

    res.json({
      success: true,
      data: result,
      message: 'Test wireframe generated successfully',
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
    });
  }
});

export default router; 
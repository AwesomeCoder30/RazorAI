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
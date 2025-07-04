import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'RazorAI API is running',
    environment: process.env.NODE_ENV || 'development',
    hasHuggingFaceKey: !!process.env.HUGGING_FACE_API_KEY,
  });
});

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from RazorAI API!',
    version: '1.0.0',
    features: ['AI Wireframe Generation', 'Multiple Device Support', 'Component-Based Design'],
  });
});

// AI Generation Routes
app.use('/api/generate', generateRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} was not found on this server.`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RazorAI Server running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Generation: http://localhost:${PORT}/api/generate/test`);
  console.log(`🔑 Hugging Face API: ${process.env.HUGGING_FACE_API_KEY ? 'Configured' : 'Not configured'}`);
});

export default app; 
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Testing LLM service directly...');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');

// Import the LLM service
const { LLMService } = require('./dist/services/llmService');

async function testLLM() {
    try {
        const llmService = new LLMService();

        console.log('Testing LLM service...');
        const result = await llmService.generateWireframe({
            description: 'Test simple page',
            pageType: 'landing',
            device: 'desktop',
            complexity: 'simple',
            theme: 'modern',
            useFewShot: true
        });

        console.log('LLM Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error testing LLM service:', error);
    }
}

testLLM();
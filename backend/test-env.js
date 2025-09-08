const dotenv = require('dotenv');
const path = require('path');

console.log('Testing environment variable loading...');
console.log('Current working directory:', process.cwd());
console.log('__dirname would be:', path.resolve(__dirname, '../.env'));

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('After dotenv.config():');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
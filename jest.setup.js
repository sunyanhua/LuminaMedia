// Jest setup file - loads test environment variables
require('dotenv').config({ path: '.env.test' });

// Setup test environment
console.log('Test environment loaded:');
console.log(`- DB_HOST: ${process.env.DB_HOST}`);
console.log(`- DB_PORT: ${process.env.DB_PORT}`);
console.log(`- DB_DATABASE: ${process.env.DB_DATABASE}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);

// Global test timeout
jest.setTimeout(30000);

// Mock any global services if needed
if (process.env.GEMINI_API_KEY === 'mock_key_for_testing') {
  console.log('Using mock AI services for testing');
}

// Ensure test database exists and is clean
// This would require database setup logic, but for now we just log
console.log('Test setup complete.');
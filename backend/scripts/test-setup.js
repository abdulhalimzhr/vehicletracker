const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up test environment...');

try {
  // Load test environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });
  
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Run database migrations
  console.log('Running database migrations...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
  
  console.log('Test environment setup complete!');
} catch (error) {
  console.error('Test setup failed:', error.message);
  process.exit(1);
}
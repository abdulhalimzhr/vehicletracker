#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load test environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.test') });

console.log('🚀 Starting Vehicle Tracker Backend Tests...\n');

async function setupTestEnvironment() {
  console.log('📋 Setting up test environment...');
  
  try {
    // Check if PostgreSQL is running
    console.log('🔍 Checking PostgreSQL connection...');
    
    // Generate Prisma client
    console.log('⚙️  Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'pipe' });
    
    // Run database migrations
    console.log('🗄️  Setting up test database...');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'pipe',
        env: { ...process.env }
      });
    } catch (error) {
      console.log('📝 Creating test database and running migrations...');
      execSync('npx prisma migrate dev --name init', { 
        stdio: 'pipe',
        env: { ...process.env }
      });
    }
    
    console.log('✅ Test environment ready!\n');
    return true;
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    console.log('\n💡 Make sure PostgreSQL is running:');
    console.log('   docker-compose up -d postgres');
    console.log('   or start your local PostgreSQL server\n');
    return false;
  }
}

async function runTests() {
  const setupSuccess = await setupTestEnvironment();
  if (!setupSuccess) {
    process.exit(1);
  }

  console.log('🧪 Running tests...\n');
  
  // Run Jest with test environment
  const jestProcess = spawn('npx', ['jest', '--verbose'], {
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'test'
    }
  });

  jestProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n❌ Some tests failed.');
    }
    process.exit(code);
  });
}

runTests();
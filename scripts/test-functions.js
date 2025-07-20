#!/usr/bin/env node

/**
 * Script test các chức năng chính của ứng dụng
 * Chạy: node scripts/test-functions.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Cấu hình axios
const API_BASE = process.env.API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE;

console.log('🧪 Bắt đầu test các chức năng chính...\n');

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function để log test results
const logTest = (testName, passed, error = null) => {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${testName}`);
  
  if (!passed && error) {
    console.log(`   Error: ${error.message || error}`);
  }
  
  testResults.tests.push({ name: testName, passed, error });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
};

// Test 1: Server connectivity
const testServerConnectivity = async () => {
  try {
    const response = await axios.get('/api/vocabulary');
    logTest('Server connectivity', true);
    return response.data;
  } catch (error) {
    logTest('Server connectivity', false, error);
    return [];
  }
};

// Test 2: API endpoints
const testAPIEndpoints = async () => {
  const endpoints = [
    '/api/languages',
    '/api/vocabulary',
    '/api/dashboard'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint);
      logTest(`API endpoint: ${endpoint}`, true);
    } catch (error) {
      logTest(`API endpoint: ${endpoint}`, false, error);
    }
  }
};

// Test 3: File structure
const testFileStructure = () => {
  const requiredFiles = [
    'client/src/config/environment.js',
    'server/config/environment.js',
    'client/src/axiosConfig.js',
    'client/src/components/vocabulary/VocabularyLearning.js',
    'client/src/components/vocabulary/VocabularyManager.js',
    'client/src/components/vocabulary/VocabularyList.js',
    'client/src/components/quiz/Quiz.js',
    'client/src/components/statistics/StatisticsPage.js'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    logTest(`File exists: ${file}`, exists);
  }
};

// Test 4: Environment configuration
const testEnvironmentConfig = () => {
  // Test server config
  try {
    const serverConfig = require('../server/config/environment');
    logTest('Server config loaded', true);
  } catch (error) {
    logTest('Server config loaded', false, error);
  }
  
  // Test client config structure
  const clientConfigPath = path.join(__dirname, '..', 'client/src/config/environment.js');
  if (fs.existsSync(clientConfigPath)) {
    const content = fs.readFileSync(clientConfigPath, 'utf8');
    const hasApiUrl = content.includes('apiUrl');
    const hasEnvironment = content.includes('environment');
    logTest('Client config structure', hasApiUrl && hasEnvironment);
  } else {
    logTest('Client config structure', false, 'File not found');
  }
};

// Test 5: Package.json scripts
const testPackageScripts = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    const requiredScripts = ['dev', 'server', 'client', 'build', 'install-all', 'check-env', 'start'];
    
    for (const script of requiredScripts) {
      const hasScript = packageJson.scripts && packageJson.scripts[script];
      logTest(`Package script: ${script}`, hasScript);
    }
  } catch (error) {
    logTest('Package.json scripts', false, error);
  }
};

// Test 6: Dependencies
const testDependencies = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv', 'cloudinary'];
    
    for (const dep of requiredDeps) {
      const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
      logTest(`Server dependency: ${dep}`, hasDep);
    }
    
    const clientPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'client/package.json'), 'utf8'));
    const requiredClientDeps = ['react', 'axios', 'react-router-dom'];
    
    for (const dep of requiredClientDeps) {
      const hasDep = clientPackageJson.dependencies && clientPackageJson.dependencies[dep];
      logTest(`Client dependency: ${dep}`, hasDep);
    }
  } catch (error) {
    logTest('Dependencies check', false, error);
  }
};

// Test 7: Environment variables
const testEnvironmentVariables = () => {
  const envPath = path.join(__dirname, '..', '.env');
  const envExists = fs.existsSync(envPath);
  logTest('Environment file exists', envExists);
  
  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasMongoUri = envContent.includes('MONGODB_URI');
    const hasPort = envContent.includes('PORT');
    logTest('Environment variables structure', hasMongoUri && hasPort);
  }
};

// Test 8: Build process
const testBuildProcess = () => {
  const clientBuildPath = path.join(__dirname, '..', 'client/build');
  const hasBuildDir = fs.existsSync(clientBuildPath);
  logTest('Client build directory exists', hasBuildDir);
  
  if (hasBuildDir) {
    const hasIndexHtml = fs.existsSync(path.join(clientBuildPath, 'index.html'));
    logTest('Build contains index.html', hasIndexHtml);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🔗 Testing server connectivity...');
  await testServerConnectivity();
  
  console.log('\n🌐 Testing API endpoints...');
  await testAPIEndpoints();
  
  console.log('\n📁 Testing file structure...');
  testFileStructure();
  
  console.log('\n⚙️ Testing environment configuration...');
  testEnvironmentConfig();
  
  console.log('\n📦 Testing package.json scripts...');
  testPackageScripts();
  
  console.log('\n📚 Testing dependencies...');
  testDependencies();
  
  console.log('\n🔧 Testing environment variables...');
  testEnvironmentVariables();
  
  console.log('\n🏗️ Testing build process...');
  testBuildProcess();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n🔍 Failed tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   ❌ ${test.name}: ${test.error?.message || 'Unknown error'}`);
      });
  }
  
  console.log('\n💡 Recommendations:');
  if (testResults.failed === 0) {
    console.log('   🎉 Tất cả tests đều pass! Ứng dụng sẵn sàng để deploy.');
  } else {
    console.log('   🔧 Hãy sửa các lỗi trên trước khi deploy.');
    console.log('   📖 Xem DEPLOYMENT.md để biết thêm chi tiết.');
  }
};

// Run tests
runTests().catch(console.error); 
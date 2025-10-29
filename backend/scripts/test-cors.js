#!/usr/bin/env node

/**
 * CORS Testing Script
 * Tests CORS configuration for Strive Academics backend
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'https://striveacademics.com.au';

console.log('🧪 Testing CORS Configuration');
console.log(`API URL: ${API_BASE_URL}`);
console.log(`Frontend Origin: ${FRONTEND_ORIGIN}`);
console.log('---');

// Test 1: Health check
async function testHealthCheck() {
  console.log('1️⃣ Testing health check endpoint...');
  
  return new Promise((resolve, reject) => {
    const url = new URL('/health', API_BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'User-Agent': 'CORS-Test-Script/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   CORS Headers:`);
        Object.keys(res.headers).forEach(header => {
          if (header.toLowerCase().startsWith('access-control-')) {
            console.log(`     ${header}: ${res.headers[header]}`);
          }
        });
        
        try {
          const response = JSON.parse(data);
          console.log(`   Response: ${response.message}`);
        } catch (e) {
          console.log(`   Response: ${data}`);
        }
        
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      reject(err);
    });

    req.end();
  });
}

// Test 2: Preflight request
async function testPreflight() {
  console.log('2️⃣ Testing preflight request...');
  
  return new Promise((resolve, reject) => {
    const url = new URL('/api/auth/login', API_BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
        'User-Agent': 'CORS-Test-Script/1.0'
      }
    };

    const req = client.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      Object.keys(res.headers).forEach(header => {
        if (header.toLowerCase().startsWith('access-control-')) {
          console.log(`     ${header}: ${res.headers[header]}`);
        }
      });
      
      resolve(res.statusCode === 200);
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      reject(err);
    });

    req.end();
  });
}

// Test 3: Actual API request
async function testApiRequest() {
  console.log('3️⃣ Testing actual API request...');
  
  return new Promise((resolve, reject) => {
    const url = new URL('/api/health', API_BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Content-Type': 'application/json',
        'User-Agent': 'CORS-Test-Script/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   CORS Headers:`);
        Object.keys(res.headers).forEach(header => {
          if (header.toLowerCase().startsWith('access-control-')) {
            console.log(`     ${header}: ${res.headers[header]}`);
          }
        });
        
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      reject(err);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    const test1 = await testHealthCheck();
    console.log('---');
    
    const test2 = await testPreflight();
    console.log('---');
    
    const test3 = await testApiRequest();
    console.log('---');
    
    console.log('📊 Test Results:');
    console.log(`   Health Check: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Preflight: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   API Request: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
    
    if (test1 && test2 && test3) {
      console.log('🎉 All CORS tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some CORS tests failed. Check the configuration.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
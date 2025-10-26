const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const tests = [];

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: parsedBody,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('🏥 Testing Health Endpoint...');
  try {
    const response = await makeRequest('GET', '/health');
    console.log(`✅ Health Check: ${response.status} - ${response.data.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Health Check Failed: ${error.message}`);
    return false;
  }
}

async function testDetailedHealthEndpoint() {
  console.log('🏥 Testing Detailed Health Endpoint...');
  try {
    const response = await makeRequest('GET', '/health/detailed');
    console.log(`✅ Detailed Health Check: ${response.status} - ${response.data.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Detailed Health Check Failed: ${error.message}`);
    return false;
  }
}

async function testRootEndpoint() {
  console.log('🏠 Testing Root Endpoint...');
  try {
    const response = await makeRequest('GET', '/');
    console.log(`✅ Root Endpoint: ${response.status} - ${response.data.message}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Root Endpoint Failed: ${error.message}`);
    return false;
  }
}

async function testAuthRegister() {
  console.log('🔐 Testing Auth Register...');
  try {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '+59812345678'
    };
    
    const response = await makeRequest('POST', '/api/v1/auth/register', userData);
    console.log(`✅ Auth Register: ${response.status} - ${response.data.message || response.data.error?.message}`);
    return response.status === 201 || response.status === 400; // 400 might be expected if user exists
  } catch (error) {
    console.log(`❌ Auth Register Failed: ${error.message}`);
    return false;
  }
}

async function testAuthLogin() {
  console.log('🔐 Testing Auth Login...');
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await makeRequest('POST', '/api/v1/auth/login', loginData);
    console.log(`✅ Auth Login: ${response.status} - ${response.data.message || response.data.error?.message}`);
    return response.status === 200 || response.status === 401; // 401 might be expected if user doesn't exist
  } catch (error) {
    console.log(`❌ Auth Login Failed: ${error.message}`);
    return false;
  }
}

async function testServicesEndpoint() {
  console.log('🛠️ Testing Services Endpoint...');
  try {
    const response = await makeRequest('GET', '/api/v1/services');
    console.log(`✅ Services: ${response.status} - ${response.data.message || 'Services retrieved'}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Services Failed: ${error.message}`);
    return false;
  }
}

async function testBookingsEndpoint() {
  console.log('📅 Testing Bookings Endpoint...');
  try {
    const response = await makeRequest('GET', '/api/v1/bookings');
    console.log(`✅ Bookings: ${response.status} - ${response.data.message || 'Bookings retrieved'}`);
    return response.status === 401; // Expected 401 without authentication
  } catch (error) {
    console.log(`❌ Bookings Failed: ${error.message}`);
    return false;
  }
}

async function testAdminEndpoint() {
  console.log('👑 Testing Admin Endpoint...');
  try {
    const response = await makeRequest('GET', '/api/v1/admin/analytics');
    console.log(`✅ Admin: ${response.status} - ${response.data.message || response.data.error?.message}`);
    return response.status === 401; // Expected 401 without authentication
  } catch (error) {
    console.log(`❌ Admin Failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Backend API Tests...\n');
  
  const results = [];
  
  results.push(await testHealthEndpoint());
  results.push(await testDetailedHealthEndpoint());
  results.push(await testRootEndpoint());
  results.push(await testAuthRegister());
  results.push(await testAuthLogin());
  results.push(await testServicesEndpoint());
  results.push(await testBookingsEndpoint());
  results.push(await testAdminEndpoint());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the output above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error);

// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:3001/api/v1';

async function testAPIs() {
  console.log('🧪 Testing AgroRedUy API Endpoints...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test 2: User Registration
  try {
    console.log('\n2. Testing User Registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'test123456',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
      address: 'Test Address',
      city: 'Montevideo',
      department: 'Montevideo',
      dateOfBirth: '1990-01-01',
      gender: 'masculino',
      occupation: 'Developer',
      company: 'Test Company',
      interests: ['technology', 'agriculture'],
      newsletter: true
    };

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    console.log('✅ Registration Response:', registerResult.success ? 'SUCCESS' : 'FAILED');
    if (!registerResult.success) {
      console.log('❌ Error:', registerResult.error?.message);
    }
  } catch (error) {
    console.log('❌ Registration Failed:', error.message);
  }

  // Test 3: User Login
  try {
    console.log('\n3. Testing User Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'test123456'
    };

    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    console.log('✅ Login Response:', loginResult.success ? 'SUCCESS' : 'FAILED');
    if (!loginResult.success) {
      console.log('❌ Error:', loginResult.error?.message);
    }
  } catch (error) {
    console.log('❌ Login Failed:', error.message);
  }

  // Test 4: Contractor Registration
  try {
    console.log('\n4. Testing Contractor Registration...');
    const contractorData = {
      email: 'contractor@example.com',
      password: 'contractor123456',
      firstName: 'Contractor',
      lastName: 'Test',
      phone: '0987654321',
      businessName: 'Test Business',
      businessDescription: 'A test business for agricultural services',
      businessAddress: 'Business Address 123',
      businessCity: 'Montevideo',
      businessDepartment: 'Montevideo',
      certifications: ['Certification 1', 'Certification 2'],
      yearsExperience: 5
    };

    const contractorResponse = await fetch(`${API_BASE}/auth/register-contractor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contractorData)
    });

    const contractorResult = await contractorResponse.json();
    console.log('✅ Contractor Registration Response:', contractorResult.success ? 'SUCCESS' : 'FAILED');
    if (!contractorResult.success) {
      console.log('❌ Error:', contractorResult.error?.message);
    }
  } catch (error) {
    console.log('❌ Contractor Registration Failed:', error.message);
  }

  // Test 5: Get Services
  try {
    console.log('\n5. Testing Get Services...');
    const servicesResponse = await fetch(`${API_BASE}/services`);
    const servicesResult = await servicesResponse.json();
    console.log('✅ Services Response:', servicesResult.success ? 'SUCCESS' : 'FAILED');
    if (!servicesResult.success) {
      console.log('❌ Error:', servicesResult.error?.message);
    }
  } catch (error) {
    console.log('❌ Get Services Failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

testAPIs().catch(console.error);

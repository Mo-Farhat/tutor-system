// Test utility for authentication API
// This file demonstrates how to test the authentication functionality
// You can run these functions in the browser console for testing

import authService from '../services/authService';

// Test user registration (student)
export const testStudentRegistration = async () => {
  const testUser = {
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe123',
    email: 'john.doe@example.com',
    phone_number: '+1234567890',
    password: 'securepassword123',
    password_confirm: 'securepassword123'
  };

  try {
    console.log('Testing student registration...');
    const response = await authService.registerStudent(testUser);
    console.log('Registration successful:', response);
    return response;
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw error;
  }
};

// Test user login
export const testLogin = async (username = 'johndoe123', password = 'securepassword123') => {
  try {
    console.log('Testing login...');
    const response = await authService.login({ username, password });
    console.log('Login successful:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// Test get current user
export const testGetCurrentUser = async () => {
  try {
    console.log('Testing get current user...');
    const response = await authService.getCurrentUser();
    console.log('Current user:', response);
    return response;
  } catch (error) {
    console.error('Get current user failed:', error.message);
    throw error;
  }
};

// Test logout
export const testLogout = async () => {
  try {
    console.log('Testing logout...');
    await authService.logout();
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout failed:', error.message);
    throw error;
  }
};

// Test authentication status
export const testAuthStatus = async () => {
  try {
    console.log('Testing auth status...');
    const response = await authService.checkAuthStatus();
    console.log('Auth status:', response);
    return response;
  } catch (error) {
    console.error('Auth status check failed:', error.message);
    throw error;
  }
};

// Test complete authentication flow
export const testFullAuthFlow = async () => {
  try {
    console.log('=== Starting Full Authentication Test ===');
    
    // 1. Register a new student
    console.log('\n1. Testing Registration...');
    const registerResponse = await testStudentRegistration();
    
    // 2. Logout
    console.log('\n2. Testing Logout...');
    await testLogout();
    
    // 3. Login with the same credentials
    console.log('\n3. Testing Login...');
    const loginResponse = await testLogin(
      registerResponse.user.username, 
      'securepassword123'
    );
    
    // 4. Get current user
    console.log('\n4. Testing Get Current User...');
    await testGetCurrentUser();
    
    // 5. Check auth status
    console.log('\n5. Testing Auth Status...');
    await testAuthStatus();
    
    console.log('\n=== All tests completed successfully! ===');
    
  } catch (error) {
    console.error('\n=== Test failed ===');
    console.error(error.message);
  }
};

// Export all test functions for easy access
export default {
  testStudentRegistration,
  testLogin,
  testGetCurrentUser,
  testLogout,
  testAuthStatus,
  testFullAuthFlow
};

// Instructions for testing:
console.log(`
=== Authentication API Test Instructions ===

To test the authentication API integration:

1. Open browser console (F12)
2. Import the test functions:
   import testAuth from './src/utils/testAuth.js';

3. Run individual tests:
   testAuth.testStudentRegistration()
   testAuth.testLogin('username', 'password')
   testAuth.testGetCurrentUser()
   testAuth.testLogout()

4. Or run the complete flow:
   testAuth.testFullAuthFlow()

Note: Make sure the Django backend is running on localhost:8000
`); 
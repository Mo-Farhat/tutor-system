// Tutor password setup functions
export const verifyPasswordSetupToken = async (token) => {
  try {
    const response = await makeRequest(`/api/auth/tutor/setup-password/${token}/`, 'GET');
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const setupTutorPassword = async (token, passwordData) => {
  try {
    const response = await makeRequest(`/api/auth/tutor/setup-password/${token}/`, 'POST', passwordData);
    
    if (response.tokens) {
      // Store tokens and update auth state
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 
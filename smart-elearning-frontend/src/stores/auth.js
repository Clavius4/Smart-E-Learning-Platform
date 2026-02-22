import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => {
    console.log('[Auth] Checking authentication status:', !!token.value)
    return !!token.value
  })

  // Actions
  const setUser = (userData) => {
    console.log('[Auth] Setting user:', userData)
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Actions
  const setToken = (newToken) => {
    console.log('[Auth] Setting token:', newToken ? '****' + newToken.slice(-4) : 'null')
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      // Set default auth header for all axios requests
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const clearAuth = () => {
    console.log('[Auth] Clearing authentication')
    setUser(null)
    setToken(null)
  }

  const checkAuth = async () => {
    console.log('[Auth] Checking auth validity')
    if (!token.value) {
      console.log('[Auth] No token found')
      return false
    }

    try {
      loading.value = true
      error.value = null
      console.log('[Auth] Verifying token with backend')

      const response = await api.get('/profile/getUserDetails')
      console.log('[Auth] Auth check response:', response.data)

      setUser(response.data.user)
      return true
    } catch (err) {
      console.error('[Auth] Auth check failed:', err)
      clearAuth()
      return false
    } finally {
      loading.value = false
    }
  }

  const login = async (payload) => {
    console.log('[Auth] Attempting login with:', {
      email: payload.email,
      // Never log passwords in production!
    });

    try {
      loading.value = true;
      error.value = null;

      // Ensure payload has required fields
      if (!payload.email || !payload.password) {
        throw new Error('Email and password are required');
      }

      const response = await api.post('/student/login', {
        email: payload.email.trim(),
        password: payload.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('[Auth] Login response:', response);

      if (!response.data) {
        throw new Error('Invalid server response');
      }

      // Handle both success and failure responses
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Login failed');
      }

      if (response.data.token && response.data.user) {
        setToken(response.data.token);
        setUser(response.data.user);
        console.log('[Auth] Login successful');
        return {
          success: true,
          data: response.data,
          message: response.data.message
        };
      }

      throw new Error('Missing token or user data in response');

    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const errorMsg = serverMessage || err.message || 'Login failed. Please try again.';

      error.value = errorMsg;
      console.error('[Auth] Login error:', {
        error: errorMsg,
        status: err.response?.status,
        data: err.response?.data
      });

      return {
        success: false,
        message: errorMsg,
        status: err.response?.status,
        errors: err.response?.data?.errors
      };
    } finally {
      loading.value = false;
    }
  };

  const register = async (payload) => {
    console.log('[Auth] Attempting registration with:', {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName
    });

    try {
      loading.value = true;
      error.value = null;

      // Validate payload
      const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
      const missingFields = requiredFields.filter(field => !payload[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (payload.password !== payload.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Enhanced request with timeout handling
      const response = await api.post('/student/signup', {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        confirmPassword: payload.confirmPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // Increased timeout to 30 seconds
      });

      if (!response.data) {
        throw new Error('Server returned empty response');
      }

      console.log('[Auth] Registration response:', response.data);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Registration failed');
      }

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Registration successful',
        requiresVerification: response.data.requiresVerification || false
      };

    } catch (err) {
      let errorMsg = 'Registration failed. Please try again.';

      if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. The server is taking too long to respond.';
      } else if (err.response) {
        errorMsg = err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
      } else if (err.message) {
        errorMsg = err.message;
      }

      console.error('[Auth] Registration error:', {
        error: err,
        message: errorMsg,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data
      });

      return {
        success: false,
        message: errorMsg,
        status: err.response?.status,
        errors: err.response?.data?.errors
      };
    } finally {
      loading.value = false;
    }
  };

  // const verifyOtp = async (payload) => {
  //   console.log('[Auth] Verifying OTP for:', payload.email || 'unknown user')
  //   try {
  //     loading.value = true
  //     error.value = null

  //     const response = await api.post('/student/verify-otp', payload)
  //     console.log('[Auth] OTP verification response:', response.data)

  //     if (response.data.token && response.data.user) {
  //       setToken(response.data.token)
  //       setUser(response.data.user)
  //       return { success: true, data: response.data }
  //     }
  //     throw new Error('Invalid verification response')
  //   } catch (err) {
  //     error.value = err.response?.data?.message || 
  //                  'OTP verification failed. Please try again.'
  //     console.error('[Auth] OTP verification error:', err)
  //     return { 
  //       success: false, 
  //       message: error.value,
  //       attemptsLeft: err.response?.data?.attemptsLeft
  //     }
  //   } finally {
  //     loading.value = false
  //   }
  // }
  const verifyOtp = async (payload) => {
    console.log('[Auth] Verifying OTP for:', payload.email || 'unknown user')
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/student/verify-otp', payload)
      console.log('[Auth] OTP verification response:', response.data)

      if (response.data.token && response.data.user) {
        setToken(response.data.token)
        setUser(response.data.user)
        return { success: true, data: response.data }
      }

      // If no token but success is true → just verified email
      if (response.data.success) {
        return { success: true, data: response.data }
      }

      throw new Error(response.data.message || 'Invalid verification response')
    } catch (err) {
      error.value = err.response?.data?.message || 'OTP verification failed. Please try again.'
      console.error('[Auth] OTP verification error:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const resendOtp = async (payload) => {
    console.log('[Auth] Resending OTP to:', payload.email)
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/student/resend-otp', payload)
      console.log('[Auth] OTP resend response:', response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message ||
        'Failed to resend OTP. Please try again.'
      console.error('[Auth] OTP resend error:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const forgotPassword = async (email) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await api.post('/reset-password-token', { email });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return {
        success: true,
        message: response.data.message
      };

    } catch (err) {
      const errorMsg = err.response?.data?.message ||
        'Failed to send reset link';

      return {
        success: false,
        message: errorMsg
      };
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (payload) => {
    console.log('[Auth] Resetting password for token:', payload.token ? '****' + payload.token.slice(-4) : 'none')
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/reset-password', payload)
      console.log('[Auth] Password reset response:', response.data)

      if (response.data.token) {
        setToken(response.data.token)
        setUser(response.data.user)
      }

      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message ||
        'Password reset failed. Please try again.'
      console.error('[Auth] Password reset error:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (formData) => {
    console.log('[Auth] Updating profile')
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/student/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('[Auth] Profile update response:', response.data)
      setUser(response.data.user)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message ||
        'Profile update failed. Please try again.'
      console.error('[Auth] Profile update error:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (payload) => {
    console.log('[Auth] Changing password')
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/student/change-password', payload)
      console.log('[Auth] Password change response:', response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message ||
        'Password change failed. Please try again.'
      console.error('[Auth] Password change error:', {
        error: err.response?.data,
        status: err.response?.status
      })
      return {
        success: false,
        message: error.value,
        errors: err.response?.data?.errors
      }
    } finally {
      loading.value = false
    }
  }

  const getEnrolledCourses = async () => {
    console.log('[Auth] Fetching enrolled courses')
    try {
      loading.value = true
      error.value = null

      // Ensure token is properly attached
      const config = {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }

      console.log('[Auth] Request headers:', config.headers)

      const response = await api.get('/profile/getEnrolledCourses', config)
      console.log('[Auth] Enrolled courses response:', response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message ||
        'Failed to fetch enrolled courses.'
      console.error('[Auth] Enrolled courses error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    console.log('[Auth] Attempting logout')
    try {
      loading.value = true
      await api.post('/logout')
      console.log('[Auth] Logout successful')
      clearAuth()
      router.push('/login')
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message ||
        'Logout failed. Please try again.'
      console.error('[Auth] Logout error:', err)
      // Still clear auth even if logout request fails
      clearAuth()
      router.push('/login')
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,

    // Getters
    isAuthenticated,

    // Actions
    setUser,
    setToken,
    clearAuth,
    checkAuth,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    getEnrolledCourses,
    logout
  }
})
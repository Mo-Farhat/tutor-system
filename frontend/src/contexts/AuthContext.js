import React, { createContext, useContext, useReducer, useEffect } from "react";
import authService from "../services/authService";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const ActionTypes = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  TOKEN_REFRESHED: "TOKEN_REFRESHED",
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case ActionTypes.TOKEN_REFRESHED:
      return {
        ...state,
        // Keep existing user data, just acknowledge token refresh
        isAuthenticated: true,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// AuthProvider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      if (authService.isAuthenticated()) {
        const response = await authService.checkAuthStatus();
        if (response.success && response.user) {
          dispatch({
            type: ActionTypes.SET_USER,
            payload: response.user,
          });
        } else {
          // Token might be invalid, clear auth state
          dispatch({ type: ActionTypes.LOGOUT });
        }
      } else {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      dispatch({ type: ActionTypes.LOGOUT });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: ActionTypes.LOGIN_START });

    try {
      const response = await authService.login(credentials);
      if (response.success) {
        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: { user: response.user },
        });
        return response;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: ActionTypes.LOGIN_START });

    try {
      const response = await authService.registerStudent(userData);
      if (response.success) {
        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: { user: response.user },
        });
        return response;
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch({ type: ActionTypes.LOGOUT });
    }
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Helper function to get user-specific URLs
  const getUserSpecificUrl = (basePath, userId = null) => {
    return authService.getUserSpecificUrl(basePath, userId);
  };

  // Helper function to get user info from token or stored data
  const getUserInfo = () => {
    return authService.getUserInfo();
  };

  // Helper function to check if user has specific role
  const hasRole = (role) => {
    const userInfo = getUserInfo();
    return userInfo && userInfo.role === role;
  };

  // Helper function to check if user is tutor
  const isTutor = () => {
    return hasRole("tutor") || (state.user && state.user.is_tutor);
  };

  // Helper function to check if user is student
  const isStudent = () => {
    return hasRole("student") || (state.user && state.user.is_student);
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return hasRole("admin") || (state.user && state.user.is_admin);
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const response = await authService.checkAuthStatus();
      if (response.success && response.user) {
        dispatch({
          type: ActionTypes.SET_USER,
          payload: response.user,
        });
        return response.user;
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshAuth: checkAuthStatus,
    refreshUserData,
    getUserSpecificUrl,
    getUserInfo,
    hasRole,
    isTutor,
    isStudent,
    isAdmin,
    // Token management helpers
    isTokenValid: () => authService.isAuthenticated(),
    getAccessToken: () => authService.getAccessToken(),
    refreshToken: async () => {
      try {
        await authService.refreshToken();
        dispatch({ type: ActionTypes.TOKEN_REFRESHED });
        return true;
      } catch (error) {
        console.error("Token refresh failed:", error);
        dispatch({ type: ActionTypes.LOGOUT });
        return false;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;

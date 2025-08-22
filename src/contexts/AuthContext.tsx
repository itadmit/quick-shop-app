import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, LoginRequest } from '../types/api';
import { apiService } from '../services/api';

// Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User | null };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    
    default:
      return state;
  }
};

// Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // בדיקת סטטוס אימות בעת טעינת האפליקציה
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const isAuth = await apiService.isAuthenticated();
      if (isAuth) {
        const user = await apiService.getCurrentUser();
        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // התחברות
  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await apiService.login(credentials);
      
      if (response.success && response.user && response.token) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
          },
        });
        return { success: true };
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.error || 'שגיאה בהתחברות' });
        return { success: false, error: response.error || 'שגיאה בהתחברות' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהתחברות';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // התנתקות
  const logout = async () => {
    try {
      await apiService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // גם במקרה של שגיאה, נתנתק מקומית
      dispatch({ type: 'LOGOUT' });
    }
  };

  // בדיקת אימות בעת טעינת הקומפוננט
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook לשימוש ב-context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

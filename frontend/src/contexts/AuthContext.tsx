import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ error: Error | null }>;
  updateProfilePicture: (avatarFile: File) => Promise<{ error: Error | null }>;
  removeProfilePicture: () => Promise<{ error: Error | null }>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to update both state and localStorage
  const updateUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Auth Check - Token exists:', !!token);
      console.log('🔍 Auth Check - Stored user exists:', !!storedUser);
      
      if (token && storedUser) {
        try {
          console.log('🔄 Fetching fresh user data from API...');
          const response = await authApi.getProfile();
          console.log('🔍 API Response success:', response.success);
          
          if (response.success && response.data) {
            console.log('✅ User loaded from API:', response.data.user);
            console.log('🔍 Avatar in API response:', response.data.user.avatar);
            
            updateUser(response.data.user);
          } else {
            console.log('❌ API response not successful');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.log('❌ API call failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log('❌ No token or stored user found');
        setUser(null);
      }
      setLoading(false);
    };

    const handleAuthExpired = () => {
      console.log('Auth expired event received - clearing user');
      updateUser(null);
      localStorage.removeItem('authToken');
    };

    checkAuth();
    window.addEventListener('auth-expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.signup(email, password, name);
      
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token);
        updateUser(response.data.user);
        return { error: null };
      } else {
        return { error: new Error(response.error || 'Signup failed') };
      }
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Signup failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token);
        updateUser(response.data.user);
        return { error: null };
      } else {
        return { error: new Error(response.error || 'Login failed') };
      }
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Login failed') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('authToken');
    updateUser(null);
  };

  const updateProfile = async (name: string) => {
    try {
      const response = await authApi.updateProfile(name);
      
      if (response.success && response.data) {
        updateUser(response.data.user);
        return { error: null };
      } else {
        return { error: new Error(response.error || 'Update failed') };
      }
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Update failed') };
    }
  };

  const updateProfilePicture = async (avatarFile: File) => {
    try {
      console.log('🔄 Starting profile picture upload...', {
        name: avatarFile.name,
        type: avatarFile.type,
        size: avatarFile.size
      });
      
      const response = await authApi.updateProfilePicture(avatarFile);
      console.log('🔍 Profile picture API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Profile picture updated successfully:', response.data.user);
        console.log('🔍 New avatar URL:', response.data.user.avatar);
        
        updateUser(response.data.user);
        
        // Double-check localStorage
        const storedUser = localStorage.getItem('user');
        console.log('🔍 localStorage after update:', storedUser);
        
        return { error: null };
      } else {
        console.log('❌ API response not successful:', response.error);
        return { error: new Error(response.error || 'Failed to update profile picture') };
      }
    } catch (error: any) {
      console.log('❌ Upload failed:', error);
      return { error: new Error(error.response?.data?.error || 'Failed to update profile picture') };
    }
  };

  const removeProfilePicture = async () => {
    try {
      const response = await authApi.removeProfilePicture();
      
      if (response.success && response.data) {
        updateUser(response.data.user);
        return { error: null };
      } else {
        return { error: new Error(response.error || 'Failed to remove profile picture') };
      }
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Failed to remove profile picture') };
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    updateUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateProfilePicture,
    removeProfilePicture,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
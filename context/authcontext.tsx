import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removePushTokenFromSupabase } from '../utils/pushNotifications';
import { supabase } from '../utils/supabase';

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

// Auth context type definition
interface AuthContextType {
  isSignedIn: boolean;
  user: User | null;
  signIn: (userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Storage keys
  const USER_STORAGE_KEY = '@user_data';
  const AUTH_STORAGE_KEY = '@is_signed_in';

  // Load user data from storage on app start and sync with Supabase
  useEffect(() => {
    loadUserData();

    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - update local state
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          profilePicture: session.user.user_metadata?.profilePicture
        };
        await updateLocalUserData(userData);
      } else if (event === 'SIGNED_OUT') {
        // User signed out - clear local state
        await clearLocalUserData();
      } else if (event === 'TOKEN_REFRESHED') {
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // First, check if there's an active Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      }

      if (session?.user) {
        // Active Supabase session found - use it
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          profilePicture: session.user.user_metadata?.profilePicture
        };
        await updateLocalUserData(userData);
      } else {
        // No active session - check local storage as fallback
        const isSignedInStored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const userDataStored = await AsyncStorage.getItem(USER_STORAGE_KEY);

        if (isSignedInStored === 'true' && userDataStored) {
          // Had local data but no Supabase session - clear it
          await clearLocalUserData();
        } else {
          // Properly logged out
          setIsSignedIn(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // If there's an error, reset to signed out state
      await clearLocalUserData();
    } finally {
      setLoading(false);
    }
  };

  const updateLocalUserData = async (userData: User) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true');
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      setIsSignedIn(true);
    } catch (error) {
      console.error('Error updating local user data:', error);
    }
  };

  const clearLocalUserData = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      setIsSignedIn(false);
    } catch (error) {
      console.error('Error clearing local user data:', error);
    }
  };

  const signIn = async (userData: User) => {
    try {
      // Update local storage and state
      await updateLocalUserData(userData);

    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Remove push token from Supabase before signing out
      if (user) {
        await removePushTokenFromSupabase(user.id);
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }

      // Clear local data
      await clearLocalUserData();

    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user signed in');
      }

      // Merge updated data with existing user data
      const updatedUser = { ...user, ...userData };

      // Save to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);

    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isSignedIn,
    user,
    signIn,
    signOut,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
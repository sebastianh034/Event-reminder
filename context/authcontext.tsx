import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupPushNotifications, removePushTokenFromSupabase } from '../utils/pushNotifications';

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

  // Load user data from storage on app start
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user is signed in
      const isSignedInStored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const userDataStored = await AsyncStorage.getItem(USER_STORAGE_KEY);
      
      if (isSignedInStored === 'true' && userDataStored) {
        const userData = JSON.parse(userDataStored);
        setUser(userData);
        setIsSignedIn(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // If there's an error, reset to signed out state
      setIsSignedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (userData: User) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true');
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsSignedIn(true);

      console.log('User signed in successfully:', userData.name);

      // Register for push notifications
      await setupPushNotifications(userData.id);
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

      // Remove from AsyncStorage
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);

      // Update state
      setUser(null);
      setIsSignedIn(false);

      console.log('User signed out successfully');
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

      console.log('User updated successfully:', updatedUser.name);
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
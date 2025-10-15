import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    iosClientId: '633242984536-koe26oobg8h50df0morl6fpghv9tjij4.apps.googleusercontent.com',
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  });
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    return { success: true, userInfo };
  } catch (error: any) {
    if (error.code === 'SIGN_IN_CANCELLED') {
      return { success: false, error: 'User cancelled the login' };
    } else if (error.code === 'IN_PROGRESS') {
      return { success: false, error: 'Sign in is already in progress' };
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      return { success: false, error: 'Play services not available' };
    } else {
      return { success: false, error: error.message || 'Something went wrong' };
    }
  }
};

// Sign out from Google
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Check if user is already signed in
export const isSignedIn = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    return isSignedIn;
  } catch (error) {
    return false;
  }
};

// Get current user info
export const getCurrentUser = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return { success: true, userInfo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

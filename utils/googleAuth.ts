import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { supabase } from './supabase'; // Temporarily disabled until Supabase is configured

// Configure Google Sign In
// You'll need to add your Web Client ID from Google Cloud Console
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', // Replace with your Web Client ID
    iosClientId: 'YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com', // Optional: iOS Client ID
    offlineAccess: true,
  });
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (userInfo.data?.idToken) {
      // TODO: Sign in to Supabase with Google ID token (disabled until configured)
      // const { data, error } = await supabase.auth.signInWithIdToken({
      //   provider: 'google',
      //   token: userInfo.data.idToken,
      // });
      // if (error) throw error;

      // Temporary: Return user info directly
      return { success: true, user: userInfo.data.user };
    }

    throw new Error('No ID token received');
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    return { success: false, error: error.message };
  }
};

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    // await supabase.auth.signOut(); // Disabled until Supabase is configured
    return { success: true };
  } catch (error: any) {
    console.error('Sign Out Error:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo;
  } catch (error) {
    return null;
  }
};

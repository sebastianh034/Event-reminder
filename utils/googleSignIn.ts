import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '106273299100-1ljjn6tdtc9noluke6o7j3t5ldo2ssmj.apps.googleusercontent.com', // Web client for Android
    iosClientId: '106273299100-ddlu87570kbolnega143fo61cgrhi205.apps.googleusercontent.com', // iOS client for iOS
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  });
};

// Sign in with Google and authenticate with Supabase using OAuth flow
export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();

    // Initiate Google Sign-In and get user info
    const googleUserInfo = await GoogleSignin.signIn();

    if (!googleUserInfo.data?.user) {
      return { success: false, error: 'No user data received from Google' };
    }

    const { user, idToken } = googleUserInfo.data;

    if (!idToken) {
      return { success: false, error: 'No ID token received from Google' };
    }

    // Check if user exists in Supabase
    const email = user.email;

    if (!email) {
      return { success: false, error: 'No email received from Google' };
    }

    // Use a consistent password derived from the email
    // Users won't know this password - they'll always use Google Sign-In
    const consistentPassword = `Google_SignIn_${email}_SecurePassword123!`;

    const userName = user.name || user.givenName || email.split('@')[0];
    const profilePicture = user.photo || '';

    console.log('[Google Sign In] User data from Google:', {
      name: userName,
      photo: user.photo,
      profilePicture: profilePicture,
      email: email,
    });

    // Try to sign in first
    console.log('[Google Sign In] Attempting to sign in with email:', email);
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password: consistentPassword,
    });

    let authResult;

    // If sign in fails (user doesn't exist), create a new account
    if (signInResult.error) {
      console.log('[Google Sign In] Sign in failed:', signInResult.error.message);

      // Check if it's invalid credentials (user exists but wrong password or user doesn't exist)
      if (signInResult.error.message.includes('Invalid login credentials') ||
          signInResult.error.message.includes('Invalid')) {

        // Try to sign up - if user exists, we'll get an error
        console.log('[Google Sign In] Attempting to sign up new user');
        const signUpResult = await supabase.auth.signUp({
          email,
          password: consistentPassword,
          options: {
            data: {
              name: userName,
              profile_picture: profilePicture,
            }
          }
        });

        if (signUpResult.error) {
          console.log('[Google Sign In] Sign up failed:', signUpResult.error.message);

          // If user already exists, they probably created account differently
          // Return a helpful error message
          if (signUpResult.error.message.includes('already registered')) {
            return {
              success: false,
              error: 'This email is already registered. Please sign in with email/password instead, or use a different Google account.'
            };
          }

          return { success: false, error: signUpResult.error.message };
        }

        authResult = signUpResult;
        console.log('[Google Sign In] Sign up successful');
      } else {
        // Some other error - return it
        console.log('[Google Sign In] Returning error:', signInResult.error.message);
        return { success: false, error: signInResult.error.message };
      }
    } else {
      console.log('[Google Sign In] Sign in successful');
      authResult = signInResult;
    }

    if (authResult && 'error' in authResult && authResult.error) {
      console.error('Supabase auth error:', authResult.error);
      return { success: false, error: String(authResult.error) };
    }

    if (!authResult?.data?.user) {
      return { success: false, error: 'Failed to authenticate with Supabase' };
    }

    // Ensure profile exists in database
    const userId = authResult.data.user.id;

    console.log('[Google Sign In] Checking/creating profile in database');

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('[Google Sign In] Error checking profile:', profileCheckError);
    }

    if (!existingProfile) {
      // Create profile
      console.log('[Google Sign In] Creating new profile');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          name: userName,
          profile_picture: profilePicture,
        });

      if (insertError) {
        console.error('[Google Sign In] Error creating profile:', insertError);
      } else {
        console.log('[Google Sign In] Profile created successfully');
      }
    } else {
      // Update profile picture from Google (in case it changed)
      console.log('[Google Sign In] Profile exists, updating profile picture from Google');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_picture: profilePicture,
          name: userName, // Also update name in case it changed
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[Google Sign In] Error updating profile:', updateError);
      } else {
        console.log('[Google Sign In] Profile updated successfully');
      }
    }

    return {
      success: true,
      userInfo: googleUserInfo,
      user: {
        id: userId,
        email: email,
        name: userName,
        profilePicture: profilePicture, // Return the Google photo URL
      }
    };
  } catch (error: any) {
    if (error.code === 'SIGN_IN_CANCELLED') {
      return { success: false, error: 'User cancelled the login' };
    } else if (error.code === 'IN_PROGRESS') {
      return { success: false, error: 'Sign in is already in progress' };
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      return { success: false, error: 'Play services not available' };
    } else {
      console.error('Google sign in error:', error);
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
    const signedIn = await GoogleSignin.getCurrentUser();
    return signedIn !== null;
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

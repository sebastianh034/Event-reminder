import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Invisible callback route for OAuth deep linking
// This route must exist to prevent "unmatched route" errors on Android
// It immediately redirects back without rendering anything
export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately - OAuth token exchange happens in background
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  }, []);

  return null;
}

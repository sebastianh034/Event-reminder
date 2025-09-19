import { Stack } from 'expo-router';
import SignIn from './signin';
import { AuthProvider } from '../components/authcontext';


export default function RootLayout() {
  return (
    <AuthProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="artist/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
    </Stack>
    </AuthProvider>
  );
}
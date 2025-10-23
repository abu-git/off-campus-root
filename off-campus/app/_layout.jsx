// File: app/_layout.jsx
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router"; // Import useRouter, removed Redirect
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react"; // Import useEffect
import { ActivityIndicator, View, Alert, Text } from 'react-native';
import "./global.css"; // Ensure your global CSS/Tailwind setup is correct
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  // IMPORTANT: Replace with your actual Clerk Publishable Key from your Clerk Dashboard
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dGVuZGVyLWJpcmQtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA';

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are loaded or an error occurs
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering anything until fonts are loaded or an error occurs
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Set up the Clerk provider at the root
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <SafeAreaProvider>
        <StatusBar style='dark' />
        {/* Render the navigation component which handles routing */}
        <RootLayoutNav />
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

// This component contains the core routing logic and runs inside the ClerkProvider context
function RootLayoutNav() {
    const { isLoaded, isSignedIn } = useAuth(); // Clerk Auth state
    const { user } = useUser(); // Clerk User object
    const segments = useSegments(); // Current URL path segments
    const router = useRouter(); // Expo Router instance

    // Effect to handle all routing decisions based on auth state
    useEffect(() => {
        console.log(`[Effect START] isLoaded=${isLoaded}, isSignedIn=${isSignedIn}, User?=${!!user}, Segments=${segments.join('/')}`);

        // **Guard 1: Wait until Clerk is fully initialized.**
        if (!isLoaded) {
            console.log("[Effect EXIT] Clerk not loaded.");
            return; // Don't run routing logic until Clerk is ready
        }

        // Determine current route context
        const currentSegment = segments[0] || '';
        const isInAuthFlow = currentSegment === '(auth)';
        const isInApp = currentSegment === '(seeker)' || currentSegment === '(lister)';
        const isPublicHome = currentSegment === 'index' || currentSegment === '';

        // **Guard 2: Handle the Signed In state.**
        if (isSignedIn) {
            // Signed in, but we MUST wait for the user object to be loaded.
            if (!user) {
                console.log("[Effect EXIT] Signed in, but user object not ready.");
                return; // Wait for the user object after sign-in state is confirmed
            }

            // User object is available, proceed with role checks.
            const role = user.unsafeMetadata?.role; // Using unsafeMetadata
            console.log(`[Effect Logic] Signed In & User Loaded. Role: ${role}`);

            if (role === 'seeker') {
                // User has 'seeker' role. Ensure they are in the seeker section.
                if (currentSegment !== '(seeker)') {
                    console.log("[Effect ROUTE] -> Seeker");
                    router.replace('/(seeker)'); // Programmatic redirect
                }
            } else if (role === 'lister') {
                // User has 'lister' role. Ensure they are in the lister section.
                if (currentSegment !== '(lister)') {
                    console.log("[Effect ROUTE] -> Lister");
                    router.replace('/(lister)/dashboard'); // Programmatic redirect
                }
            } else { // Role is missing or invalid.
                // User is signed in but has no role assigned yet.
                // Redirect them to the role selection screen, *unless* they are already in the auth flow.
                if (!isInAuthFlow) {
                    console.log(`[Effect ROUTE] -> Select Role (Role was: ${role})`);
                    router.replace('/(auth)/select-role'); // Programmatic redirect
                } else {
                    // Already in auth flow (e.g., on select-role screen), let that screen handle logic.
                    console.log("[Effect OK] No role, but currently in Auth flow.");
                }
            }

        } else {
            // **Guard 3: Handle the Signed Out state.**
            console.log("[Effect Logic] Not Signed In.");
            // If the user is not signed in and tries to access a protected route (inApp),
            // redirect them home programmatically.
            if (isInApp) {
                console.log("[Effect ROUTE] -> Public Home (Welcome)");
                router.replace('/'); // Programmatic redirect
            } else {
                 console.log("[Effect OK] Not signed in, already on public/auth route.");
            }
        }

    }, [isLoaded, isSignedIn, user, segments, router]); // Effect dependencies


    // **Render Logic: Show spinner ONLY while Clerk is loading.**
    if (!isLoaded) {
         console.log("[Render] Clerk Loading Spinner");
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#0061FF"/>
            </View>
        );
    }

    // Clerk is loaded. Render the currently matched child route using <Slot />.
    // The useEffect above will handle redirecting to the correct route AFTER this initial render.
    console.log(`[Render] Clerk Loaded, Rendering Slot for Segment: ${segments.join('/')}`);
    return <Slot />;
}
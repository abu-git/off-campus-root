// File: app/_layout.jsx
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments, Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from 'react-native';
import "./global.css";
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

    // ** Effect for handling redirects based on auth state **
    useEffect(() => {
        // **Guard 1: Wait until Clerk is fully initialized.**
        if (!isLoaded) {
            return; // Don't run routing logic until Clerk is ready
        }

        // Determine current route context
        const currentSegment = segments[0] || '';
        const isInAuthFlow = currentSegment === '(auth)';
        const isInApp = currentSegment === '(seeker)' || currentSegment === '(lister)' || currentSegment === 'properties' || currentSegment === 'profile';

        console.log(`[Effect Check] isLoaded=${isLoaded}, isSignedIn=${isSignedIn}, User?=${!!user}, Segments=${segments.join('/')}`);

        if (!isSignedIn) {
            // ** Signed Out Logic - Using useEffect for stability **
            // If NOT signed in and trying to access a protected route (inApp)
            if (isInApp) {
                console.log("[Effect ROUTE] -> Public Home (Welcome)");
                router.replace('/'); // Programmatic redirect
            }
        }
    }, [isLoaded, isSignedIn, segments, router]); // Dependencies


    // ** Render Logic: Show spinner ONLY while Clerk is loading **
    if (!isLoaded) {
        console.log("[Render] Clerk Loading Spinner");
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#0061FF"/>
            </View>
        );
    }

    // Use declarative <Redirect /> for signed-in logic as it's more stable on initial load
    if (isSignedIn) {
        if (!user) {
             console.log("[Render] Signed in, but user object not ready. Showing spinner.");
             return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <ActivityIndicator size="large" color="#0061FF"/>
                </View>
            );
        }

        const role = user.unsafeMetadata?.role;
        const currentSegment = segments[0] || '';
        const isAllowedLocation = currentSegment === (role === 'seeker' ? '(seeker)' : '(lister)') || currentSegment === 'properties' || currentSegment === 'profile' || currentSegment === '(auth)';

        if (!role && currentSegment !== '(auth)') {
            return <Redirect href="/(auth)/select-role" />;
        }

        if (role && !isAllowedLocation) {
            const target = role === 'seeker' ? '/(seeker)' : '/(lister)/dashboard';
            return <Redirect href={target} />;
        }
    }
    
    // Clerk is loaded. Render Slot. The useEffect handles the logout redirect,
    // and the direct return handles the signed-in logic.
    console.log(`[Render] Rendering Slot for Segment: ${segments.join('/')}`);
    return <Slot />;
}
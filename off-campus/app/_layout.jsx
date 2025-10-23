// File: app/_layout.jsx
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments, Redirect, useGlobalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Alert } from 'react-native';
import "./global.css"; // Ensure your global CSS/Tailwind setup is correct
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"), // Adjust path if needed
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"), // Adjust path if needed
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"), // Adjust path if needed
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"), // Adjust path if needed
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"), // Adjust path if needed
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"), // Adjust path if needed
  });

  // IMPORTANT: Replace with your actual Clerk Publishable Key
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE';

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are loaded or an error occurs
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Set up Clerk provider at the root
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <SafeAreaProvider>
        <StatusBar style='dark' />
        <RootLayoutNav />
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

// Component containing core routing logic
function RootLayoutNav() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const segments = useSegments();
    const router = useRouter(); // Keep for programmatic navigation (clearing params)
    const params = useGlobalSearchParams();
    const roleIntent = params?.role_intent; // Role passed from sign-in param
    // State to prevent multiple attempts at setting initial role
    const [isSettingInitialRole, setIsSettingInitialRole] = useState(false);

    // REMOVED useEffect for logout redirect

    // --- Render Logic ---

    // 1. Loading State: Wait for Clerk to be fully ready
    if (!isLoaded) {
        console.log("[Render] Clerk not loaded, showing spinner.");
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#0061FF"/>
            </View>
        );
    }

    // Determine current location context AFTER Clerk is loaded
    const currentSegment = segments[0] || '';
    const isInAuthFlow = currentSegment === '(auth)';
    const isPublicHome = currentSegment === 'index' || currentSegment === '';

    // 2. Handle Signed In State
    if (isSignedIn) {
        // MUST wait for user object after confirming isSignedIn
        if (!user) {
             console.log("[Render] Signed in, but user object not ready. Showing spinner.");
             return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <ActivityIndicator size="large" color="#0061FF"/>
                </View>
            );
        }

        const metadataRole = user.unsafeMetadata?.role; // Read from unsafeMetadata
        console.log(`[Render] Signed In. Role Intent Param: ${roleIntent}, Metadata Role: ${metadataRole}`);

        // ** CASE 1: First login - Role Intent exists, Metadata role doesn't, AND not already setting it **
        if (roleIntent && typeof roleIntent === 'string' && !metadataRole && !isSettingInitialRole) {
            console.log(`[Render] First login detected via role_intent. Setting role to: ${roleIntent}`);
            setIsSettingInitialRole(true); // Prevent re-entry

            // Use an immediately-invoked async function for the update
            (async () => {
                try {
                    await user.update({ unsafeMetadata: { role: roleIntent } });
                    console.log(`[Render Update] Role set to ${roleIntent}. Refreshing route by replacing params...`);
                    // IMPORTANT: Force re-render/re-evaluation by navigating to root WITHOUT the param
                     router.replace({ pathname: '/', params: {} }); // Clear params
                } catch (err) {
                    console.error("[Render Update] Error setting initial role:", err);
                    Alert.alert("Error", "Could not set your role. Please try signing in again.");
                    setIsSettingInitialRole(false); // Reset flag on error
                    router.replace('/'); // Go back to welcome on error
                }
                // No finally needed here as navigation should change state
            })();

            // Show spinner while the async update function runs
            return (
                 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <ActivityIndicator size="large" color="#0061FF"/>
                 </View>
            );
        }

        // ** CASE 2: Role Exists in Metadata (or finished setting in Case 1, or roleIntent handled/irrelevant) **
        // Reset the flag if we are past the initial role setting stage and metadata role now exists
        if (isSettingInitialRole && metadataRole) {
             setIsSettingInitialRole(false);
        }

        const effectiveRole = metadataRole; // Now rely solely on metadata for routing decisions

        // Define allowed segments based on the effective role
        const primaryLayout = effectiveRole === 'seeker' ? '(seeker)' : effectiveRole === 'lister' ? '(lister)' : null;
        
        const isAllowedLocation =
            currentSegment === primaryLayout ||
            currentSegment === 'properties' ||
            currentSegment === 'profile' ||
            isInAuthFlow

        if (effectiveRole === 'seeker' || effectiveRole === 'lister') {
             // If they have a role but are NOT in an allowed location, redirect them
            if (!isAllowedLocation) {
                 const target = effectiveRole === 'seeker' ? '/(seeker)' : '/(lister)/dashboard';
                 console.log(`[Redirect] Role '${effectiveRole}' exists. Outside allowed area. -> ${target}`);
                 return <Redirect href={target} />;
            }
        } else { // No role in metadata (and no roleIntent being processed from Case 1)
            // Needs role selection, redirect if NOT currently in auth flow
            if (!isInAuthFlow) {
                 console.log(`[Redirect] -> Select Role (Metadata Role was: ${effectiveRole})`);
                 // Don't pass params when redirecting TO select-role
                 return <Redirect href="/(auth)/select-role" />;
            }
             // If already in auth flow (select-role screen), Slot will render it below
        }
        // If user is in an allowed location for their role, render Slot
        console.log("[Render] Rendering Slot for signed-in user.");
        return <Slot />;

    } else {
        // ** 3. Handle Signed Out State ** (Render phase)
        console.log("[Render] Not Signed In.");
        // ** CHANGE: No Redirect here. Let child components handle it. **
        // Render Slot allows access to public home ('index') and auth routes.
        // Protected routes rendered via Slot should check isSignedIn themselves.
        console.log("[Render] Rendering Slot (may be protected route). Child must handle redirect if needed.");
        return <Slot />;
    }
}


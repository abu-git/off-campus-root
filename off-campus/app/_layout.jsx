// File: app/_layout.jsx
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments, Redirect, useGlobalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Alert } from 'react-native';
import "./global.css";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { OverlayProvider, Chat } from 'stream-chat-expo';
import { chatClient, connectStreamUser } from '../services/chatClient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dGVuZGVyLWJpcmQtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA';

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <SafeAreaProvider>
          <StatusBar style='dark' />
          <RootLayoutNav />
        </SafeAreaProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const segments = useSegments();
    const router = useRouter();
    const params = useGlobalSearchParams();
    const roleIntent = params?.role_intent;
    const [isSettingInitialRole, setIsSettingInitialRole] = useState(false);

    useEffect(() => {
      if (isSignedIn && user) {
          connectStreamUser(user.id, user.fullName || 'User', user.imageUrl);
      } else if (chatClient.userID) {
          chatClient.disconnectUser();
      }
    }, [isSignedIn, user?.id]);

    return (
        <OverlayProvider>
            <Chat client={chatClient}>
                {(() => {
                    if (!isLoaded) {
                        return (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <ActivityIndicator size="large" color="#0061FF"/>
                            </View>
                        );
                    }

                    const currentSegment = segments[0] || '';
                    const isInAuthFlow = currentSegment === '(auth)';
                    const isInChatFlow = currentSegment === 'chat';
                    const isInPayment = currentSegment === 'payment';
                    // isPublicHome is no longer needed for signed-in logic

                    if (isSignedIn) {
                        if (!user) {
                             return (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                    <ActivityIndicator size="large" color="#0061FF"/>
                                </View>
                            );
                        }

                        const metadataRole = user.unsafeMetadata?.role;
                        
                        if (roleIntent && typeof roleIntent === 'string' && !metadataRole && !isSettingInitialRole) {
                            setIsSettingInitialRole(true);
                            (async () => {
                                try {
                                    await user.update({ unsafeMetadata: { role: roleIntent } });
                                    router.replace({ pathname: '/', params: {} });
                                } catch (err) {
                                    Alert.alert("Error", "Could not set your role.");
                                    setIsSettingInitialRole(false);
                                    router.replace('/');
                                }
                            })();
                            return (
                                 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                    <ActivityIndicator size="large" color="#0061FF"/>
                                 </View>
                            );
                        }
                        if (isSettingInitialRole && metadataRole) {
                             setIsSettingInitialRole(false);
                        }

                        const effectiveRole = metadataRole;
                        const primaryLayout = effectiveRole === 'seeker' ? '(seeker)' : effectiveRole === 'lister' ? '(lister)' : null;
                        
                        // ✅ ** SIMPLIFIED 'isAllowedLocation' **
                        // We removed isPublicHome from this check.
                        const isAllowedLocation =
                            currentSegment === primaryLayout ||
                            currentSegment === 'properties' ||
                            currentSegment === 'profile' ||
                            isInChatFlow || isInPayment ||
                            isInAuthFlow;

                        if (effectiveRole === 'seeker' || effectiveRole === 'lister') {
                            // ✅ ** "Stuck on Welcome" is now handled by app/index.jsx **
                            // This check no longer fires incorrectly during navigation
                            if (!isAllowedLocation) {
                                 const target = effectiveRole === 'seeker' ? '/(seeker)' : '/(lister)/dashboard';
                                 console.log(`[Redirect] Role '${effectiveRole}' exists. Outside allowed ('${currentSegment}'). -> ${target}`);
                                 return <Redirect href={target} />;
                            }
                        } else { // No role
                            if (!isInAuthFlow) {
                                 console.log(`[Redirect] -> Select Role (Metadata was: ${effectiveRole})`);
                                 return <Redirect href="/(auth)/select-role" />;
                            }
                        }
                        console.log(`[Render] User in allowed location ('${currentSegment}'). Rendering Slot.`);
                        return <Slot />;

                    } else {
                        // ** 3. Handle Signed Out State **
                        console.log("[Render] Not Signed In. Rendering Slot.");
                        return <Slot />;
                    }
                })()}
            </Chat>
        </OverlayProvider>
    );
}
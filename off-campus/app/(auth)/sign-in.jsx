// File: app/(auth)/sign-in.jsx
import { useSSO, useAuth, useClerk } from "@clerk/clerk-expo";
import * as AuthSession from 'expo-auth-session';
import { useFonts } from "expo-font";
import * as WebBrowser from 'expo-web-browser';
import { Redirect, useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState, useEffect } from 'react';
import { Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from "../../constants/icons"; // Adjust path if needed
import images from '../../constants/images'; // Adjust path if needed

// Preloads the browser
export const useWarmUpBrowser = () => {
    useEffect(() => {
        if (Platform.OS !== 'android') return;
        void WebBrowser.warmUpAsync();
        return () => { void WebBrowser.coolDownAsync(); };
    }, []);
};

WebBrowser.maybeCompleteAuthSession();

const SignIn = () => {
    useWarmUpBrowser();

    const { startSSOFlow } = useSSO();
    const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
    const { setActive } = useClerk();
    const router = useRouter();
    const { role } = useLocalSearchParams(); // Role chosen on welcome screen
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Function to start the Google SSO flow
    const onPress = useCallback(async () => {
        if (!role) {
            Alert.alert("Role Error", "Please go back and select a role first.");
            return;
        }
        setIsAuthenticating(true);
        try {
            const { createdSessionId } = await startSSOFlow({
                strategy: 'oauth_google',
                redirectUrl: AuthSession.makeRedirectUri(), // Ensure scheme is configured
            });

            if (createdSessionId) {
                setActive({ session: createdSessionId });
                // ** CRITICAL CHANGE: Immediately redirect to root, PASSING the intended role **
                console.log(`[Sign-In OnPress] Session active. Redirecting to root with role_intent: ${role}`);
                router.replace({
                    pathname: '/',
                    params: { role_intent: role } // Pass role intent
                });
            } else {
                // User might have cancelled or MFA might be needed
                setIsAuthenticating(false);
            }
        } catch (err) {
            console.error("OAuth error:", JSON.stringify(err, null, 2));
            Alert.alert('Authentication Error', 'Could not sign in with Google. Please try again.');
            setIsAuthenticating(false);
        }
    }, [role, setActive, router, startSSOFlow]); // Include role and router

    // Font loading
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
        // Add other required fonts
    });

    // Loading States
    if (!fontsLoaded || !isAuthLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#0061FF"/>
            </View>
        );
    }

    // Safety redirect if already signed in
    if (isSignedIn) {
        return <Redirect href={'/'} />;
    }

    // If no role is passed, redirect back to the welcome screen to force selection.
    if (!role) {
        console.warn("[Sign-In] Role parameter missing. Redirecting to Welcome screen ('/').");
        return <Redirect href={'/'} />;
    }

    // Render the Sign In UI
    return (
        <SafeAreaView className='bg-white h-full'>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
                <Image source={images.onboarding} className='w-full h-3/5' contentFit='contain' />
                <View className="px-10 pb-10">
                     <Text className="text-center text-black-200" style={{ fontFamily: 'Rubik-Regular', fontSize: 17, textTransform: 'uppercase' }}>
                        Welcome To Off Campus
                     </Text>
                     <Text style={{ fontFamily: 'Rubik-Bold', fontSize: 24 }} className="text-3xl text-black-300 text-center mt-2">
                        Let's Get You Closer To {"\n"}<Text className="text-primary-300">Your Ideal Residence</Text>
                     </Text>
                     <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 15 }} className="text-lg text-black-200 text-center mt-8">
                         Sign in as a <Text style={{ fontFamily: 'Rubik-Bold' }}>{role || 'user'}</Text> with Google
                     </Text>
                     {isAuthenticating ? (
                         <View className="h-[68px] justify-center items-center">
                            <ActivityIndicator size="large" color="#0061FF"/>
                         </View>
                    ) : (
                        <TouchableOpacity
                            onPress={onPress}
                            disabled={isAuthenticating}
                            className={`bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5 ${isAuthenticating ? 'opacity-50' : ''}`}
                         >
                            <View className="flex flex-row items-center justify-center">
                                <Image source={icons.google} className="w-5 h-5" resizeMode="contain" />
                                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg text-black-300 ml-2">Continue with Google</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignIn;
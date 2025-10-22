
// File: app/(auth)/sign-up.jsx
import { useSSO, useAuth } from "@clerk/clerk-expo";
import * as AuthSession from 'expo-auth-session';
import { useFonts } from "expo-font";
import * as WebBrowser from 'expo-web-browser';
import { Redirect, useLocalSearchParams } from "expo-router"; // Removed useRouter
import React, { useCallback, useState } from 'react';
import { Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from "../../constants/icons";
import images from '../../constants/images';

export const useWarmUpBrowser = () => { /* ... same as before ... */ };
WebBrowser.maybeCompleteAuthSession();

const SignIn = () => {
    useWarmUpBrowser();
    const { startSSOFlow } = useSSO();
    const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
    const { role } = useLocalSearchParams();
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    console.log('role: ', role)

    const onPress = useCallback(async () => {
        setIsAuthenticating(true);
        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: 'oauth_google',
                redirectUrl: AuthSession.makeRedirectUri(),
            });

            if (createdSessionId) {
                // ✅ KEY CHANGE: ONLY set the session active. DO NOT redirect.
                // RootLayoutNav will detect the isSignedIn change and handle routing.
                setActive({ session: createdSessionId });
            } else {
                setIsAuthenticating(false);
            }
        } catch (err) {
            console.error("OAuth error:", JSON.stringify(err, null, 2));
            Alert.alert('Authentication Error', 'Could not sign in with Google.');
            setIsAuthenticating(false);
        }
    }, [setActive, startSSOFlow]);

    // Font loading...
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
        // ... other fonts
    });

    if (!fontsLoaded || !isAuthLoaded) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
    }

    // If already signed in, RootLayoutNav will handle redirecting away from this screen.
    // The Redirect here is a safety net.
    if (isSignedIn) {
        return <Redirect href={'/'} />;
    }

    return (
        <SafeAreaView className='bg-white h-full'>
            {/* ... Your Sign In UI (remains the same) ... */}
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
                 <Image source={images.onboarding} className='w-full h-3/5' contentFit='contain' />
                <View className="px-10 pb-10">
                     <Text className="text-center text-black-200" style={{ fontFamily: 'Rubik-Regular', fontSize: 17, textTransform: 'uppercase' }}>
                        Welcome To Off Campus
                    </Text>
                     <Text style={{ fontFamily: 'Rubik-Bold', fontSize: 24 }} className="text-3xl text-black-300 text-center mt-2">
                        Let's Get You Closer To {"\n"}
                        <Text className="text-primary-300">Your Ideal Residence</Text>
                    </Text>
                     <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 15 }} className="text-lg text-black-200 text-center mt-8">
                        Sign in as a <Text style={{ fontFamily: 'Rubik-Bold' }}>{role || 'user'}</Text> with Google
                    </Text>
                     {isAuthenticating ? (
                         <View className="h-[68px] justify-center items-center">
                            <ActivityIndicator size="large" color="#0061FF"/>
                         </View>
                    ) : (
                        <TouchableOpacity onPress={onPress} className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5">
                           <View className="flex flex-row items-center justify-center">
                                <Image source={icons.google} className="w-5 h-5" resizeMode="contain" />
                                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg text-black-300 ml-2">
                                    Continue with Google
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignIn;
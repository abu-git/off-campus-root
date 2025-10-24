// File: app/index.jsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import images from '../constants/images'; // Ensure you have constants/images.js with a logo export
import { useFonts } from 'expo-font';

const WelcomeScreen = () => {
    const router = useRouter();
    // Use isLoaded along with isSignedIn to prevent premature redirects or flashes
    const { isSignedIn, isLoaded } = useAuth();

    // Font loading
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"), // Add all fonts used
    });

    // Navigate to the sign-in screen, passing the chosen role
    const handlePress = (role) => {
        router.push({
            pathname: '/(auth)/sign-in', // Navigate to your sign-in/up screen
            params: { role: role }      // Pass the chosen role
        });
    };

    // Show loading indicator until Clerk and fonts are ready
    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#0061FF" /> 
            </View>
        );
    }

    // ✅ ** "STUCK ON WELCOME" FIX IS MOVED HERE **
    // If Clerk is loaded AND user is signed in, check their role and redirect
    if (isSignedIn && user) {
        const role = user.unsafeMetadata?.role;
        console.log(`[index.jsx] User is signed in with role: ${role}. Redirecting...`);
        if (role === 'seeker') {
            return <Redirect href="/(seeker)" />;
        } else if (role === 'lister') {
            return <Redirect href="/(lister)/dashboard" />;
        } else {
            // Signed in but no role (should go to select-role)
            // RootLayoutNav will handle this, but we can be explicit
            return <Redirect href="/(auth)/select-role" />;
        }
    }

    // Clerk is loaded, fonts are loaded, user is NOT signed in: Show the welcome options
    return (
        <SafeAreaView className="bg-white flex-1 justify-center items-center p-5">
            {/* Replace with your actual logo component/image if available */}
            {/* <Image source={images.logo} className="w-40 h-40 mb-10" resizeMode="contain" /> */}
            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-center text-black-300">Welcome to Off-Campus</Text>
            <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg text-center text-gray-500 mt-2 mb-10">Choose how you'd like to start:</Text>

            <View className="w-full">
                <TouchableOpacity
                    onPress={() => handlePress('seeker')}
                    className="bg-primary-300 w-full py-4 rounded-full" // Use your primary color class
                >
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">Find a Room (Seeker)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handlePress('lister')}
                    className="bg-gray-200 w-full py-4 rounded-full mt-5"
                >
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-center text-lg">List a Property (Lister)</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default WelcomeScreen;
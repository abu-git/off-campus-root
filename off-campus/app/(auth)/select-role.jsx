// File: app/(auth)/select-role.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useRouter, Redirect } from 'expo-router';
import { useFonts } from "expo-font";

const SelectRoleScreen = () => {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    // State to track if update has been initiated
    const [updateAttempted, setUpdateAttempted] = useState(false);

    // Font loading
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });

    // Effect to redirect if role already exists
    useEffect(() => {
        if (isLoaded && user?.publicMetadata?.role) {
             console.log("[Select Role Effect] User already has role. Redirecting out.");
             const role = user.publicMetadata.role;
             if (role === 'seeker') router.replace('/(seeker)');
             else if (role === 'lister') router.replace('/(lister)/dashboard');
             else router.replace('/'); // Fallback
        }
    }, [user, isLoaded, router]);

    // Function to handle role selection
    const handleSelectRole = async (role) => {
        // Prevent multiple simultaneous attempts
        if (!isLoaded || !user || isUpdating || updateAttempted) {
             console.log(`[handleSelectRole] Exiting: isLoaded=${isLoaded}, user?=${!!user}, isUpdating=${isUpdating}, updateAttempted=${updateAttempted}`);
             return;
        };

        console.log(`[handleSelectRole] Button pressed for role: ${role}`);
        setIsUpdating(true);
        setUpdateAttempted(true); // Mark that we've started the update attempt

        try {
            console.log(`[handleSelectRole] Calling user.update() with unsafeMetadata...`);
            await user.update({
                unsafeMetadata: { role: role }
            });
            console.log(`[handleSelectRole] user.update() SUCCESSFUL for role: ${role}.`);

            // Navigate DIRECTLY to the target layout after success
            console.log(`[handleSelectRole] Attempting router.replace to target route...`);
            if (role === 'seeker') {
                router.replace('/(seeker)');
            } else if (role === 'lister') {
                router.replace('/(lister)/dashboard');
            } else {
                 router.replace('/'); // Fallback
            }
            console.log(`[handleSelectRole] router.replace() called.`);
            // Component should unmount after successful navigation

        } catch (err) {
            console.error("[handleSelectRole] Error during user.update():", JSON.stringify(err, null, 2));
            Alert.alert("Error", `Could not save your role. Details: ${err.errors?.[0]?.message || err.message || 'Unknown error'}`);
            setIsUpdating(false); // Stop loading indicator on error
            setUpdateAttempted(false); // Allow the user to try again on error
        }
    };

    // Show loading if fonts or Clerk user isn't ready
    if (!fontsLoaded || !isLoaded) {
         return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#0061FF"/>
            </View>
         );
    }

     // Redirect check using component - safety net if user gets role while on this screen
     if (isLoaded && user?.unsafeMetadata?.role) {
         console.log("[Select Role Render] User already has role, redirecting...");
         const role = user.unsafeMetadata.role;
         if (role === 'seeker') return <Redirect href="/(seeker)" />;
         if (role === 'lister') return <Redirect href="/(lister)/dashboard" />;
         return <Redirect href="/" />;
     }


    // Render Role Selection UI only if Clerk is loaded, user exists, and NO role is set
    return (
        <SafeAreaView className="bg-white flex-1 justify-center items-center p-5">
            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-center text-black-300">One Last Step!</Text>
            <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg text-center text-gray-500 mt-2 mb-10">How will you be using Off-Campus?</Text>

            {isUpdating ? (
                <ActivityIndicator size="large" color="#0061FF"/>
            ) : (
                <View className="w-full">
                    <TouchableOpacity
                        onPress={() => handleSelectRole('seeker')}
                        className="bg-primary-300 w-full py-4 rounded-full" // Use your primary color class
                    >
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">I'm looking for a room</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleSelectRole('lister')}
                        className="bg-gray-200 w-full py-4 rounded-full mt-5"
                    >
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-center text-lg">I want to list a property</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default SelectRoleScreen;
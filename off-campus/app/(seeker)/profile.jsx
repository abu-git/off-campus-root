// File: app/(seeker)/profile.jsx
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useFonts } from "expo-font";
import { useRouter, Redirect } from 'expo-router'; // Ensure Redirect is imported
import React from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "../../constants/icons"; // Adjust path if needed

const SettingsItem = ({ icon, title, onPress, textStyle, showArrow = true }) => (
    <TouchableOpacity onPress={onPress} className="flex flex-row items-center justify-between py-3">
        <View className="flex flex-row items-center gap-3">
            <Image source={icon} className="size-6" />
            <Text style={{ fontFamily: 'Rubik-Medium' }} className={`text-lg text-black-300 ${textStyle}`}>{title}</Text>
        </View>
        {showArrow && <Image source={icons.rightArrow} className="size-5" />}
    </TouchableOpacity>
);

const Profile = () => {
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-ExtraBold": require("../../assets/fonts/Rubik-ExtraBold.ttf"), // Adjust path
        "Rubik-Light": require("../../assets/fonts/Rubik-Light.ttf"), // Adjust path
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"), // Adjust path
    });

    const router = useRouter();
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();

    // onLogout function (remains the same)
    const onLogout = async () => {
        try {
            await signOut();
            // No navigation here. RootLayoutNav will re-render,
            // and this component will re-render, hitting the !isSignedIn check.
        } catch (err) {
            console.error("Logout error:", JSON.stringify(err, null, 2));
            Alert.alert('Logout Failed', 'Please try again.');
        }
    };

    const handleLogout = () => {
        Alert.alert('Confirm', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: onLogout, style: 'destructive' }
        ]);
    };

    // Wait for Clerk and fonts
    if (!isLoaded || !fontsLoaded) {
        return (
            <SafeAreaView className="bg-white h-full flex justify-center items-center">
                <ActivityIndicator className="text-primary-300" size="large" />
            </SafeAreaView>
        );
    }

    // ✅ ** ADD THIS CHECK BACK **
    // This is the component's own guard.
    if (!isSignedIn) {
        console.log("[(seeker)/profile] Not signed in. Redirecting to /");
        return <Redirect href="/" />;
    }

    // Render profile UI
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <ScrollView showsVerticalScrollIndicator={true} contentContainerClassName="pb-32 px-7">
                <View className="flex flex-row items-center justify-between mt-5">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl">Profile</Text>
                    <Image source={icons.bell} className="size-5" />
                </View>

                <View className="flex flex-row justify-center mt-5">
                    <View className="flex flex-col items-center relative mt-5">
                        <Image
                            source={{ uri: user?.imageUrl }}
                            className="size-44 relative rounded-full"
                        />
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl font-rubik-bold mt-2">{user?.fullName}</Text>
                    </View>
                </View>

                {/* --- Links Section --- */}
                <View className="flex flex-col mt-10">
                    <SettingsItem 
                        icon={icons.send}
                        title="My Applications" 
                        onPress={() => router.push('/profile/my-applications')} 
                    />
                    <SettingsItem 
                        icon={icons.user} 
                        title="My Roommate Profile" 
                        onPress={() => router.push('/profile/edit')} 
                    />
                </View>

                {/* --- Logout Section --- */}
                <View className="flex flex-col border-t mt-5 pt-5 border-primary-200">
                    <SettingsItem
                        icon={icons.logout}
                        title="Logout"
                        textStyle="text-danger"
                        showArrow={false}
                        onPress={handleLogout}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;
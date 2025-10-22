import { useClerk, useUser } from '@clerk/clerk-expo';
import { useFonts } from "expo-font";
import { useRouter, Redirect } from 'expo-router'; // Keep Redirect for safety check
import React from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "../../constants/icons"; // Assuming you have a logout icon

// Reusable SettingsItem (can be moved to a shared component later)
const SettingsItem = ({ icon, title, onPress, textStyle, showArrow = true }) => (
    <TouchableOpacity onPress={onPress} className="flex flex-row items-center justify-between py-3">
        <View className="flex flex-row items-center gap-3">
            <Image source={icon} className="size-6" />
            <Text style={{ fontFamily: 'Rubik-Medium' }} className={`text-lg text-black-300 ${textStyle}`}>{title}</Text>
        </View>
        {showArrow && <Image source={icons.rightArrow} className="size-5" />}
    </TouchableOpacity>
);

const ListerProfile = () => {
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });

    const router = useRouter();
    const { user, isLoaded, isSignedIn } = useUser(); // Using useUser is fine here
    const { signOut } = useClerk();

    // Logout Function (No Navigation)
    const onLogout = async () => {
        try {
            await signOut();
            // RootLayoutNav will handle redirecting to public home ('/')
        } catch (err) {
            console.error("Logout error:", JSON.stringify(err, null, 2));
            Alert.alert('Logout Failed', 'Please try again.');
        }
    };

    const handleLogout = () => {
        Alert.alert('Confirm Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: onLogout, style: 'destructive' }
        ]);
    };

    // Loading State
    if (!isLoaded || !fontsLoaded) {
        return (
            <SafeAreaView className="bg-white flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    // Redirect if somehow accessed while not signed in (Safety Net)
    if (!isSignedIn) {
        return <Redirect href="/" />;
    }

    return (
        <SafeAreaView className='flex-1 bg-gray-100'>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-5">
                {/*<Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300 mb-6">Settings</Text>*/}

                {/* Display Lister Info */}
                <View className="items-center mb-8">
                    <Image
                        source={{ uri: user?.imageUrl }}
                        className="size-32 rounded-full border-2 border-gray-200"
                    />
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl mt-3">{user?.fullName}</Text>
                     {/* Add email or other relevant info if needed */}
                </View>

                {/* Placeholder for future Lister Settings */}
                {/* <SettingsItem icon={icons.someIcon} title="Account Details" onPress={() => {}} /> */}
                {/* <SettingsItem icon={icons.someIcon} title="Notifications" onPress={() => {}} /> */}


                {/* Logout Section */}
                <View className="mt-10 border-t border-gray-200 pt-5">
                    <SettingsItem
                        icon={icons.logout} // Make sure you have icons.logout
                        title="Logout"
                        textStyle="text-red-500" // Use Tailwind's red color
                        showArrow={false}
                        onPress={handleLogout}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ListerProfile;
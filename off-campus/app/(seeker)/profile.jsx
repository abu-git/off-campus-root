import { useClerk, useUser } from '@clerk/clerk-expo';
import { useFonts } from "expo-font";
import { useRouter, Redirect } from 'expo-router';
import React from 'react'; // Removed useEffect as it's not needed here
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "../../constants/icons";

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
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Light": require("../../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
    });

    const router = useRouter();
    // It's better to get isLoaded/isSignedIn from useAuth as useUser is for the user object itself
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();

    // ✅ THE FIX IS HERE
    const onLogout = async () => {
        try {
            // ONLY sign out. DO NOT navigate.
            // RootLayoutNav will detect the isSignedIn change and handle the redirect.
            await signOut();
        } catch (err) {
            console.error("Logout error:", JSON.stringify(err, null, 2));
            Alert.alert('Logout Failed', 'Please try again.');
        }
    };

    const handleLogout = () => { // No need for this to be async
        Alert.alert('Confirm', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: onLogout, style: 'destructive' }
        ]);
    };

    // Wait for Clerk and fonts to be ready
    if (!isLoaded || !fontsLoaded) {
        return (
            <SafeAreaView className="bg-white h-full flex justify-center items-center">
                <ActivityIndicator className="text-primary-300" size="large" />
            </SafeAreaView>
        );
    }

    // If Clerk is loaded but user is not signed in, redirect from here
    if (!isSignedIn) {
        console.log("[(seeker)/profile] Not signed in. Redirecting to /");
        return <Redirect href="/" />;
    }
    

    return (
        <SafeAreaView className='h-full bg-white'>
            <ScrollView showsVerticalScrollIndicator={true} contentContainerClassName="pb-32 px-7">
                <View className="flex flex-row items-center justify-between mt-5">
                    <Text style={{ fontFamily: 'Rubik-Bold', fontSize: 20 }} className="text-xl">Profile</Text>
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
                    {/*<SettingsItem 
                        icon={icons.wallet}
                        title="My Listings" 
                        onPress={() => router.push('/profile/my-listings')} 
                    />*/}
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
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useFonts } from "expo-font";
import { useRouter, Redirect } from 'expo-router'; // Keep Redirect for safety check
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "../../constants/icons"; // Assuming you have a logout icon

// Reusable SettingsItem (can be moved to a shared component later)
const SettingsItem = ({ icon, title, onPress, textStyle, showArrow = true }) => (
    <TouchableOpacity onPress={onPress} className="flex flex-row items-center justify-between py-3">
        <View className="flex flex-row items-center gap-3">
            <Image source={icon} className="size-6" tintColor="#666876" />
            <Text style={{ fontFamily: 'Rubik-Medium' }} className={`text-lg text-black-300 ${textStyle}`}>{title}</Text>
        </View>
        {showArrow && <Image source={icons.rightArrow} className="size-5" tintColor="#A0A0A0" />}
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
    const [isSwitching, setIsSwitching] = useState(false); // State for role switch

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

    // --- Switch Role Function ---
    const handleSwitchRole = async () => {
        if (!user || isSwitching) return;

        setIsSwitching(true);
        Alert.alert(
            "Switch Role",
            "Are you sure you want to switch to Seeker mode?",
            [
                { text: "Cancel", style: "cancel", onPress: () => setIsSwitching(false) },
                {
                    text: "Switch",
                    style: "default",
                    onPress: async () => {
                        try {
                            console.log("[Switch Role] Updating metadata to 'seeker'...");
                            await user.update({
                                unsafeMetadata: { role: 'seeker' } // Update role
                            });
                            console.log("[Switch Role] Metadata update successful.");

                            // **Attempt to force user reload**
                            // console.log("[Switch Role] Reloading user object...");
                            // await user.reload(); // Might help refresh data faster

                            // **Navigate to root AFTER update**
                            console.log("[Switch Role] Navigating to root ('/')...");
                            router.replace('/');
                            // RootLayoutNav should now pick up the new role

                        } catch (err) {
                            console.error("Error switching role:", err);
                            Alert.alert("Error", "Could not switch roles.");
                            setIsSwitching(false); // Reset on error ONLY
                        }
                        // No finally here, success navigates away
                    },
                },
            ]
        );
         // Don't set isSwitching false here immediately after alert
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
        <View className='flex-1 bg-gray-100'>
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
                    {/* Display primary email */}
                    <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-500 mt-1">
                        {user?.primaryEmailAddress?.emailAddress}
                    </Text>
                </View>

                {/* --- Settings Options --- */}
                <View className="mb-5">
                    <Text style={{fontFamily: 'Rubik-SemiBold'}} className="text-gray-500 text-sm uppercase mb-2 px-1">Manage</Text>
                     {/* Add link to Clerk's hosted profile management if desired */}
                     {/* <SettingsItem icon={icons.user} title="Edit Profile" onPress={() => {}} /> */}
                    <SettingsItem icon={icons.bell} title="Notifications" onPress={() => Alert.alert("Notifications", "Settings coming soon!")} />
                     {/* Add Payments/Subscription placeholder if needed */}
                     {/* <SettingsItem icon={icons.creditCard} title="Subscription" onPress={() => {}} /> */}
                </View>

                {/*<View className="mb-5">
                    <Text style={{fontFamily: 'Rubik-SemiBold'}} className="text-gray-500 text-sm uppercase mb-2 px-1">Actions</Text>
                    <SettingsItem
                        icon={icons.switch}
                        title="Switch to Seeker Mode"
                        onPress={handleSwitchRole} // Use the updated handler
                        showArrow={!isSwitching}
                        textStyle={isSwitching ? 'text-gray-400' : ''}
                    />
                     
                    {isSwitching && <ActivityIndicator className="absolute right-10 top-3"/>}
                </View>*/}

                <View className="mb-5">
                    <Text style={{fontFamily: 'Rubik-SemiBold'}} className="text-gray-500 text-sm uppercase mb-2 px-1">Support & Legal</Text>
                    <SettingsItem icon={icons.support} title="Help & Support" onPress={() => Alert.alert("Support", "Link to help page coming soon!")}/>
                    <SettingsItem icon={icons.terms} title="Terms of Service" onPress={() => Alert.alert("Terms of Service", "coming soon!")}/>
                    <SettingsItem icon={icons.shield} title="Privacy Policy" onPress={() => Alert.alert("Privacy Policy", "page coming soon!")}/>
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
        </View>
    );
};

export default ListerProfile;
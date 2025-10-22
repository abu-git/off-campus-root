// File: app/(lister)/_layout.jsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Image, Text, View } from 'react-native';
import icons from '../../constants/icons'; // Ensure you have icons.dashboard and icons.person
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font'; // Import useFonts

// --- Copied directly from seeker layout ---
const TabIcon = ({ focused, icon, title, containerClassName }) => (
    <View className={`items-center justify-center flex-col ${containerClassName}`}>
        <Image
            source={icon}
            tintColor={focused ? "#0061FF" : "#666876"} // Use your primary/inactive colors
            resizeMode="contain"
            className="size-5" // size-5 from seeker layout
        />
        {/* Wrap Text in a View with fixed height */}
        <View className="h-5 justify-center">
            <Text
                // Use font styles from seeker layout
                className={`${
                    focused ? "text-primary-300" : "text-black-200"
                } font-semibold text-xs w-full text-center`}
                // Apply fonts if needed, ensure they are loaded
                // style={{ fontFamily: focused ? 'Rubik-SemiBold' : 'Rubik-Regular' }}
            >
                {title}
            </Text>
        </View>
    </View>
);
// --- End Copied Section ---


const ListerTabsLayout = () => {
    const { bottom } = useSafeAreaInsets();
    // --- Copied directly from seeker layout ---
    const topPadding = 14;
    const barHeight = 60;
    // --- End Copied Section ---

    // Font loading for header title style (if needed and not global)
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        // Add fonts used in TabIcon if necessary
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });
    if (!fontsLoaded) return null; // Wait for fonts

    return (
        <Tabs
            screenOptions={{
                // --- Copied directly from seeker layout ---
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "white",
                    borderTopColor: "#0061FF1A", // Use seeker's border color/opacity
                    borderTopWidth: 1,
                    paddingTop: topPadding,
                    height: barHeight + topPadding + bottom,
                    paddingBottom: bottom,
                },
                // --- End Copied Section ---

                 // Optional: Keep consistent header styling
                 headerStyle: {
                     backgroundColor: '#FFFFFF',
                     elevation: 0,
                     shadowOpacity: 0,
                     borderBottomWidth: 0,
                 },
                 headerTitleStyle: {
                     fontFamily: 'Rubik-Bold',
                 },
                 headerTitleAlign: 'center',
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard', // Header Title
                    headerShown: true, // Show header for Dashboard
                    tabBarIcon: ({ focused }) => (
                        // Use the copied TabIcon component and FULL title
                        <TabIcon focused={focused} icon={icons.filter} title="Dashboard" />
                    )
                 }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Settings', // Header Title
                    headerShown: true, // Show header for Settings
                    tabBarIcon: ({ focused }) => (
                         // Use the copied TabIcon component and FULL title
                        <TabIcon focused={focused} icon={icons.person} title="Settings" />
                    )
                 }}
            />
             {/* Add future tabs here */}
             {/* <Tabs.Screen name="properties" ... /> */}
             {/* <Tabs.Screen name="listings" ... /> */}
        </Tabs>
    );
};

export default ListerTabsLayout;
// File: app/(lister)/_layout.jsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Image, Text, View } from 'react-native';
import icons from '../../constants/icons'; // Ensure you have icons: dashboard, home, list (or wallet), person/settings
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

// TabIcon component (copied from seeker layout)
const TabIcon = ({ focused, icon, title, containerClassName }) => {
    // Font loading for TabIcon text
    const [fontsLoaded] = useFonts({
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });
    if (!fontsLoaded) return null;

    return (
        <View className={`items-center justify-center flex-col ${containerClassName}`}>
            <Image
                source={icon}
                tintColor={focused ? "#0061FF" : "#666876"} // Use your primary/inactive colors
                resizeMode="contain"
                className="size-6"
            />
            <View className="h-5 justify-center">
                <Text
                    className={`${focused ? "text-primary-300" : "text-black-200"} font-semibold text-xs w-full text-center`}
                    style={{ fontFamily: focused ? 'Rubik-SemiBold' : 'Rubik-Regular' }}
                >
                    {title}
                </Text>
            </View>
        </View>
    );
};


const ListerTabsLayout = () => {
    const { bottom } = useSafeAreaInsets();
    const topPadding = 14;
    const barHeight = 60;

    // Font loading for header title style (if needed)
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        // Add fonts used in TabIcon if not already loaded above or globally
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });
    if (!fontsLoaded) return null;

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "white",
                    borderTopColor: "#0061FF1A",
                    borderTopWidth: 1,
                    paddingTop: topPadding,
                    height: barHeight + topPadding + bottom,
                    paddingBottom: bottom,
                },
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
            {/* 1. Dashboard Tab */}
            <Tabs.Screen
                name="dashboard" // Corresponds to app/(lister)/dashboard.jsx
                options={{
                    title: 'Dashboard',
                    headerShown: true,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.dashboard} title="Dashboard" />
                    )
                 }}
            />

            {/* 2. Properties Tab */}
            <Tabs.Screen
                name="properties" // Corresponds to app/(lister)/properties.jsx
                options={{
                    title: 'Properties',
                    headerShown: false, // Header is in properties.jsx itself
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.properties} title="Properties" /> // Using home icon
                    )
                 }}
            />

            {/* 3. NEW Listings Tab */}
            <Tabs.Screen
                name="listings" // Corresponds to app/(lister)/listings.jsx
                options={{
                    title: 'Listings', // Header title (set headerShown below if needed)
                    headerShown: false, // Let the listings screen handle its own header
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.wallet} title="Listings" /> // Use a list or document icon
                    )
                 }}
            />

            {/* 4. Settings/Profile Tab */}
            <Tabs.Screen
                name="profile" // Corresponds to app/(lister)/profile.jsx
                options={{
                    title: 'Settings',
                    headerShown: true,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.settings} title="Settings" />
                    )
                 }}
            />

            {/* 5. Hidden Screens */}
            <Tabs.Screen
                // Hides the create property form from tabs
                name="properties/create"
                options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen
                 // Hides the create listing form from tabs
                name="listings/create"
                options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen
                 // Hides the applicants screen from tabs
                name="listings/[id]/applicants"
                options={{ href: null, headerShown: false }}
            />

            <Tabs.Screen 
                name="properties/[id]" 
                options={{ href: null, headerShown: false }} 
            />

            <Tabs.Screen 
                name="properties/edit/[id]" 
                options={{ href: null, headerShown: false }} 
            />

            <Tabs.Screen 
                name="listings/edit/[id]" 
                options={{ href: null, headerShown: false }} 
            />
        </Tabs>
    );
};

export default ListerTabsLayout;
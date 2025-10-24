import icons from "@/constants/icons";
import { Tabs } from "expo-router";
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

// I've removed `mt-3` and centered the content so it looks better with the new padding.
const TabIcon = ({ focused, icon, title, containerClassName }) => {
    const [fontsLoaded] = useFonts({
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"), // Adjust path
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });
    if (!fontsLoaded) return null;

    return(
    <View className={`items-center justify-center flex-col ${containerClassName}`}>
        <Image
            source={icon}
            tintColor={focused ? "#0061FF" : "#666876"}
            resizeMode="contain"
            className="size-5"
        />
        {/* We wrap the Text in a View with a fixed height to prevent any vertical shift */}
        <View className="h-5 justify-center"> 
            <Text
                className={`${focused ? "text-primary-300" : "text-black-200"} font-semibold text-xs w-full text-center`}
                style={{ fontFamily: focused ? 'Rubik-SemiBold' : 'Rubik-Regular' }}
            >
                {title}
            </Text>
        </View>
    </View>)
};

const TabsLayout = () => {
    const { bottom } = useSafeAreaInsets();
    const topPadding = 14; // You can adjust this value for more or less space
    const barHeight = 60;  // The base height of the tab bar content

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "white",
                    borderTopColor: "#0061FF1A",
                    borderTopWidth: 1,
                    // 1. Add top padding for vertical spacing
                    paddingTop: topPadding,
                    // 2. Adjust height to include base height, top padding, and bottom safe area
                    height: barHeight + topPadding + bottom,
                    paddingBottom: bottom,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home" />
                    )
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explore",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.search} title="Explore" />
                    ),
                }}
            />

            <Tabs.Screen
                name="messages" // Matches app/(seeker)/messages.jsx
                options={{
                    title: 'Messages',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            icon={icons.chat} // You need an 'icons.chat'
                            title="Messages"
                            focused={focused}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name="roommates"
                options={{
                    title: 'Roommates',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            icon={icons.users}
                            title="Roommates"
                            focused={focused}
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.person} title="Profile" />
                    ),
                }}
            />

            <Tabs.Screen
                name="properties/[id]" // Match the new file path
                options={{
                    // Hide the tab bar when this screen is active
                    tabBarStyle: { display: "none" },
                    // Hide this screen from appearing AS a tab
                    href: null,
                    // Hide the header for this screen
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="profile/[id]" // Matches app/(seeker)/profile/edit.jsx
                options={{
                    tabBarStyle: { display: "none" },
                    href: null,
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="profile/edit" // Matches app/(seeker)/profile/edit.jsx
                options={{
                    tabBarStyle: { display: "none" },
                    href: null,
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="profile/my-applications" // Matches app/(seeker)/profile/my-applications.jsx
                options={{
                    tabBarStyle: { display: "none" },
                    href: null,
                    headerShown: false,
                }}
            />
        </Tabs>
    );
};

export default TabsLayout;
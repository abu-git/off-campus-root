import icons from "@/constants/icons";
import { Tabs } from "expo-router";
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

// I've removed `mt-3` and centered the content so it looks better with the new padding.
const TabIcon = ({ focused, icon, title, containerClassName }) => (
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
                className={`${
                    focused ? "text-primary-300" : "text-black-200"
                } font-semibold text-xs w-full text-center`}
            >
                {title}
            </Text>
        </View>
    </View>
);

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
        </Tabs>
    );
};

export default TabsLayout;
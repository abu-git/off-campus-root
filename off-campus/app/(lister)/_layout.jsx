// File: app/(lister)/_layout.jsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

// Minimal Tab Bar for Listers
const ListerTabsLayout = () => {
    return (
        <Tabs screenOptions={{ headerShown: true }}>
            <Tabs.Screen
                name="dashboard" // We'll create this file next
                options={{ title: 'Dashboard' }}
            />
            {/* Add more tabs like Properties, Listings later */}
        </Tabs>
    );
};

export default ListerTabsLayout;
// File: app/(lister)/dashboard.jsx
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
// Import the new sanity functions
import { countUserListings, countPendingApplicationsForUser } from '../../sanity';

// Reusable Stat Card Component
const StatCard = ({ title, value, loading }) => (
    <View className="bg-white p-6 rounded-lg shadow-md items-center justify-center flex-1 mx-2">
        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-gray-500 text-md">{title}</Text>
        {loading ? (
            <ActivityIndicator size="large" className="mt-2" />
        ) : (
            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-primary-300 text-4xl mt-1">{value}</Text>
        )}
    </View>
);

// Reusable Action Button Component
const ActionButton = ({ title, onPress, icon }) => (
     <TouchableOpacity
        onPress={onPress}
        className="bg-primary-300 w-full py-4 rounded-full flex-row items-center justify-center mt-5" // Added flex-row, items-center, justify-center
    >
        {/* You can add an Icon component here if you have one */}
        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-lg ml-2">{title}</Text>
    </TouchableOpacity>
);


const ListerDashboard = () => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const router = useRouter();
    const [fontsLoaded] = useFonts({ /* ... your fonts ... */ });

    const [listingCount, setListingCount] = useState(0);
    const [applicantCount, setApplicantCount] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        setLoadingStats(true);
        try {
            const [listings, applicants] = await Promise.all([
                countUserListings(user.id),
                countPendingApplicationsForUser(user.id)
            ]);
            setListingCount(listings);
            setApplicantCount(applicants);
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
        } finally {
            setLoadingStats(false);
        }
    }, [user]);

    // useFocusEffect re-fetches stats when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [fetchStats])
    );

    if (!fontsLoaded || !isUserLoaded) {
        return <View className="flex-1 justify-center items-center bg-gray-100"><ActivityIndicator size="large" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100 p-5">
            {/*<Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300 mb-6">Dashboard</Text>*/}

            {/* Stat Cards */}
            <View className="flex-row justify-between mb-8">
                <StatCard title="Active Listings" value={listingCount} loading={loadingStats} />
                <StatCard title="New Applicants" value={applicantCount} loading={loadingStats} />
            </View>

            {/* Action Buttons */}
            <View className="items-center">
                 <ActionButton
                    title="Manage Properties"
                    onPress={() => router.push('/(lister)/properties')} // We'll create this screen next
                 />
                 <ActionButton
                    title="Manage Listings"
                    onPress={() => router.push('/(lister)/listings')} // Link to existing screen
                 />
                 {/* Optional: Add "View All Applicants" button here */}
            </View>

             {/* Placeholder for Logout - Move to Profile Tab */}
             {/* <TouchableOpacity onPress={handleLogout} className="mt-10"><Text className="text-red-500 text-center">Logout</Text></TouchableOpacity> */}

        </SafeAreaView>
    );
};

export default ListerDashboard;
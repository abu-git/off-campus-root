// app/profile/my-applications.jsx (New File)

import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { getPersonProfile, getApplicationsForSeeker } from '../../sanity';
import { ApplicationCard } from '../../components/ApplicationCard'; // Adjust path if needed

const MyApplicationsScreen = () => {
    const { user } = useUser();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyApplications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // First, get the user's personProfile to find its ID
            const profile = await getPersonProfile(user.id);
            if (profile) {
                // Then, use that profile ID to get their applications
                const result = await getApplicationsForSeeker(profile._id);
                setApplications(result);
            }
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Could not load your applications.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyApplications();
    }, [fetchMyApplications]);

    if (loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={applications}
                keyExtractor={(item) => item._id}
                contentContainerClassName="p-5"
                ListHeaderComponent={() => (
                    <View className="mb-5">
                         <TouchableOpacity onPress={() => router.back()} className="mb-4">
                            <Text className="text-primary-300 text-base">← Back to Profile</Text>
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300">My Applications</Text>
                        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-500 mt-1">
                            Track the status of your roommate applications here.
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => <ApplicationCard application={item} />}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center mt-20">
                        <Text className="text-lg text-gray-500">You haven't applied anywhere yet.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default MyApplicationsScreen;
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoommateCard } from '../../components/RoommateCard';
import { getAllSeekerProfiles } from '../../sanity';

const RoommatesExplore = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAllSeekerProfiles();
            setProfiles(result);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // useFocusEffect will re-fetch data every time the tab comes into view
    useFocusEffect(
        useCallback(() => {
            fetchProfiles();
        }, [fetchProfiles])
    );

    if (loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={profiles}
                renderItem={({ item }) => <RoommateCard profile={item} onPress={() => { /* TODO: Navigate to public profile detail */ }} />}
                keyExtractor={(item) => item._id}
                numColumns={1}
                contentContainerClassName="p-5"
                //columnWrapperClassName="gap-5"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View className="mb-5">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300">
                            Find a Roommate
                        </Text>
                        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-500 mt-1">
                            Browse profiles of people looking for a place.
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default RoommatesExplore;
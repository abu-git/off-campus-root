// File: app/(lister)/listings.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useFonts } from "expo-font";
import { ActivityIndicator, FlatList, Text, View, TouchableOpacity, Alert, Image } from 'react-native'; // Added Image, Alert
import { useRouter, useFocusEffect } from 'expo-router'; // Added useFocusEffect
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { sanityClient } from '../../sanity'; // Adjust path as needed
import { Card } from '../../components/Cards'; // Adjust path as needed

const MyListingsScreen = () => {
    const { user } = useUser();
    const router = useRouter();
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });

    const fetchMyListings = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const query = `*[_type == "listing" && authorClerkId == $clerkId]{ ..., "imageUrl": property->gallery[0].asset->url, property-> }`;
            const params = { clerkId: user.id };
            const result = await sanityClient.fetch(query, params);
            setMyListings(result);
        } catch (err) {
            console.log("Error fetching my listings:", err);
            Alert.alert("Error", "Could not load your listings.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Re-fetch when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchMyListings();
        }, [fetchMyListings])
    );

    if (!fontsLoaded || loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    return (
        <SafeAreaView className="bg-white flex-1" edges={['top']}>
            <FlatList
                data={myListings}
                keyExtractor={(item) => item._id}
                contentContainerClassName="p-5"
                ListHeaderComponent={() => (
                    <View className="mb-5">
                        <View className="flex-row justify-between items-center">
                            <TouchableOpacity
                                onPress={() => router.push('/(lister)/dashboard')} // Go to Dashboard
                                className="mb-4"
                            >
                                <Text className="text-primary-300 text-base" style={{fontFamily: 'Rubik-Medium'}}>← Back to Dashboard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/(lister)/listings/create')}
                                className="bg-primary-300 px-4 py-2 rounded-full"
                            >
                                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white"> + New Listing</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300 mt-4">My Listings</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View className="mb-4">
                        <Card item={item} onPress={() => router.push(`/(lister)/listings/edit/${item._id}`)} />
                        
                        {/* ✅ ** THE FIX ** ✅ */}
                        {/* Removed the conditional check. This button now shows for ALL listings. */}
                         <TouchableOpacity 
                            onPress={() => router.push(`/(lister)/listings/${item._id}/applicants`)}
                            className="bg-primary-300 py-3 rounded-lg mt-2 shadow"
                         >
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center">View Applicants</Text>
                        </TouchableOpacity>

                    </View>
                )}
                ListEmptyComponent={()=>(
                     <View className="items-center justify-center mt-20 bg-white p-6 rounded-lg shadow-sm">
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg text-gray-500 text-center">No listings created yet.</Text>
                         <TouchableOpacity
                            onPress={() => router.push('/(lister)/listings/create')}
                            className="bg-primary-300 px-6 py-3 rounded-full mt-4 shadow"
                        >
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white">Add Your First Listing</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListFooterComponent={<View className="h-10" />}
            />
        </SafeAreaView>
    );
};

export default MyListingsScreen;
import React, { useEffect, useState, useCallback } from 'react';
import { useFonts } from "expo-font";
import { ActivityIndicator, FlatList, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { sanityClient } from '../../sanity'; // We'll write a query directly here
import { Card } from '../../components/Cards'; // Reuse your existing Card component

const MyListingsScreen = () => {
    const { user } = useUser();
    const router = useRouter();
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });

    const fetchMyListings = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // ✅ CORRECT: Query by the author's unique Clerk ID
            const query = `*[_type == "listing" && authorClerkId == $clerkId]{ ..., "imageUrl": property->gallery[0].asset->url, property-> }`;
            const params = { clerkId: user.id }; // Use the user's unique ID
    
            const result = await sanityClient.fetch(query, params);
            setMyListings(result);
        } catch (err) {
            console.log("Error fetching my listings:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyListings();
    }, [fetchMyListings]);

    if (!fontsLoaded || loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={myListings}
                keyExtractor={(item) => item._id}
                contentContainerClassName="p-5"
                ListHeaderComponent={() => (
                    <View className="mb-5">
                         <TouchableOpacity onPress={() => router.back()} className="mb-4">
                            <Text className="text-primary-300 text-base">← Back to Profile</Text>
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300">My Listings</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View>
                        <Card item={item} onPress={() => router.push(`/properties/${item._id}`)} />
                        {/* Only show the applicants button for shared rooms */}
                        {item.listingType === 'sharedRoom' && (
                             <TouchableOpacity 
                                onPress={() => router.push(`/listings/${item._id}/applicants`)}
                                className="bg-primary-300 py-3 rounded-lg mt-2"
                             >
                                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center">View Applicants</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default MyListingsScreen;
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useFonts } from "expo-font";
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, FeaturedCard } from '../../components/Cards';
import Search from '../../components/Search2';
import icons from '../../constants/icons';
import Filters from '../../components/Filters';
import { useRouter, Redirect } from 'expo-router';

// ✅ 1. Import the new listing functions from sanity.js
import { getFeaturedListings, getHomeListings, searchListings } from '../../sanity';

const Index = () => {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    // Font loading...
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
        // ... other fonts
    });

    // ✅ 2. State variables renamed for clarity
    const [featuredListings, setFeaturedListings] = useState([]);
    const [homeListings, setHomeListings] = useState([]);
    const [initialListings, setInitialListings] = useState([]);
    
    const [loading, setLoading] =  useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // ✅ 3. Search handler updated to use searchListings
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setHomeListings(initialListings);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchListings(query); // Using new function
            setHomeListings(results);
        } catch (error) {
            console.log("Failed to fetch search results:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // ✅ 4. Fetching functions updated to get listings
    const fetchFeaturedListings = async () => {
        try {
            const results = await getFeaturedListings();
            setFeaturedListings(results);
        } catch(error) {
            console.log(error);
        }
    };

    const fetchHomeListings = async () => {
        try {
            const results = await getHomeListings();
            setHomeListings(results);
            setInitialListings(results);
        } catch(err) {
            console.log(err);
        }
    };

    const handleCardPress = (id) => {
        console.log(`Navigating to /properties/${id} (relative)`);
        router.push(`/(seeker)/properties/${id}`); 
    };

    const loadInitial = async () => {
        setLoading(true);
        await fetchFeaturedListings();
        await fetchHomeListings();
        setTimeout(() => setLoading(false), 1000);
    };

    useEffect(() => {
        loadInitial();
    }, []);

    // First, wait for Clerk to load the authentication state
    if (!isLoaded || !fontsLoaded) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    // If Clerk is loaded and the user is not signed in, redirect them
    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    // If we are still loading data after being signed in
    if (loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    return (
        <SafeAreaView className="bg-white flex-1" edges={['top']} >
            <FlatList
                // ✅ 5. Data prop updated for the main list
                data={homeListings}
                renderItem={({item}) => <Card item={item} onPress={() => handleCardPress(item._id)} />}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerClassName="pb-10"
                columnWrapperClassName="flex gap-5 px-5"
                showsVerticalScrollIndicator={false}
                //ListFooterComponent={<View className="h-10" />}
                ListHeaderComponent={() => (
                    <View className="px-5">
                        {/* Header with user info */}
                        <View className="flex flex-row items-center justify-between mt-5">
                            {/* ... user avatar and name ... */}
                            <View className="flex flex-row">
                                <Image source={{ uri: user?.imageUrl }} className="size-12 rounded-full" />
                                <View className="flex flex-col items-start ml-2 justify-center">
                                    <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 11 }} className="text-xs text-black-100">Hello</Text>
                                    <Text style={{ fontFamily: 'Rubik-Medium', fontSize: 15 }} className="text-base font-rubik-medium text-black-300">{user?.fullName}</Text>
                                </View>
                            </View>
                            <Image source={icons.bell} className="size-6" />
                        </View>

                        <Search onSearch={handleSearch} />

                        {/* Featured Section */}
                        <View className="my-5">
                            <View className="flex flex-row items-center justify-between">
                                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl text-black-300">Featured</Text>
                                <TouchableOpacity onPress={() => router.push('/explore')}>
                                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-base text-primary-300">See all</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                // ✅ 6. Data prop updated for the featured list
                                data={featuredListings}
                                renderItem={({item}) => (<FeaturedCard item={item} onPress={() => handleCardPress(item._id)} />)}
                                keyExtractor={(item) => item._id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerClassName="flex gap-5 mt-5"
                            />
                        </View>

                        {/* Recommendations Section */}
                        <View className="flex flex-row items-center justify-between pb-3">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl text-black-300">{searchQuery ? 'Search Results' : 'Our Recommendations'}</Text>
                            
                            {/* Conditionally show spinner or 'See all' button */}
                            {isSearching ? (
                                <ActivityIndicator size="small" className="text-primary-300" />
                            ) : (
                                <TouchableOpacity onPress={() => router.push('/explore')}>
                                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-base text-primary-300">
                                        See all
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <Filters />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

export default Index;
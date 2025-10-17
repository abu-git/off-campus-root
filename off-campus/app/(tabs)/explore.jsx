import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useFonts } from "expo-font";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Cards';
import icons from '../../constants/icons';
import Search from '../../components/Search2';
import Filters from '../../components/Filters';

// ✅ 1. Import the new listing functions
import { getExploreListings, searchListings } from '../../sanity';

const Explore = () => {
    // ... font loading ...
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        // ... other fonts
    });
  
    // ✅ 2. State variables renamed for clarity
    const [listings, setListings] = useState([]);
    const [initialListings, setInitialListings] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // ✅ 3. Fetching function updated
    const fetchExploreListings = async () => {
        try {
            const result = await getExploreListings();
            setListings(result);
            setInitialListings(result);
        } catch(err) {
            console.log(err);
        }
    };

    // ✅ 4. Search handler updated
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query) {
            setListings(initialListings);
            setIsSearching(false); 
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchListings(query);
            setListings(results);
        } catch (error) {
            console.log("Failed to fetch search results:", error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        fetchExploreListings();
    }, []);

    const handleCardPress = (id) => router.push(`/properties/${id}`);

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                // ✅ 5. Data prop updated
                data={listings}
                renderItem={({item}) => <Card item={item} onPress={() => handleCardPress(item._id)} />}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerClassName="pb-32"
                columnWrapperClassName="flex gap-5 px-5"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View className="px-5">
                        <View className="flex flex-row items-center justify-between mt-5">
                            {/* ... Header ... */}
                        </View>

                        <Search onSearch={handleSearch} />
                        <Filters />

                        <View className="mt-4">
                            {/* ✅ 6. Text updated from "Properties" to "Listings" */}
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl mt-5">{searchQuery ? `Found ${listings?.length} results` : `Found ${listings?.length} Listings`}</Text>
                            {isSearching && <ActivityIndicator size="small" className="text-primary-300 mt-5" />}
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

export default Explore;
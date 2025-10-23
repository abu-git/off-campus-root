// File: app/(lister)/properties.jsx
import React, { useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { getPropertiesForUser } from '../../sanity'; // Ensure path is correct (../../sanity)
import icons from '../../constants/icons'; // Ensure path is correct (../../constants/icons)

// Simple Card component to display property info
const PropertyCard = ({ property, onPress }) => {
    // Basic font loading check for the card itself
    const [fontsLoaded] = useFonts({
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });
    if (!fontsLoaded) return null; // Or a placeholder

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white p-4 rounded-lg shadow-md mb-4 flex-row items-center"
        >
            {/* TODO: Add image display */}
            {/* Example: <Image source={{ uri: property.firstImageUrl }} className="w-16 h-16 rounded mr-4 bg-gray-200" /> */}
             <View className="w-16 h-16 rounded mr-4 bg-gray-200 items-center justify-center">
                 <Image source={icons.home} className="w-8 h-8" tintColor="#A0A0A0"/>
             </View>
            <View className="flex-1">
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg text-black-300" numberOfLines={1}>{property.name}</Text>
                <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-500">{property.area}</Text>
                <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-sm text-gray-400 mt-1 capitalize">{property.type} - {property.totalBedrooms} Beds / {property.totalBathrooms} Baths</Text>
            </View>
            {/* Optional: Add Edit/Delete icons later */}
             <Image source={icons.rightArrow} className="w-5 h-5 ml-2" tintColor="#A0A0A0"/>
        </TouchableOpacity>
    );
};


const MyPropertiesScreen = () => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch properties associated with the current user
    const fetchProperties = useCallback(async () => {
        if (!user) return;
        setLoading(true); // Start loading when fetching
        try {
            const result = await getPropertiesForUser(user.id);
            setProperties(result);
        } catch (err) {
            console.error("Failed to fetch properties:", err);
            Alert.alert("Error", "Could not load your properties.");
        } finally {
            setLoading(false); // Stop loading regardless of outcome
        }
    }, [user]); // Re-run if user object changes

    // useFocusEffect re-fetches properties when the screen comes into view
    // This ensures the list updates after adding a new property and navigating back
    useFocusEffect(
        useCallback(() => {
            fetchProperties();
        }, [fetchProperties]) // Dependency array includes the memoized fetch function
    );

    // Show loading indicator until fonts, user, and initial data are loaded
    if (!fontsLoaded || !isUserLoaded || loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#0061FF"/>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <FlatList
                data={properties}
                keyExtractor={(item) => item._id}
                contentContainerClassName="p-5" // Add padding around the list content
                renderItem={({ item }) => (
                    // TODO: Define where pressing a property card should navigate (e.g., edit screen)
                    <PropertyCard property={item} onPress={() => router.push(`/(lister)/properties/${item._id}`)}/>
                )}
                // Header component with Title and Add New button
                ListHeaderComponent={() => (
                    <View className="mb-6 flex-row justify-between items-center">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300">My Properties</Text>
                         <TouchableOpacity
                            onPress={() => router.push('/(lister)/properties/create')} // Navigate to the create form
                            className="bg-primary-300 py-2 px-4 rounded-full flex-row items-center shadow-md"
                        >
                            {/* <Image source={icons.plus} className="w-4 h-4" tintColor="#FFFFFF"/> Add plus icon */}
                            <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-white text-md">+ Add New</Text>
                        </TouchableOpacity>
                    </View>
                )}
                // Component displayed when the properties list is empty
                ListEmptyComponent={() => (
                     <View className="items-center justify-center mt-20 bg-white p-6 rounded-lg shadow">
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg text-gray-500 text-center mb-4">You haven't added any properties yet.</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(lister)/properties/create')} // Navigate to the create form
                            className="bg-primary-300 px-6 py-3 rounded-full mt-4 shadow"
                        >
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white">Add Your First Property</Text>
                        </TouchableOpacity>
                    </View>
                )}
                // Add a footer spacer if tab bar might overlap last item
                 ListFooterComponent={<View className="h-10" />}
            />
        </SafeAreaView>
    );
};

export default MyPropertiesScreen;
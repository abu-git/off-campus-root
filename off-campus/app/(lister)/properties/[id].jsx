// File: app/(lister)/properties/[id].jsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { sanityClient } from '../../../sanity'; // Adjust path
import icons from '../../../constants/icons'; // Adjust path

// Helper component for detail rows
const DetailRow = ({ label, value }) => (
    <View className="py-3 border-b border-gray-200">
        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-gray-500">{label}</Text>
        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-lg text-black-300 mt-1 capitalize">{value || 'Not specified'}</Text>
    </View>
);

const ListerPropertyDetailScreen = () => {
    const { id } = useLocalSearchParams(); // Get property ID from URL
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Medium": require("../../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });

    // Fetch the specific property document
    useEffect(() => {
        const fetchPropertyDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch property by _id, getting gallery image URLs directly
                const query = `*[_type == "property" && _id == $id][0]{ ..., "galleryUrls": gallery[].asset->url }`;
                const params = { id };
                const result = await sanityClient.fetch(query, params);
                setProperty(result);
            } catch (err) {
                console.error("Failed to fetch property details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPropertyDetails();
    }, [id]);

    if (!fontsLoaded || loading) {
        return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" /></View>;
    }

    if (!property) {
        return <View className="flex-1 justify-center items-center bg-white"><Text>Property not found.</Text></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerClassName="p-5">
                {/* --- Header --- */}
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <Image source={icons.backArrow} className="w-6 h-6" />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl text-black-300 flex-1 text-center">
                        Property Details
                    </Text>
                    {/* Placeholder for Edit Button */}
                    <TouchableOpacity
                        onPress={() => router.push(`/(lister)/properties/edit/${id}`)} // Navigate to edit screen
                        className="p-2"
                    >
                         <Image source={icons.edit} className="w-7 h-7" tintColor="#0061FF"/>{/* Use your primary color */}
                     </TouchableOpacity>
                    <TouchableOpacity className="p-2 opacity-0">
                        <Image source={icons.edit} className="w-6 h-6" />
                    </TouchableOpacity>
                </View>

                {/* --- Details --- */}
                <DetailRow label="Name/Address" value={property.name} />
                <DetailRow label="Area/Suburb" value={property.area} />
                <DetailRow label="Type" value={property.type} />
                <DetailRow label="Total Bedrooms" value={property.totalBedrooms} />
                <DetailRow label="Total Bathrooms" value={property.totalBathrooms} />

                {/* --- Facilities --- */}
                <View className="py-3 border-b border-gray-200">
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-gray-500 mb-2">Facilities</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {property.facilities?.map((facility, index) => (
                            <Text key={index} style={{ fontFamily: 'Rubik-Regular' }} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                                {facility}
                            </Text>
                        )) || <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-gray-500">None listed</Text>}
                    </View>
                </View>

                {/* --- Gallery --- */}
                <View className="py-3">
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-gray-500 mb-2">Gallery</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {property.galleryUrls?.map((url, index) => (
                            <Image key={index} source={{ uri: url }} className="w-24 h-24 rounded bg-gray-200" />
                        )) || <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-gray-500">No images uploaded</Text>}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default ListerPropertyDetailScreen;
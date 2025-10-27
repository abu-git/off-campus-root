// components/ApplicationCard.jsx (Example)
import { useFonts } from "expo-font"
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export const ApplicationCard = ({ application }) => {
    const router = useRouter();
    const listing = application.listing;

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    });

    if (!fontsLoaded) return null;

    // Determine color and text for the status badge
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800',
    };

    const handlePaymentPress = () => {
        router.push({
            pathname: `/payment/${application._id}`,
            params: { listingPrice: listing?.price }
        });
    };

    return (
        <View className="w-full mt-4 p-4 rounded-lg bg-white shadow-md shadow-black-100/70">
            <TouchableOpacity onPress={() => router.push(`/(seeker)/properties/${listing._id}`)}>
                <View className="flex-row items-center">
                    <Image 
                        source={{ uri: listing?.imageUrl }} 
                        className="size-20 rounded-lg"
                    />
                    <View className="ml-4 flex-1">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-base text-black-300" numberOfLines={1}>
                            {listing?.title}
                        </Text>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-sm text-gray-500">
                            Price: ₦{listing?.price?.toLocaleString()}
                        </Text>
                        <View className="mt-2">
                            <Text className={`px-2 py-1 text-xs rounded-full self-start capitalize ${statusStyles[application.status] || 'bg-gray-100 text-gray-800'}`}>
                                Status: {application.status}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* ✅ ** ADDED PAYMENT BUTTON ** */}
            {/* Show this button ONLY if the application has been 'accepted' */}
            {application.status === 'accepted' && (
                <TouchableOpacity
                    onPress={handlePaymentPress}
                    className="bg-primary-300 w-full py-3 rounded-full mt-4"
                >
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-base">
                        Proceed to Payment
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
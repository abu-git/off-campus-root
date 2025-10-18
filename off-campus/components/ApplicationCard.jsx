// components/ApplicationCard.jsx (Example)

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export const ApplicationCard = ({ application }) => {
    const router = useRouter();
    const listing = application.listing;

    // Determine color and text for the status badge
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        viewed: 'bg-blue-100 text-blue-800',
        accepted: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    return (
        <TouchableOpacity 
            onPress={() => router.push(`/properties/${listing._id}`)}
            className="w-full flex-row items-center mt-4 p-3 rounded-lg bg-[#fcfeff] shadow-md shadow-black-100/70"
        >
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
        </TouchableOpacity>
    );
};
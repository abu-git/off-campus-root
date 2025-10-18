import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export const RoommateCard = ({ profile, onPress }) => {
    const router = useRouter();

    //console.log(profile)
    return (
        <TouchableOpacity 
            onPress={() => router.push(`/profile/${profile._id}`)}
            className="mt-4 p-4 rounded-lg bg-[#fcfeff] shadow-md shadow-black-100/70"
        >
            <View className="flex-row items-center">
                <Image 
                    source={{ uri: profile?.imageUrl || 'https://via.placeholder.com/150' }} 
                    className="size-16 rounded-full" 
                />
                <View className="ml-4 flex-1">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-lg text-black-300" numberOfLines={1}>{profile.fullName}</Text>
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200">{profile.occupation}</Text>
                </View>
            </View>

            <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-sm text-gray-600 mt-3 h-10" numberOfLines={2}>
                {profile.bio}
            </Text>

            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-sm text-black-200">Budget:</Text>
                <Text style={{ fontFamily: 'Rubik-Bold', fontSize: 15 }} className="text-base text-primary-300">
                    ₦{profile.maxBudget?.toLocaleString()}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
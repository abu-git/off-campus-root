// File: components/RoommateCard.jsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useFonts } from "expo-font";
import { useRouter } from 'expo-router';
import { useChatContext } from 'stream-chat-expo';
import { useUser } from '@clerk/clerk-expo';
import icons from '../constants/icons'; // Adjust path

// A simple component to show the % score
const ScoreDisplay = ({ score }) => {
    let color = 'text-green-600'; // Default
    if (score < 75) color = 'text-yellow-600';
    if (score < 50) color = 'text-red-600';

    return (
        <View className="flex-col items-center">
            <Text style={{ fontFamily: 'Rubik-Bold' }} className={`text-xl ${color}`}>{score}%</Text>
            <Text style={{ fontFamily: 'Rubik-Regular' }} className={`text-xs ${color}`}>Match</Text>
        </View>
    );
};

export const RoommateCard = ({ profile, score }) => {
    const router = useRouter();
    const { client: chatClient } = useChatContext();
    const { user: currentUser } = useUser();
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    });

    if (!fontsLoaded) return null;

    const handleStartChat = async () => {
        if (!currentUser || !profile.clerkId) {
            Alert.alert("Error", "Cannot initiate chat. User data missing.");
            return;
        }
        
        try {
            // Create a 1-on-1 channel
            const channel = chatClient.channel('messaging', {
                members: [currentUser.id, profile.clerkId],
            });
            await channel.watch(); // Create and watch the channel
            
            // Navigate to the chat screen
            router.push(`/chat/${channel.cid}`);

        } catch (error) {
            console.error("Error starting chat:", error);
            Alert.alert("Chat Error", "Could not start the conversation.");
        }
    };

    return (
        <View className="w-full mt-4 p-4 rounded-lg bg-white shadow-lg shadow-black-100/70">
            {/* Top section: Profile Pic, Name, and Score */}
            <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.push(`/(seeker)/profile/${profile._id}`)} className="flex-row items-center flex-1">
                    <Image 
                        source={{ uri: profile.imageUrl || 'https://via.placeholder.com/150' }} 
                        className="size-16 rounded-full" 
                    />
                    <View className="ml-4 flex-1">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-lg text-black-300" numberOfLines={1}>{profile.fullName}</Text>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200" numberOfLines={1}>{profile.occupation}</Text>
                    </View>
                </TouchableOpacity>
                {/* Score Display */}
                <View className="pl-2">
                    <ScoreDisplay score={score} />
                </View>
            </View>

            {/* Bio Section */}
            <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-sm text-gray-600 mt-3 h-10" numberOfLines={2}>
                {profile.bio || "No bio provided."}
            </Text>

            {/* Bottom Section: Budget and Chat Button */}
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <View>
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-sm text-black-200">Budget:</Text>
                    <Text style={{ fontFamily: 'Rubik-Bold', fontSize: 15 }} className="text-base text-primary-300">
                        ₦{profile.maxBudget?.toLocaleString()}
                    </Text>
                </View>
                {/* Chat Button */}
                <TouchableOpacity onPress={handleStartChat} className="bg-primary-300 rounded-full p-3">
                    <Image source={icons.chat} className="w-6 h-6" tintColor="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
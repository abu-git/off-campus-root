// File: app/(seeker)/messages.jsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChannelList, useChatContext } from 'stream-chat-expo';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const MessagesScreen = () => {
    const router = useRouter();
    const { user } = useUser();
    // Get the client and its initialization state
    const { client: chatClient, isInitialising } = useChatContext();

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });

    // Wait for fonts and the user object
    if (!fontsLoaded || !user) {
        return (
             <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0061FF"/>
             </SafeAreaView>
        );
    }
    
    // Define filters for the channel list
    const filters = {
        type: 'messaging',
        members: { $in: [user.id] }, // Show only channels this user is a member of
    };
    // Define sorting
    const sort = { last_message_at: -1 }; // Show most recent chats first

    // Custom loading component
    const LoadingIndicator = () => (
         <View className="flex-1 justify-center items-center">
             <ActivityIndicator size="large" color="#0061FF" />
             <Text style={{fontFamily: 'Rubik-Regular', marginTop: 10, color: '#666876'}}>
                 Loading messages...
             </Text>
         </View>
     );
    
    // Custom empty state component
    const EmptyStateIndicator = () => (
        <View className="flex-1 justify-center items-center">
            <Text style={{fontFamily: 'Rubik-Medium', fontSize: 16, color: '#666876'}}>
                No conversations yet.
            </Text>
            <Text style={{fontFamily: 'Rubik-Regular', fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center', paddingHorizontal: 20}}>
                When a lister accepts your application, your chat will appear here.
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Screen Header */}
            <View className="p-5 flex-row justify-between items-center border-b border-gray-200">
                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300">
                    Messages
                </Text>
            </View>
            
            {/* This component is provided by Stream. It automatically
              fetches and displays the user's channels based on the filters.
            */}
            <ChannelList
                filters={filters}
                sort={sort}
                onSelect={(channel) => {
                    // Navigate to the individual chat screen, passing the Channel ID (cid)
                    router.push(`/chat/${channel.cid}`);
                }}
                LoadingIndicator={LoadingIndicator} // Show custom loading
                EmptyStateIndicator={EmptyStateIndicator} // Show custom empty state
            />
        </SafeAreaView>
    );
};

export default MessagesScreen;
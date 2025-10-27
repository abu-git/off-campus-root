// File: app/chat/[cid].jsx
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Channel, MessageList, MessageInput, useChatContext } from 'stream-chat-expo';
import { View, ActivityIndicator, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import icons from '../../constants/icons';

const ChatScreen = () => {
    const router = useRouter();
    // Get the Channel ID (cid) from the URL
    const { cid, backPath } = useLocalSearchParams();
    const { client } = useChatContext();
    const [channel, setChannel] = useState(null);

    // Font for loading text
    const [fontsLoaded] = useFonts({
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });

    useEffect(() => {
        const fetchChannel = async () => {
            // Wait for client and a valid CID
            if (!client || !cid || typeof cid !== 'string') {
                console.log("Waiting for client or CID...");
                return;
            }
            try {
                console.log(`Fetching channel with CID: ${cid}`);
                // Query Stream for the specific channel
                const channels = await client.queryChannels({ cid: cid });
                
                if (channels.length > 0) {
                    setChannel(channels[0]);
                } else {
                    console.error("Channel not found for CID:", cid);
                    router.back();
                }
            } catch (error) {
                console.error("Error fetching channel:", error);
                router.back();
            }
        };

        fetchChannel();

    }, [client, cid]); // Re-run if client or cid changes

    // Handle the back press
    const handleBack = () => {
        // Use the backPath if it exists, otherwise default to router.back()
        if (typeof backPath === 'string' && backPath) {
            router.replace(backPath);
        } else {
            router.back();
        }
    };

    // Show loading spinner until fonts are loaded and channel is fetched
    if (!channel || !fontsLoaded) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0061FF"/>
                <Text style={{ fontFamily: 'Rubik-Regular', marginTop: 10, color: '#666876' }}>
                    Loading chat...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* The Channel component connects to the specific channel */}
            <Channel channel={channel}>
                <View style={{ flex: 1 }}>
                    <View className="flex-row items-center p-3 border-b border-gray-200 bg-white">
                        <TouchableOpacity onPress={handleBack} className="p-2 mr-2">
                            <Image source={icons.backArrow} className="w-6 h-6" />
                        </TouchableOpacity>
                        {/* You can add channel image/name here if you want */}
                        <Text 
                            style={{ fontFamily: 'Rubik-Bold' }} 
                            className="text-lg flex-1"
                            numberOfLines={1}
                        >
                            {/* Get the name of the other person in the chat */}
                            {Object.values(channel.state.members).find(member => member.user_id !== client.userID)?.user?.name || 'Chat'}
                        </Text>
                    </View>

                    {/* Stream's <MessageList /> and <MessageInput /> handle
                      all the logic for displaying messages and sending new ones.
                    */}
                    <MessageList />
                    <MessageInput />
                </View>
            </Channel>
        </SafeAreaView>
    );
};

export default ChatScreen;
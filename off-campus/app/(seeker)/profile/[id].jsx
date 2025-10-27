// File: app/profile/[id].jsx
import React, { useEffect, useState } from 'react';
import { useFonts } from "expo-font";
import { ActivityIndicator, ScrollView, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPersonProfileById } from '../../../sanity'; // Adjust path
import { useUser } from '@clerk/clerk-expo';
import { useChatContext } from 'stream-chat-expo';
import icons from '../../../constants/icons'; // Adjust path

// --- Helper: Map for human-readable values ---
// This map translates the stored values (e.g., 'very_neat') 
// into the display text from the PDF.
const displayValueMap = {
    // Sleep Schedule
    'early_riser': 'Early Riser (sleeps before midnight)',
    'night_owl': 'Night Owl (sleeps late)',
    'balanced': 'Regular / Balanced',
    'flexible': 'Flexible / Irregular',
    // Cleanliness
    'very_neat': 'Very Neat (spotless and organized)',
    'moderate': 'Moderately Clean',
    'laidback': 'Laidback (okay with a little clutter)',
    'irregular': 'Irregular (depends on mood)',
    // Social & Friendliness
    'social': 'Social / Outgoing',
    'moderate': 'Moderately Social / Balanced',
    'reserved': 'Reserved / Quiet',
    // Noise
    'quiet': 'Very Quiet',
    'lively': 'Lively (doesn\'t mind noise)',
    // Respect
    'very_respectful': 'Very Respectful (always asks)',
    'respectful_easygoing': 'Respectful but Easygoing',
    'chill': 'Chill / Easygoing',
    // Fallbacks
    'no_preference': 'No Preference',
    'default': 'Not specified'
};

// Helper component for clean, reusable rows
const ProfileDetailRow = ({ label, valueKey }) => (
    <View className="py-3 border-b border-gray-200">
        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-gray-500">{label}</Text>
        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-lg text-black-300 mt-1 capitalize">
            {displayValueMap[valueKey] || valueKey || displayValueMap['default']}
        </Text>
    </View>
);

const PublicProfileScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const { user: currentUser } = useUser();
    const { client: chatClient } = useChatContext();

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../../assets/fonts/Rubik-Regular.ttf"),
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // This now fetches the nested structure
                const result = await getPersonProfileById(id);
                setProfile(result);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleStartChat = async () => {
        if (!currentUser || !profile || !profile.clerkId) {
            Alert.alert("Error", "Cannot initiate chat. User data missing.");
            return;
        }
        if (currentUser.id === profile.clerkId) {
             Alert.alert("This is you!", "You cannot start a chat with yourself.");
             return;
        }
        
        try {
            const channel = chatClient.channel('messaging', {
                members: [currentUser.id, profile.clerkId],
                name: `Chat with ${profile.fullName}`,
            });
            await channel.watch(); // Create and watch the channel
            router.push(`/chat/${channel.cid}`);
        } catch (error) {
            console.error("Error starting chat:", error);
            Alert.alert("Chat Error", "Could not start the conversation.");
        }
    };

    if (!fontsLoaded || loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    if (!profile) {
        return <View className='flex-1 justify-center items-center bg-white'><Text style={{ fontFamily: 'Rubik-Medium' }}>Profile not found.</Text></View>;
    }

    // Destructure for easier access
    const { characteristics, preferences } = profile;

    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView contentContainerClassName="p-5 pb-32">
                <TouchableOpacity onPress={() => router.push('/(seeker)/roommates')} className="mb-4">
                    <Text className="text-primary-300 text-base" style={{fontFamily: 'Rubik-Medium'}}>← Back</Text>
                </TouchableOpacity>

                {/* --- Header --- */}
                <View className="items-center">
                    <Image source={{ uri: profile.imageUrl }} className="size-32 rounded-full border-4 border-primary-100" />
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300 mt-4">{profile.fullName}</Text>
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-xl text-gray-600">{profile.occupation}</Text>
                    <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-500 mt-1">{profile.age ? `${profile.age} years old` : ''}</Text>

                    {/* --- Start Chat Button --- */}
                    {/* Hide button if viewing your own profile */}
                    {currentUser.id !== profile.clerkId && (
                        <TouchableOpacity 
                            onPress={handleStartChat} 
                            className="bg-primary-300 py-3 px-10 rounded-full mt-4 flex-row items-center"
                        >
                            <Image source={icons.chat} className="w-5 h-5 mr-2" tintColor="white" />
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-lg">Start Chat</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* --- About Me Section --- */}
                <View className="mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-2">About Me</Text>
                    <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-700 leading-6">{profile.bio || 'No bio provided.'}</Text>
                </View>

                {/* --- Section 1: Characteristics [cite: 328-329] --- */}
                <View className="mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-2">Lifestyle & Habits</Text>
                    <ProfileDetailRow label="Sleep Schedule" valueKey={characteristics?.sleepSchedule} />
                    <ProfileDetailRow label="Tidiness" valueKey={characteristics?.cleanliness} />
                    <ProfileDetailRow label="Social Lifestyle" valueKey={characteristics?.socialLifestyle} />
                    <ProfileDetailRow label="Noise Preference" valueKey={characteristics?.noisePreference} />
                    <ProfileDetailRow label="Boundaries & Respect" valueKey={characteristics?.respect} />
                    <ProfileDetailRow label="Smoker" valueKey={profile.smoker ? 'Yes' : 'No'} />
                    <ProfileDetailRow label="Has Pets" valueKey={profile.hasPets ? 'Yes' : 'No'} />
                </View>

                {/* --- Section 2: Preferences [cite: 330-331] --- */}
                <View className="mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-2">Looking For in a Roommate</Text>
                    <ProfileDetailRow label="Preferred Gender" valueKey={preferences?.preferredGender} />
                    <ProfileDetailRow label="Preferred Sleep Schedule" valueKey={preferences?.preferredSleepSchedule} />
                    <ProfileDetailRow label="Preferred Tidiness" valueKey={preferences?.preferredCleanliness} />
                    <ProfileDetailRow label="Preferred Social Lifestyle" valueKey={preferences?.preferredSocialLifestyle} />
                    <ProfileDetailRow label="Preferred Noise Level" valueKey={preferences?.preferredNoiseLevel} />
                    <ProfileDetailRow label="Preferred Respect Level" valueKey={preferences?.preferredRespect} />
                </View>
                
                {/* --- Budget Section --- */}
                <View className="mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-2">Financials</Text>
                    <ProfileDetailRow label="My Max Budget" valueKey={profile.maxBudget ? `₦${profile.maxBudget.toLocaleString()}` : null} />
                    <ProfileDetailRow label="Preferred Roommate Min. Budget" valueKey={preferences?.preferredMinBudget ? `₦${preferences.preferredMinBudget.toLocaleString()}` : null} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PublicProfileScreen;
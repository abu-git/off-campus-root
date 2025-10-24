import React, { useEffect, useState } from 'react';
import { useFonts } from "expo-font";
import { ActivityIndicator, ScrollView, Text, View, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPersonProfileById } from '../../../sanity'; // Import our new function

// Helper component for clean, reusable rows
const ProfileDetailRow = ({ label, value }) => (
    <View className="py-3 border-b border-gray-200">
        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-gray-500">{label}</Text>
        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-lg text-black-300 mt-1">{value || 'Not specified'}</Text>
    </View>
);

const PublicProfileScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (!fontsLoaded || loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    if (!profile) {
        return <View className='flex-1 justify-center items-center bg-white'><Text style={{ fontFamily: 'Rubik-Medium' }}>Profile not found.</Text></View>;
    }

    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView contentContainerClassName="p-5">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-primary-300 text-base">← Back</Text>
                </TouchableOpacity>

                {/* --- Header --- */}
                <View className="items-center">
                    <Image source={{ uri: profile.imageUrl }} className="size-32 rounded-full border-4 border-primary-100" />
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300 mt-4">{profile.fullName}</Text>
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-xl text-gray-600">{profile.occupation}</Text>
                </View>

                {/* --- About Me Section --- */}
                <View className="mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-2">About Me</Text>
                    <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-700 leading-6">{profile.bio || 'No bio provided.'}</Text>
                </View>

                {/* --- Lifestyle Details Section --- */}
                <View className="mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-2">Lifestyle</Text>
                    <ProfileDetailRow label="Age" value={profile.age} />
                    <ProfileDetailRow label="Cleanliness" value={profile.cleanliness} />
                    {/* ✅ Handle boolean values */}
                    <ProfileDetailRow label="Smoker" value={profile.smoker ? 'Yes' : 'No'} />
                    <ProfileDetailRow label="Has Pets" value={profile.hasPets ? 'Yes' : 'No'} />
                </View>

                {/* ✅ NEW: Social Habits Section (for arrays) */}
                <View className="mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-2">Social Habits</Text>
                    <View className="flex-row flex-wrap gap-2 items-center">
                        {profile.socialHabits?.length > 0 ? (
                            profile.socialHabits.map((habit, index) => (
                                <Text key={index} style={{ fontFamily: 'Rubik-Bold' }} className="bg-primary-100 text-primary-300 px-3 py-1 rounded-full">
                                    {habit}
                                </Text>
                            ))
                        ) : (
                            <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-500">Not specified</Text>
                        )}
                    </View>
                </View>

                {/* --- Looking For Section --- */}
                <View className="mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-2">Looking For</Text>
                    <ProfileDetailRow label="Maximum Budget" value={`₦${profile.maxBudget?.toLocaleString()} / year`} />
                    {/* ✅ Added Move-in Date */}
                    <ProfileDetailRow label="Ideal Move-in Date" value={profile.moveInDate} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PublicProfileScreen;
import React from 'react';
import { useFonts } from "expo-font";
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ 1. Import our new Sanity functions for profiles
import { getPersonProfile, createOrUpdatePersonProfile } from '../../sanity';

const EditProfile = () => {
    // --- Hooks and Setup ---
    const { user } = useUser();
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    });

    // ✅ 2. Create state for each form field
    const [bio, setBio] = useState('');
    const [occupation, setOccupation] = useState('');
    const [cleanliness, setCleanliness] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // ✅ 3. Function to load existing profile data when the screen opens
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            try {
                const profile = await getPersonProfile(user.id);
                if (profile) {
                    // If a profile exists, populate the form fields
                    setBio(profile.bio || '');
                    setOccupation(profile.occupation || '');
                    setCleanliness(profile.cleanliness || '');
                    setMaxBudget(profile.maxBudget?.toString() || '');
                }
            } catch (error) {
                console.log("Failed to load profile:", error);
                Alert.alert("Error", "Could not load your profile data.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user]); // Re-run if the user object changes

    // ✅ 4. Function to handle saving the data to Sanity
    const handleSave = async () => {
        if (!user) {
            Alert.alert("Error", "You must be signed in to save a profile.");
            return;
        }

        setIsSaving(true);
        try {
            const profileData = {
                clerkId: user.id,
                fullName: user.fullName,
                imageUrl: user.imageUrl,
                bio,
                occupation,
                cleanliness,
                maxBudget: Number(maxBudget) || 0, // Convert budget to a number
            };

            await createOrUpdatePersonProfile(profileData);
            Alert.alert("Success!", "Your roommate profile has been saved.");
            router.back(); // Go back to the main profile screen
        } catch (error) {
            console.log("Failed to save profile:", error);
            Alert.alert("Error", "Something went wrong while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!fontsLoaded || loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    // --- JSX Form ---
    return (
        <SafeAreaView className="bg-white h-full">
            <ScrollView contentContainerClassName="p-5">
                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-5">
                    Edit Your Roommate Profile
                </Text>

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mb-2">About Me</Text>
                <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell potential roommates a little about yourself..."
                    multiline
                    className="bg-gray-100 p-3 rounded-lg h-32"
                    style={{ fontFamily: 'Rubik-Regular' }}
                    textAlignVertical="top"
                />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mt-4 mb-2">Occupation</Text>
                <TextInput
                    value={occupation}
                    onChangeText={setOccupation}
                    placeholder="e.g., Student, Professional, Freelancer"
                    className="bg-gray-100 p-3 rounded-lg"
                    style={{ fontFamily: 'Rubik-Regular' }}
                />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mt-4 mb-2">Cleanliness Level</Text>
                <TextInput
                    value={cleanliness}
                    onChangeText={setCleanliness}
                    placeholder="e.g., Very Tidy, Casually Clean"
                    className="bg-gray-100 p-3 rounded-lg"
                    style={{ fontFamily: 'Rubik-Regular' }}
                />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mt-4 mb-2">Maximum Budget (₦)</Text>
                <TextInput
                    value={maxBudget}
                    onChangeText={setMaxBudget}
                    placeholder="e.g., 100000"
                    keyboardType="numeric"
                    className="bg-gray-100 p-3 rounded-lg"
                    style={{ fontFamily: 'Rubik-Regular' }}
                />

                <TouchableOpacity 
                    onPress={handleSave} 
                    disabled={isSaving}
                    className="bg-primary-300 py-4 rounded-full mt-8"
                >
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;
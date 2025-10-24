import React from 'react';
import { useFonts } from "expo-font";
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
// ✅ 1. Import Switch
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPersonProfile, createOrUpdatePersonProfile } from '../../../sanity';
import icons from '../../../constants/icons';

const EditProfile = () => {
    // --- Hooks and Setup ---
    const { user } = useUser();
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../../assets/fonts/Rubik-Regular.ttf"),
    });

    // ✅ 2. State for all form fields
    const [bio, setBio] = useState('');
    const [occupation, setOccupation] = useState('');
    const [cleanliness, setCleanliness] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [age, setAge] = useState('');
    const [socialHabits, setSocialHabits] = useState(''); // Handled as comma-separated string
    const [smoker, setSmoker] = useState(false);
    const [hasPets, setHasPets] = useState(false);
    const [moveInDate, setMoveInDate] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // ✅ 3. Updated load function
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            try {
                const profile = await getPersonProfile(user.id);
                if (profile) {
                    setBio(profile.bio || '');
                    setOccupation(profile.occupation || '');
                    setCleanliness(profile.cleanliness || '');
                    setMaxBudget(profile.maxBudget?.toString() || '');
                    // Load new fields
                    setAge(profile.age?.toString() || '');
                    setSocialHabits(profile.socialHabits?.join(', ') || ''); // Convert array to string
                    setSmoker(profile.smoker || false);
                    setHasPets(profile.hasPets || false);
                    setMoveInDate(profile.moveInDate || '');
                }
            } catch (error) {
                console.log("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    // ✅ 4. Updated save function
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // Convert comma-separated string to an array
            const socialHabitsArray = socialHabits.split(',').map(s => s.trim()).filter(s => s);

            const profileData = {
                clerkId: user.id,
                fullName: user.fullName,
                imageUrl: user.imageUrl,
                bio,
                occupation,
                cleanliness,
                maxBudget: Number(maxBudget) || 0,
                // Add new fields
                age: Number(age) || null,
                socialHabits: socialHabitsArray,
                smoker,
                hasPets,
                moveInDate: moveInDate || null, // Send YYYY-MM-DD string or null
            };

            await createOrUpdatePersonProfile(profileData);
            Alert.alert("Success!", "Your roommate profile has been saved.");
            router.back();
        } catch (error) {
            console.log("Failed to save profile:", error);
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
            <ScrollView contentContainerClassName="p-5" keyboardShouldPersistTaps="handled">
                <View className="flex-row items-center justify-between mb-5">
                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        className="flex flex-row bg-primary-200 rounded-full p-3 items-center justify-center mr-4"
                    >
                        <Image source={icons.backArrow} className="size-5" />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 flex-1 text-center">
                        Edit Profile
                    </Text>
                     <View className="size-11" />
                </View>

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

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mt-4 mb-2">Age</Text>
                <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="e.g., 24"
                    keyboardType="numeric"
                    className="bg-gray-100 p-3 rounded-lg"
                    style={{ fontFamily: 'Rubik-Regular' }}
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

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mt-4 mb-2">Social Habits</Text>
                <TextInput
                    value={socialHabits}
                    onChangeText={setSocialHabits}
                    placeholder="e.g., Often have friends over, Mostly keep to myself"
                    className="bg-gray-100 p-3 rounded-lg"
                    style={{ fontFamily: 'Rubik-Regular' }}
                />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mt-4 mb-2">Ideal Move-in Date</Text>
                <TextInput
                    value={moveInDate}
                    onChangeText={setMoveInDate}
                    placeholder="YYYY-MM-DD"
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

                {/* --- Boolean Switches --- */}
                <View className="flex-row items-center justify-between mt-6">
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg">Are you a smoker?</Text>
                    <Switch value={smoker} onValueChange={setSmoker} />
                </View>
                <View className="flex-row items-center justify-between mt-4">
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg">Do you have pets?</Text>
                    <Switch value={hasPets} onValueChange={setHasPets} />
                </View>

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
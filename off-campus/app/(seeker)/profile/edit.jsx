// File: app/(seeker)/profile/edit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from "expo-font";
import { useUser } from '@clerk/clerk-expo';
import { useRouter, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPersonProfile, createOrUpdatePersonProfile } from '../../../sanity'; // Adjust path
import icons from '../../../constants/icons'; // Adjust path

// --- Helper Component for Option Selection ---
// Renders a title and a set of pressable options
const OptionSelector = ({ title, options, selectedValue, onSelect, fontFamily }) => (
    <View className="mt-5">
        <Text style={{ fontFamily: fontFamily.medium }} className="text-base text-black-200 mb-2">{title}</Text>
        <View className="flex-col gap-2">
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    onPress={() => onSelect(option.value)}
                    className={`p-4 rounded-lg border ${selectedValue === option.value ? 'bg-primary-100 border-primary-300' : 'bg-gray-100 border-gray-200'}`}
                >
                    <Text style={{ fontFamily: fontFamily.medium }} className={`text-base ${selectedValue === option.value ? 'text-primary-300' : 'text-black-300'}`}>
                        {option.title}
                    </Text>
                    {option.description && (
                         <Text style={{ fontFamily: fontFamily.regular }} className={`text-sm mt-1 ${selectedValue === option.value ? 'text-primary-300' : 'text-gray-500'}`}>
                            {option.description}
                         </Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

// --- Form Questions (from PDF) ---
const characteristicQuestions = [
    {
        key: 'sleepSchedule',
        title: '1. How would you describe your sleep schedule?',
        options: [
            { title: 'Early Riser', description: 'I sleep before midnight and wake up early.', value: 'early_riser' },
            { title: 'Night Owl', description: 'Active at night, I sleep late and wake up late.', value: 'night_owl' },
            { title: 'Regular/Balanced Sleeper', description: 'Around midnight to 8am.', value: 'balanced' },
            { title: 'Flexible / Irregular', description: 'Depends on classes or workload.', value: 'flexible' },
        ]
    },
    {
        key: 'cleanliness',
        title: '2. How tidy are you?',
        options: [
            { title: 'Very Neat', description: 'I like my space spotless and organized.', value: 'very_neat' },
            { title: 'Moderately Clean', description: 'I keep things clean but not overly strict.', value: 'moderate' },
            { title: 'Laidback', description: "I'm okay with a little clutter sometimes.", value: 'laidback' },
            { title: 'Irregular', description: "It depends on my mood, I'm sometimes neat and sometimes not.", value: 'irregular' },
        ]
    },
    {
        key: 'socialLifestyle',
        title: '3. How social are you at home?',
        options: [
            { title: 'Social/Outgoing', description: 'Enjoy hanging out and having friends over.', value: 'social' },
            { title: 'Moderately Social', description: 'Enjoy company sometimes but also like quiet time.', value: 'moderate' },
            { title: 'Reserved', description: 'I prefer to keep to myself most times.', value: 'reserved' },
            { title: 'Flexible / Depends on Situation', description: "Switch between social and quiet.", value: 'flexible' },
        ]
    },
    {
        key: 'noisePreference',
        title: '4. What kind of noise level do you prefer at home?',
        options: [
            { title: 'Very Quiet', description: 'I like a calm, peaceful space.', value: 'quiet' },
            { title: 'Moderate', description: "I'm fine with some background activity.", value: 'moderate' },
            { title: 'Lively', description: "I don't mind a bit of noise or movement.", value: 'lively' },
        ]
    },
    {
        key: 'respect',
        title: '5. How do you handle boundaries and respect?',
        options: [
            { title: "Very Respectful", description: "I always ask before using anyone's things.", value: 'very_respectful' },
            { title: 'Respectful but Easygoing', description: "I respect boundaries but don't mind sharing.", value: 'respectful_easygoing' },
            { title: "Chill/Easygoing", description: "I'm relaxed about privacy as long as it's mutual.", value: 'chill' },
        ]
    },
];

const preferenceQuestions = [
     {
        key: 'preferredGender',
        title: '1. What gender would you prefer your roommate to be?',
        options: [
            { title: 'Male', value: 'male' },
            { title: 'Female', value: 'female' },
            { title: 'No Preference', value: 'no_preference' },
        ]
    },
     {
        key: 'preferredSleepSchedule',
        title: '2. What sleep schedule would you prefer your roommate has?',
        options: [
            { title: 'Early Riser', value: 'early_riser' },
            { title: 'Night Owl', value: 'night_owl' },
            { title: 'Flexible / No Preference', value: 'no_preference' },
        ]
    },
    {
        key: 'preferredCleanliness',
        title: '3. How tidy would you like your roommate to be?',
        options: [
            { title: 'Very Neat', value: 'very_neat' },
            { title: 'Moderately Clean', value: 'moderate' },
            { title: 'Laidback / Easygoing', value: 'laidback' },
        ]
    },
    {
        key: 'preferredSocialLifestyle',
        title: '4. What social lifestyle do you prefer in a roommate?',
        options: [
            { title: 'Outgoing/Sociable', value: 'social' },
            { title: 'Balanced', value: 'moderate' },
            { title: 'Reserved / Quiet', value: 'reserved' },
        ]
    },
    {
        key: 'preferredNoiseLevel',
        title: '5. How quiet or lively would you like the space to be?',
        options: [
            { title: 'Very Quiet (study or rest-friendly)', value: 'quiet' },
            { title: 'Moderate (some noise is fine)', value: 'moderate' },
            { title: 'No Preference', value: 'no_preference' },
        ]
    },
    {
        key: 'preferredRespect',
        title: '6. How respectful would you like your roommate to be?',
        options: [
            { title: 'Very Respectful', value: 'very_respectful' },
            { title: 'Respectful but Easygoing', value: 'respectful_easygoing' },
            { title: 'Chill/Easygoing', value: 'chill' },
        ]
    },
];

// --- Main Component ---
const EditProfile = () => {
    const { user } = useUser();
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../../assets/fonts/Rubik-Regular.ttf"),
    });

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Base Info
    const [age, setAge] = useState('');
    const [occupation, setOccupation] = useState('');
    const [bio, setBio] = useState('');
    const [smoker, setSmoker] = useState(false);
    const [hasPets, setHasPets] = useState(false);
    const [moveInDate, setMoveInDate] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [preferredMinBudget, setPreferredMinBudget] = useState('');

    // Dynamic state for all criteria
    const [characteristics, setCharacteristics] = useState({
        sleepSchedule: '',
        cleanliness: '',
        socialLifestyle: '',
        noisePreference: '',
        respect: '',
    });
    const [preferences, setPreferences] = useState({
        preferredGender: '',
        preferredSleepSchedule: '',
        preferredCleanliness: '',
        preferredSocialLifestyle: '',
        preferredNoiseLevel: '',
        preferredRespect: '',
    });
    
    // --- Data Loading ---
    useFocusEffect(
        useCallback(() => {
            const loadProfile = async () => {
                if (!user) return;
                setLoading(true);
                try {
                    const profile = await getPersonProfile(user.id);
                    if (profile) {
                        // Load base info
                        setAge(profile.age?.toString() || '');
                        setOccupation(profile.occupation || '');
                        setBio(profile.bio || '');
                        setSmoker(profile.smoker || false);
                        setHasPets(profile.hasPets || false);
                        setMoveInDate(profile.moveInDate || '');
                        setMaxBudget(profile.maxBudget?.toString() || '');
                        setPreferredMinBudget(profile.preferredMinBudget?.toString() || '');

                        // Load characteristics
                        setCharacteristics({
                            sleepSchedule: profile.sleepSchedule || '',
                            cleanliness: profile.cleanliness || '',
                            socialLifestyle: profile.socialLifestyle || '',
                            noisePreference: profile.noisePreference || '',
                            respect: profile.respect || '',
                        });
                        
                        // Load preferences
                        setPreferences({
                            preferredGender: profile.preferredGender || '',
                            preferredSleepSchedule: profile.preferredSleepSchedule || '',
                            preferredCleanliness: profile.preferredCleanliness || '',
                            preferredSocialLifestyle: profile.preferredSocialLifestyle || '',
                            preferredNoiseLevel: profile.preferredNoiseLevel || '',
                            preferredRespect: profile.preferredRespect || '',
                        });
                    }
                } catch (error) {
                    console.log("Failed to load profile:", error);
                } finally {
                    setLoading(false);
                }
            };
            loadProfile();
        }, [user])
    );

    // --- Data Saving ---
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const profileData = {
                clerkId: user.id,
                fullName: user.fullName,
                imageUrl: user.imageUrl,
                gender: user.gender, // Assuming gender is on the Clerk user object
                age: Number(age) || null,
                occupation,
                bio,
                smoker,
                hasPets,
                moveInDate: moveInDate || null,
                maxBudget: Number(maxBudget) || 0,
                preferredMinBudget: Number(preferredMinBudget) || 0,
                ...characteristics,
                ...preferences,
            };

            await createOrUpdatePersonProfile(profileData);
            Alert.alert("Success!", "Your roommate profile has been saved.");
            router.back();
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

    const fontStyles = {
        bold: 'Rubik-Bold',
        medium: 'Rubik-Medium',
        regular: 'Rubik-Regular'
    };

    // --- JSX Form ---
    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView contentContainerClassName="p-5" keyboardShouldPersistTaps="handled">
                {/* --- Header --- */}
                <View className="flex-row items-center justify-between mb-5">
                    <TouchableOpacity onPress={() => router.push('/(seeker)/profile')} className="p-2">
                        <Image source={icons.backArrow} className="w-6 h-6" />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: fontStyles.bold }} className="text-2xl text-black-300 flex-1 text-center">
                        Edit Roommate Profile
                    </Text>
                    <View className="w-8" />
                </View>

                {/* --- Base Info Section --- */}
                <Text style={{ fontFamily: fontStyles.bold }} className="text-xl text-black-300 mb-2">Basic Info</Text>
                <Text style={{ fontFamily: fontStyles.medium }} className="text-base text-black-200 mb-2">About Me</Text>
                <TextInput value={bio} onChangeText={setBio} multiline placeholder="Tell potential roommates a little about yourself..."
                    className="bg-gray-100 p-3 rounded-lg h-32" style={{ fontFamily: fontStyles.regular }} textAlignVertical="top" />

                <Text style={{ fontFamily: fontStyles.medium }} className="text-base text-black-200 mt-4 mb-2">Age</Text>
                <TextInput value={age} onChangeText={setAge} placeholder="e.g., 24" keyboardType="numeric"
                    className="bg-gray-100 p-3 rounded-lg" style={{ fontFamily: fontStyles.regular }} />

                <Text style={{ fontFamily: fontStyles.medium }} className="text-base text-black-200 mt-4 mb-2">Occupation</Text>
                <TextInput value={occupation} onChangeText={setOccupation} placeholder="e.g., Student, Professional"
                    className="bg-gray-100 p-3 rounded-lg" style={{ fontFamily: fontStyles.regular }} />
                
                <Text style={{ fontFamily: fontStyles.medium }} className="text-base text-black-200 mt-4 mb-2">Ideal Move-in Date</Text>
                <TextInput value={moveInDate} onChangeText={setMoveInDate} placeholder="YYYY-MM-DD"
                    className="bg-gray-100 p-3 rounded-lg" style={{ fontFamily: fontStyles.regular }} />

                <View className="flex-row items-center justify-between mt-6">
                    <Text style={{ fontFamily: fontStyles.medium }} className="text-lg">Are you a smoker?</Text>
                    <Switch value={smoker} onValueChange={setSmoker} />
                </View>
                <View className="flex-row items-center justify-between mt-4">
                    <Text style={{ fontFamily: fontStyles.medium }} className="text-lg">Do you have pets?</Text>
                    <Switch value={hasPets} onValueChange={setHasPets} />
                </View>

                {/* --- Section 1: About You --- */}
                <Text style={{ fontFamily: fontStyles.bold }} className="text-xl text-black-300 mt-10 mb-2 border-t border-gray-200 pt-6">
                    Section 1: About You
                </Text>
                {characteristicQuestions.map((q) => (
                    <OptionSelector
                        key={q.key}
                        title={q.title}
                        options={q.options}
                        selectedValue={characteristics[q.key]}
                        onSelect={(value) => setCharacteristics(prev => ({ ...prev, [q.key]: value }))}
                        fontFamily={fontStyles}
                    />
                ))}
                <Text style={{ fontFamily: fontStyles.medium }} className="text-base text-black-200 mt-4 mb-2">What's your maximum budget?</Text>
                <TextInput value={maxBudget} onChangeText={setMaxBudget} placeholder="e.g., 100000" keyboardType="numeric"
                    className="bg-gray-100 p-3 rounded-lg" style={{ fontFamily: fontStyles.regular }} />


                {/* --- Section 2: My Preferred Roommate --- */}
                <Text style={{ fontFamily: fontStyles.bold }} className="text-xl text-black-300 mt-10 mb-2 border-t border-gray-200 pt-6">
                    Section 2: My Preferred Roommate
                </Text>
                {preferenceQuestions.map((q) => (
                    <OptionSelector
                        key={q.key}
                        title={q.title}
                        options={q.options}
                        selectedValue={preferences[q.key]}
                        onSelect={(value) => setPreferences(prev => ({ ...prev, [q.key]: value }))}
                        fontFamily={fontStyles}
                    />
                ))}
                 <Text style={{ fontFamily: fontStyles.medium }} className="text-base text-black-200 mt-4 mb-2">What's the minimum budget you'd prefer your roommate to have?</Text>
                <TextInput value={preferredMinBudget} onChangeText={setPreferredMinBudget} placeholder="e.g., 80000" keyboardType="numeric"
                    className="bg-gray-100 p-3 rounded-lg" style={{ fontFamily: fontStyles.regular }} />


                {/* --- Save Button --- */}
                <TouchableOpacity 
                    onPress={handleSave} 
                    disabled={isSaving}
                    className={`bg-primary-300 py-4 rounded-full mt-10 mb-5 ${isSaving ? 'opacity-50' : ''}`}
                >
                    <Text style={{ fontFamily: fontStyles.bold }} className="text-white text-center text-lg">
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;
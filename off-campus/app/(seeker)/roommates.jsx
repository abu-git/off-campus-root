// File: app/(seeker)/roommates.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoommateCard } from '../../components/RoommateCard'; // Adjust path
import { getAllSeekerProfiles, getPersonProfile } from '../../sanity'; // Adjust path
import { useUser } from '@clerk/clerk-expo';
import { calculateCompatibility } from '../../services/compatibility'; // Adjust path

const RoommatesExplore = () => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const router = useRouter();
    
    // State for the current user's profile and all other profiles
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [allOtherProfiles, setAllOtherProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProfiles = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch both the current user's profile and all profiles in parallel
            const [myProfile, allProfiles] = await Promise.all([
                getPersonProfile(user.id),
                getAllSeekerProfiles()
            ]);

            if (!myProfile) {
                // Handle case where user hasn't created their profile yet
                console.warn("Current user has no roommate profile. Cannot calculate scores.");
                setLoading(false);
                // Optionally, you could render a "Please create your profile" message
                return;
            }

            setCurrentUserProfile(myProfile);

            // Filter out the current user from the list
            const otherProfiles = allProfiles.filter(profile => profile.clerkId !== user.id);

            // Calculate compatibility score for each "other" profile
            const profilesWithScores = otherProfiles.map(profile => {
                // Calculate score comparing ME (my preferences) vs THEM (their characteristics)
                const scoreMeVsThem = calculateCompatibility(myProfile, profile);
                
                // Calculate score comparing THEM (their preferences) vs ME (my characteristics)
                const scoreThemVsMe = calculateCompatibility(profile, myProfile);
                
                // Average the two scores for a more mutual match
                const mutualScore = Math.round((scoreMeVsThem + scoreThemVsMe) / 2);

                return {
                    ...profile,
                    compatibilityScore: mutualScore, // Add the score to the object
                };
            });

            // Sort by the highest compatibility score
            profilesWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

            setAllOtherProfiles(profilesWithScores);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, [user]); // Dependency on the user object

    // useFocusEffect re-fetches data every time the tab comes into view
    useFocusEffect(
        useCallback(() => {
            fetchProfiles();
        }, [fetchProfiles])
    );

    if (loading || !isUserLoaded) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }
    
    // Handle case where user needs to create their profile
    if (!currentUserProfile) {
         return (
            <SafeAreaView className="bg-white h-full flex-1 items-center justify-center p-5">
                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl text-black-300 text-center mb-4">
                    Create Your Profile to See Matches
                </Text>
                 <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-500 text-center mb-6">
                    Fill out your roommate profile so we can find the best matches for you.
                 </Text>
                <TouchableOpacity onPress={() => router.push('/profile/edit')} className="bg-primary-300 py-3 px-6 rounded-full">
                     <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-lg">Create Profile</Text>
                </TouchableOpacity>
            </SafeAreaView>
         );
    }

    return (
        <SafeAreaView className="bg-white h-full flex-1" edges={['top']}>
            <FlatList
                data={allOtherProfiles}
                renderItem={({ item }) => (
                    <RoommateCard 
                        profile={item} 
                        score={item.compatibilityScore}
                    />
                )}
                keyExtractor={(item) => item._id}
                numColumns={1} // Using 1 column for the new card layout
                contentContainerClassName="p-5"
                ListFooterComponent={<View className="h-8" />}
                ListHeaderComponent={() => (
                    <View className="mb-5">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300">
                            Find a Roommate
                        </Text>
                        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-gray-500 mt-1">
                            Your top matches based on compatibility.
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default RoommatesExplore;
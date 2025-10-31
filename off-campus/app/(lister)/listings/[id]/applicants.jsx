// File: app/(lister)/listings/[id]/applicants.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useChatContext } from 'stream-chat-expo'; // Import Stream chat context
import { getApplicationsForListing, updateApplicationStatus } from '../../../../sanity'; // Adjust path if needed
import { useFonts } from 'expo-font';

// --- ApplicantCard Component ---
const ApplicantCard = ({ application, onStatusChange }) => {
    const seeker = application.seeker;
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Medium": require("../../../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });
    if (!fontsLoaded) return null;

    return (
        <TouchableOpacity
            onPress={() => router.push(`/profile/${seeker._id}`)} // Navigate to public profile
            className="w-full mt-4 p-4 rounded-lg bg-white shadow-lg shadow-black-100/70"
        >
            <View className="flex-row items-center">
                <Image
                    source={{ uri: seeker?.imageUrl || 'https://via.placeholder.com/150' }}
                    className="size-16 rounded-full"
                />
                <View className="ml-4 flex-1">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-lg text-black-300">{seeker?.fullName}</Text>
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200">{seeker?.occupation}</Text>
                </View>
                <Text className={`px-2 py-1 text-xs rounded-full capitalize ${
                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {application.status}
                </Text>
            </View>

            <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-sm text-gray-600 mt-3" numberOfLines={3}>
                {seeker?.bio || "No bio provided."}
            </Text>

            {/* Action buttons (Accept/Reject) */}
            <View className="flex-row items-center justify-end mt-4 pt-3 border-t border-gray-200 gap-3">
                {/* Prevent Reject button press from triggering card's onPress */}
                <TouchableOpacity onPress={() => onStatusChange(application, 'rejected')} className="bg-red-500 px-4 py-2 rounded-full">
                    <Text className="text-white font-bold">Reject</Text>
                </TouchableOpacity>
                {/* Prevent Accept button press from triggering card's onPress */}
                <TouchableOpacity onPress={() => onStatusChange(application, 'accepted')} className="bg-green-500 px-4 py-2 rounded-full">
                    <Text className="text-white font-bold">Accept</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

// --- Main ApplicantsScreen Component ---
const ApplicantsScreen = () => {
    const { id: listingId } = useLocalSearchParams();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get the current user (the Lister) and the chat client
    const { user: listerUser } = useUser();
    const { client: chatClient } = useChatContext();

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Regular": require("../../../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
        "Rubik-Medium": require("../../../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
    });

    const fetchApplications = useCallback(async () => {
        if (!listingId) return;
        setLoading(true);
        try {
            const result = await getApplicationsForListing(listingId);
            setApplications(result);
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Could not load applicants.");
        } finally {
            setLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // ** Updated status change handler to trigger chat **
    const handleStatusChange = async (application, newStatus) => {
        if (!listerUser || !chatClient) {
            Alert.alert("Error", "User or chat service not ready. Please wait.");
            return;
        }

        console.log(application.listing?.title)

        // --- If the application is being ACCEPTED ---
        if (newStatus === 'accepted') {
            try {
                // 1. Get the seeker's profile from the application object
                const seeker = application.seeker;
                if (!seeker || !seeker.clerkId || !seeker.fullName) {
                    Alert.alert("Error", "Applicant data is incomplete. Cannot start chat.");
                    return;
                }
                
                console.log(`Creating chat channel between Lister ${listerUser.id} and Seeker ${seeker.clerkId}`);

                // 2. Define a new chat channel
                // We use a unique ID to prevent duplicate channels for the same application
                const channelId = `application-${application._id}`;
                const channel = chatClient.channel('messaging', channelId, {
                    members: [listerUser.id, seeker.clerkId],
                    name: `Chat for: ${application.listing?.title || 'your listing'}`,
                    listingId: application.listing?._id, // Custom data
                });

                // 3. Create and "watch" the channel
                await channel.create();
                await channel.watch(); // Start watching the channel

                console.log("Chat channel created successfully.");
                
                // 4. Update the application status in Sanity
                await updateApplicationStatus(application._id, newStatus);

                Alert.alert("Applicant Accepted!", "A chat has been started. You can now message the applicant.");
                fetchApplications(); // Refresh the list

            } catch (chatError) {
                console.error("Failed to create chat channel:", chatError);
                Alert.alert("Chat Error", "Could not start the chat. Please try again.");
            }
        } else {
            // --- For any other status (e.g., 'rejected') ---
            try {
                await updateApplicationStatus(application._id, newStatus);
                Alert.alert("Success", `Application has been ${newStatus}.`);
                fetchApplications(); // Refresh the list
            } catch (error) {
                Alert.alert("Error", "Could not update the status.");
            }
        }
    };

    if (!fontsLoaded || loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    return (
        <SafeAreaView className="bg-white flex-1">
            <FlatList
                data={applications}
                // Pass the full application object (item) to the handler
                renderItem={({ item }) => <ApplicantCard application={item} onStatusChange={handleStatusChange} />}
                keyExtractor={(item) => item._id}
                contentContainerClassName="p-5"
                ListHeaderComponent={() => (
                    <View className="mb-5">
                        <TouchableOpacity onPress={() => router.replace('/(lister)/listings')} className="mb-4">
                            <Text className="text-primary-300 text-base" style={{fontFamily: 'Rubik-Medium'}}>← Back to Listings</Text>
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-3xl text-black-300">
                            Roommate Applicants
                        </Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center mt-20">
                        <Text style={{fontFamily: 'Rubik-Medium'}} className="text-lg text-gray-500">No applications yet.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default ApplicantsScreen;
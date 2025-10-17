import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApplicationsForListing, updateApplicationStatus } from '../../../sanity';

// This is a new, specialized card component for this screen
const ApplicantCard = ({ application, onStatusChange }) => {
    const seeker = application.seeker; // The seeker's full profile is nested
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.push(`/profile/${seeker._id}`)}
            className="w-full mt-4 p-4 rounded-lg bg-white shadow-lg shadow-black-100/70"
        >
            <View className="w-full mt-4 p-4 rounded-lg bg-white shadow-lg shadow-black-100/70">
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

                <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-sm text-gray-600 mt-3">
                    {seeker?.bio}
                </Text>

                {/* Action buttons */}
                <View className="flex-row items-center justify-end mt-4 pt-3 border-t border-gray-200 gap-3">
                    <TouchableOpacity onPress={() => onStatusChange(application._id, 'rejected')} className="bg-red-500 px-4 py-2 rounded-full">
                        <Text className="text-white font-bold">Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onStatusChange(application._id, 'accepted')} className="bg-green-500 px-4 py-2 rounded-full">
                        <Text className="text-white font-bold">Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ApplicantsScreen = () => {
    const { id } = useLocalSearchParams(); // Gets the listing ID from the URL
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const result = await getApplicationsForListing(id);
            setApplications(result);
        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Could not load applicants.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await updateApplicationStatus(applicationId, newStatus);
            Alert.alert("Success", `Application has been ${newStatus}.`);
            // Refresh the list to show the updated status
            fetchApplications(); 
        } catch (error) {
            Alert.alert("Error", "Could not update the status.");
        }
    };

    if (loading) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={applications}
                renderItem={({ item }) => <ApplicantCard application={item} onStatusChange={handleStatusChange} />}
                keyExtractor={(item) => item._id}
                contentContainerClassName="p-5"
                ListHeaderComponent={() => (
                    <View className="mb-5">
                        <TouchableOpacity onPress={() => router.back()} className="mb-4">
                            <Text className="text-primary-300 text-base">← Back to Listing</Text>
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300">
                            Roommate Applicants
                        </Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center mt-20">
                        <Text className="text-lg text-gray-500">No applications yet.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default ApplicantsScreen;
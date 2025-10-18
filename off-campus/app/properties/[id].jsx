import { useFonts } from "expo-font";
import { ScrollView, View, Dimensions, Image, Platform, TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from '@clerk/clerk-expo'; // ✅ 1. Import useUser

// ✅ 2. Import the new application and profile functions
import { getListingDetails, getAgent, getPersonProfile, submitApplication, checkIfApplicationExists } from "../../sanity";
import images from "../../constants/images";
import icons from "../../constants/icons";
import { facilities } from "../../constants/data";

const PropertyDetail = () => {
    // --- Hooks and Setup ---
    const { id } = useLocalSearchParams();
    const { user } = useUser(); // Get the current logged-in user

    const windowHeight = Dimensions.get("window").height

    // --- State Variables ---
    const [listing, setListing] = useState(null);
    const [agent, setAgent] = useState(null);
    const [personProfile, setPersonProfile] = useState(null); // ✅ 3. Add state for the user's roommate profile
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false); // For button loading state
    const [hasApplied, setHasApplied] = useState(false)

    // --- Data Fetching ---
    useEffect(() => {
        const loadPageData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch listing and agent data in parallel for speed
                const listingResult = await getListingDetails(id);
                setListing(listingResult);

                if (listingResult?.agent) {
                    const agentResult = await getAgent(listingResult.agent);
                    setAgent(agentResult?.[0]);
                }

                // Separately, fetch the current user's roommate profile
                if (user) {
                    const profileResult = await getPersonProfile(user.id);
                    setPersonProfile(profileResult);

                    if (profileResult) {
                        const alreadyApplied = await checkIfApplicationExists(id, profileResult._id);
                        setHasApplied(alreadyApplied);
                    }
                }
            } catch (err) {
                console.log("Error loading page data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, [id, user]);

    // ✅ 4. Add the handler function for submitting an application
    const handleApply = async () => {
        if (!personProfile) {
            Alert.alert(
                "Create a Profile First",
                "You need a roommate profile to apply for shared rooms.",
                [{ text: "OK", onPress: () => router.push('/profile/edit') }]
            );
            return;
        }

        setIsApplying(true);
        try {
            await submitApplication(listing._id, personProfile._id);
            Alert.alert("Success!", "Your application has been sent.");
            setHasApplied(true);
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsApplying(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return <SafeAreaView className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#FF8A00" /></SafeAreaView>;
    }
    
    // ✅ 5. Define the dynamic button's text and action
    let buttonText = "Rent Now";
    let buttonAction = () => {};
    let buttonDisabled = false;

    if (listing?.listingType === 'sharedRoom') {
        if (hasApplied) {
            buttonText = "Applied";
            buttonDisabled = true;
        } else {
            buttonText = personProfile ? "Apply with Profile" : "Create Profile to Apply";
            buttonAction = handleApply;
            buttonDisabled = isApplying;
        }
    }

    const mainImage = listing?.galleryUrls?.[0] || 'https://via.placeholder.com/400';

    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 bg-white">
                {/* --- Top Image and Header --- */}
                <View className="relative w-full" style={{ height: windowHeight / 2 }}>
                    <Image source={{ uri: mainImage }} className="size-full" resizeMode="cover" />
                    <Image source={images.whiteGradient} className="absolute top-0 w-full z-40" />
                    <View className="z-50 absolute inset-x-7" style={{ top: Platform.OS === 'ios' ? 70 : 20 }}>
                        <View className="flex flex-row items-center w-full justify-between">
                            <TouchableOpacity onPress={() => router.back()} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
                                <Image source={icons.backArrow} className="size-5" />
                            </TouchableOpacity>
                            <View className="flex flex-row items-center gap-3">
                                <Image source={icons.heart} className="size-7" tintColor={"#191D31"} />
                                <Image source={icons.send} className="size-7" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* --- Main Content Body --- */}
                <View className="px-5 mt-7 flex gap-2">
                    {/* Title */}
                    <Text style={{ fontFamily: 'Rubik-ExtraBold' }} className='text-2xl'>{listing?.title}</Text>
                    
                    {/* Type and Rating */}
                    <View className="flex flex-row items-center gap-3">
                        <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className='text-xs text-primary-300'>{listing?.property?.type}</Text>
                        </View>
                        <View className="flex flex-row items-center gap-2">
                            <Image source={icons.star} className="size-5" />
                            <Text style={{ fontFamily: 'Rubik-Medium' }} className='text-black-200 text-sm mt-1'>{listing?.rating || '4.5'} (2 reviews)</Text>
                        </View>
                    </View>

                    {/* Bed/Bath/Area */}
                    <View className="flex flex-row items-center mt-5">
                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
                            <Image source={icons.bed} className="size-4" />
                        </View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{listing?.property?.totalBedrooms} Beds</Text>
                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
                            <Image source={icons.bath} className="size-4" />
                        </View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{listing?.property?.totalBathrooms} Baths</Text>
                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
                            <Image source={icons.location} className="size-4" />
                        </View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{listing?.property?.area}</Text>
                    </View>

                    {/* Agent Section */}
                    {agent && (
                        <View className="w-full border-t border-primary-200 pt-7 mt-5">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Agent</Text>
                            <View className="flex flex-row items-center justify-between mt-4">
                                <Image source={{ uri: agent?.image }} className="size-14 rounded-full" />
                                <View className="flex-1 flex-col items-start justify-center ml-3">
                                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-lg text-black-300 text-start">{agent?.name}</Text>
                                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-sm text-black-200 text-start">{agent?.isOwner ? 'Owner' : 'Agent' }</Text>
                                </View>
                                <View className="flex flex-row items-center gap-3">
                                    <Image source={icons.chat} className="size-7" />
                                    <Image source={icons.phone} className="size-7" />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Overview Section */}
                    <View className="mt-7">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Overview</Text>
                        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-black-200 text-base mt-2">
                            {listing?.description}
                        </Text>
                    </View>

                    {/* Roommate Details Section */}
                    {listing?.listingType === 'sharedRoom' && (
                        <View className="mt-7 border-t border-primary-200 pt-7">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Roommate Details</Text>
                            <View className="mt-4 flex flex-col gap-3">
                                <Text style={{ fontFamily: 'Rubik-Regular' }}><Text style={{ fontFamily: 'Rubik-Bold' }}>Room Type:</Text> {listing?.roomType}</Text>
                                <Text style={{ fontFamily: 'Rubik-Regular' }}><Text style={{ fontFamily: 'Rubik-Bold' }}>Current Occupants:</Text> {listing?.currentOccupants} people</Text>
                                <Text style={{ fontFamily: 'Rubik-Regular' }}><Text style={{ fontFamily: 'Rubik-Bold' }}>Private Bathroom:</Text> {listing?.privateBathroom ? 'Yes' : 'No'}</Text>
                                <Text style={{ fontFamily: 'Rubik-Bold' }} className="mt-2">Household Vibe:</Text>
                                <View className="flex flex-row flex-wrap gap-2 items-center">
                                    {listing?.householdVibe?.map((vibe, index) => (
                                        <Text key={index} style={{ fontFamily: 'Rubik-Bold' }} className="bg-primary-100 text-primary-300 px-3 py-1 rounded-full">{vibe}</Text>
                                    ))}
                                </View>
                                <Text style={{ fontFamily: 'Rubik-Bold' }} className="mt-2">House Rules:</Text>
                                <Text style={{ fontFamily: 'Rubik-Regular' }}>{listing?.houseRules}</Text>
                            </View>
                        </View>
                    )}

                    {/* Facilities Section */}
                    <View className="mt-7">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Facilities</Text>
                        {listing?.property?.facilities?.length > 0 && (
                            <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                                {listing.property.facilities.map((facilityName, index) => {
                                    const facilityDetails = facilities.find((f) => f.title === facilityName);
                                    return (
                                        <View key={index} className="flex flex-1 flex-col items-center min-w-16 max-w-20">
                                            <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                                                <Image source={facilityDetails ? facilityDetails.icon : icons.info} className="size-6" />
                                            </View>
                                            <Text style={{ fontFamily: 'Rubik-Regular' }} numberOfLines={1} ellipsizeMode="tail" className="text-black-300 text-sm text-center mt-1.5">
                                                {facilityName}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* Location Section */}
                    <View className='mt-7'>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Location</Text>
                        <View className="flex flex-row items-center justify-start mt-4 gap-2">
                            <Image source={icons.location} className="w-7 h-7" />
                            <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-200 text-sm">{listing?.property?.name}</Text>
                        </View>
                        <Image source={images.map} className="h-52 w-full mt-5 rounded-xl" />
                    </View>
                </View>
            </ScrollView>

            {/* ✅ 6. Update the bottom bar to use the dynamic variables */}
            <SafeAreaView className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 px-9 py-5">
                <View className="flex flex-row items-center justify-between gap-10">
                    <View className="flex flex-col items-start">
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-200 text-xs">Price</Text>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} numberOfLines={1} className="text-primary-300 text-start text-2xl">₦{listing?.price?.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={buttonAction}
                        disabled={buttonDisabled}
                        className={`flex-1 flex-row items-center justify-center py-3 rounded-full shadow-md shadow-zinc-400 ${buttonDisabled ? 'bg-gray-400' : 'bg-primary-300'}`}
                    >
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-md text-center">
                            {isApplying ? "Applying..." : buttonText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default PropertyDetail;
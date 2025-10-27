// File: app/(seeker)/properties/[id].jsx
import { useFonts } from "expo-font";
import { ScrollView, View, Dimensions, Image, Platform, TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from '@clerk/clerk-expo';

// Import paths are based on this file being at app/(seeker)/properties/[id].jsx
import { getListingDetails, getAgent, getPersonProfile, submitApplication, checkIfApplicationExists } from "../../../sanity";
import images from "../../../constants/images";
import icons from "../../../constants/icons";
import { facilities } from "../../../constants/data";

console.log("--- app/(seeker)/properties/[id].jsx file loaded ---"); // Path updated

const PropertyDetail = () => {
    console.log("--- PropertyDetail component rendering ---");

    // --- Hooks and Setup ---
    const { id } = useLocalSearchParams();
    const { user } = useUser();
    const windowHeight = Dimensions.get("window").height;

    // --- State Variables ---
    const [listing, setListing] = useState(null);
    const [agent, setAgent] = useState(null);
    const [personProfile, setPersonProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    // Font loading... (assumed paths are correct)
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../../../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Light": require("../../../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Medium": require("../../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../../../assets/fonts/Rubik-SemiBold.ttf"),
    });

    // --- Data Fetching ---
    useEffect(() => {
        const loadPageData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const listingResult = await getListingDetails(id);
                setListing(listingResult);

                if (listingResult?.agent) {
                    const agentResult = await getAgent(listingResult.agent);
                    setAgent(agentResult?.[0]);
                }
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

    // ✅ ** 1. Updated handleApply function alert message **
    const handleApply = async () => {
        // Check if the seeker has created their "Roommate Profile".
        // This is now the standard profile for all applications.
        if (!personProfile) {
            Alert.alert(
                "Create Your Profile First",
                "You need to create your Seeker profile before you can apply.",
                [{ text: "OK", onPress: () => router.push('/profile/edit') }] // Navigate to top-level profile edit
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

    // Back navigation logic (remains the same)
    const handleBackPress = () => {
        const userRole = user?.unsafeMetadata?.role;
        if (userRole === 'lister') {
            router.push('/(lister)/listings');
        } else {
            router.back();
        }
    };

    // --- Render Logic ---
    if (loading || !fontsLoaded) { // Added fontsLoaded check
        return <SafeAreaView className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#0061FF" /></SafeAreaView>;
    }
    
    // ✅ ** 2. Simplified button logic **
    let buttonText = "";
    let buttonAction = () => {};
    let buttonDisabled = false;
    let showButton = true;

    const userRole = user?.unsafeMetadata?.role;

    if (userRole === 'lister') {
        // Listers don't apply to listings. Hide the button.
        showButton = false;
    } else if (userRole === 'seeker') {
        // Seeker logic now applies to ALL listing types ('sharedRoom' OR 'entirePlace')
        if (hasApplied) {
            buttonText = "Applied";
            buttonDisabled = true;
        } else {
            // Check if they have created their base "Roommate Profile"
            buttonText = personProfile ? "Apply with Profile" : "Create Profile to Apply";
            buttonAction = handleApply;
            buttonDisabled = isApplying;
        }
    } else {
        // Unknown role, hide button
        showButton = false;
    }

    const mainImage = listing?.galleryUrls?.[0] || 'https://via.placeholder.com/400';

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32">
                
                {/* --- Top Image and Header --- */}
                <View className="relative w-full" style={{ height: windowHeight / 2 }}>
                    <Image source={{ uri: mainImage }} className="size-full" resizeMode="cover" />
                    <Image source={images.whiteGradient} className="absolute top-0 w-full z-40" />
                    <View className="z-50 absolute inset-x-7" style={{ top: Platform.OS === 'ios' ? 70 : 20 }}>
                        <View className="flex flex-row items-center w-full justify-between">
                            <TouchableOpacity onPress={handleBackPress} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
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
                    {/* ... (All your content: Title, Rating, Bed/Bath, Agent, Overview, etc.) ... */}
                    {/* Title */}
                    <Text style={{ fontFamily: 'Rubik-ExtraBold' }} className='text-2xl'>{listing?.title}</Text>
                    
                    {/* Type and Rating */}
                    <View className="flex-row items-center gap-3">
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
                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10"><Image source={icons.bed} className="size-4" /></View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{listing?.property?.totalBedrooms} Beds</Text>
                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7"><Image source={icons.bath} className="size-4" /></View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{listing?.property?.totalBathrooms} Baths</Text>
                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7"><Image source={icons.location} className="size-4" /></View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{listing?.property?.area}</Text>
                    </View>

                    {/* Agent Section */}
                    {/*agent && ( <View> ... </View> )*/}

                    {/* Overview Section */}
                    <View className="mt-7">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Overview</Text>
                        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-black-200 text-base mt-2">
                            {listing?.description}
                        </Text>
                    </View>

                    {/* Roommate Details Section (remains conditional) */}
                    {/*listing?.listingType === 'sharedRoom' && ( <View> ... </View> )*/}

                    {/* Facilities Section */}
                    <View className="mt-7">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Facilities</Text>
                        {listing?.property?.facilities?.length > 0 && (
                            <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                                {listing.property.facilities.map((facilityName, index) => {
                                    // Find the facility object from your constants/data.js
                                    const facilityDetails = facilities.find((f) => f.title === facilityName);
                                    return (
                                        <View key={index} className="flex flex-1 flex-col items-center min-w-16 max-w-20">
                                            <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                                                {/* Use the found icon, or a default 'info' icon */}
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
                        {/* This displays your placeholder map image */}
                        <Image source={images.map} className="h-52 w-full mt-5 rounded-xl" />
                    </View>
                </View>
            </ScrollView>

            {/* Conditionally render the bottom bar */}
            {showButton && (
                <SafeAreaView className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 px-9 py-5">
                    <View className="flex flex-row items-center justify-between gap-10">
                        <View className="flex flex-col items-start">
                            <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-200 text-xs">Price</Text>
                            <Text style={{ fontFamily: 'Rubik-Bold' }} numberOfLines={1} className="text-primary-300 text-start text-2xl">
                                ₦{listing?.price?.toLocaleString('en-US')}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={buttonAction}
                            disabled={buttonDisabled}
                            className={`flex-1 flex flex-row items-center justify-center py-3 rounded-full shadow-md shadow-zinc-400 ${buttonDisabled ? 'bg-gray-400' : 'bg-primary-300'}`}
                        >
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-md text-center px-2">
                                {isApplying ? "Applying..." : buttonText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}
        </SafeAreaView> // Changed closing View to SafeAreaView
    );
};

export default PropertyDetail;
import { useFonts } from "expo-font"
import { ScrollView, View, Dimensions, Image, Platform, TouchableOpacity, Text, ActivityIndicator } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"

// ✅ 1. Import the new function
import { getListingDetails, getAgent } from "../../sanity"
import images from "../../constants/images"
import icons from "../../constants/icons"
import { facilities } from "../../constants/data"

const PropertyDetail = () => {
    // ... font loading ...
    const { id } = useLocalSearchParams()

    // ✅ 2. Rename state variables for clarity
    const [listing, setListing] = useState(null)
    const [agent, setAgent] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchListingData = async (listingId) => {
        try {
            const result = await getListingDetails(listingId)
            setListing(result)
            // Fetch agent only if an agent is specified on the listing
            if (result?.agent) {
                fetchListingAgent(result.agent)
            }
        } catch (err) {
            console.log("Error fetching listing data:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchListingAgent = async (agentName) => {
        try {
            const result = await getAgent(agentName)
            setAgent(result[0])
        } catch (err) {
            console.log("Error fetching agent:", err)
        }
    }

    useEffect(() => {
        fetchListingData(id)
    }, [id])

    const windowHeight = Dimensions.get("window").height

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#FF8A00" />
            </SafeAreaView>
        )
    }

    // ✅ 3. Use the new "galleryUrls" array for the main image
    const mainImage = listing?.galleryUrls?.[0] || 'https://via.placeholder.com/400';

    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 bg-white">
                <View className="relative w-full" style={{ height: windowHeight / 2 }}>
                    <Image source={{ uri: mainImage }} className="size-full" resizeMode="cover" />
                    {/* ... Gradient and Header Icons ... */}
                </View>

                <View className="px-5 mt-7 flex gap-2">
                    {/* ✅ 4. Update UI to use the new nested data structure */}
                    <Text style={{ fontFamily: 'Rubik-ExtraBold' }} className='text-2xl'>{listing?.title}</Text>

                    <View className="flex flex-row items-center gap-3">
                        <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className='text-xs text-primary-300'>{listing?.property?.type}</Text>
                        </View>
                        {/* Rating is missing, using a fallback for now */}
                        <View className="flex flex-row items-center gap-2">
                            <Image source={icons.star} className="size-5" />
                            <Text style={{ fontFamily: 'Rubik-Medium' }} className='text-black-200 text-sm mt-1'>{listing?.rating || '4.5'} (2 reviews)</Text>
                        </View>
                    </View>

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
                            {/* ... Agent details using 'agent' state ... */}
                        </View>
                    )}

                    {/* Overview Section */}
                    <View className="mt-7">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Overview</Text>
                        <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-black-200 text-base mt-2">
                            {listing?.description}
                        </Text>
                    </View>

                    {/* ✅ 5. NEW: Roommate Details Section (Conditionally Rendered) */}
                    {listing?.listingType === 'sharedRoom' && (
                        <View className="mt-7 border-t border-primary-200 pt-7">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Roommate Details</Text>
                            <View className="mt-4 flex flex-col gap-3">
                                <Text style={{ fontFamily: 'Rubik-Regular' }}><Text style={{ fontFamily: 'Rubik-Bold' }} className="">Room Type:</Text> {listing?.roomType}</Text>
                                <Text style={{ fontFamily: 'Rubik-Regular' }}><Text style={{ fontFamily: 'Rubik-Bold' }} className="">Current Occupants:</Text> {listing?.currentOccupants} people</Text>
                                <Text style={{ fontFamily: 'Rubik-Regular' }}><Text style={{ fontFamily: 'Rubik-Bold' }} className="">Private Bathroom:</Text> {listing?.privateBathroom ? 'Yes' : 'No'}</Text>
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

                        {/* Check if facilities exist before trying to map */}
                        {listing?.property?.facilities?.length > 0 && (
                            <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                                {listing.property.facilities.map((facilityName, index) => {
                                    // Find the full facility object (with icon) from your constants file
                                    const facilityDetails = facilities.find((f) => f.title === facilityName);

                                    return (
                                        <View key={index} className="flex flex-1 flex-col items-center min-w-16 max-w-20">
                                            <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                                                {/* Use the found icon, or a default one if not found */}
                                                <Image 
                                                    source={facilityDetails ? facilityDetails.icon : icons.info} 
                                                    className="size-6" 
                                                />
                                            </View>
                                            <Text 
                                                style={{ fontFamily: 'Rubik-Regular' }} 
                                                numberOfLines={1} 
                                                ellipsizeMode="tail" 
                                                className="text-black-300 text-sm text-center mt-1.5"
                                            >
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

            {/* Bottom Bar for Price and Rent Now Button */}
            <SafeAreaView className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 px-9 py-5">
                <View className="flex flex-row items-center justify-between gap-10">
                    <View className="flex flex-col items-start">
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-200 text-xs">Price</Text>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} numberOfLines={1} className="text-primary-300 text-start text-2xl">₦{listing?.price}</Text>
                    </View>
                    <TouchableOpacity className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-lg text-center">Rent Now</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default PropertyDetail
// File: app/(lister)/listings/edit/[id].jsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { sanityClient, updateListing } from '../../../../sanity'; // Adjust path, add updateListing later
import icons from '../../../../constants/icons'; // Adjust path

const EditListingScreen = () => {
    const { id: listingId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [listingType, setListingType] = useState('entirePlace');
    // Roommate fields
    const [roomType, setRoomType] = useState('');
    const [privateBathroom, setPrivateBathroom] = useState(false);
    const [currentOccupants, setCurrentOccupants] = useState('');
    const [householdVibe, setHouseholdVibe] = useState('');
    const [houseRules, setHouseRules] = useState('');
    // Need property info for display, but not usually editable here
    const [propertyName, setPropertyName] = useState('');

    const [fontsLoaded] = useFonts({ /* ... */ });

    // Fetch existing listing data
    const fetchListingData = useCallback(async () => {
        if (!listingId) return;
        setIsLoading(true);
        try {
            // Fetch listing and include property name for context
            const query = `*[_type == "listing" && _id == $id][0]{ ..., property->{name} }`;
            const params = { id: listingId };
            const listing = await sanityClient.fetch(query, params);

            if (listing) {
                setTitle(listing.title || '');
                setPrice(listing.price?.toString() || '');
                setDescription(listing.description || '');
                setListingType(listing.listingType || 'entirePlace');
                setPropertyName(listing.property?.name || 'N/A'); // Display property name

                // Populate roommate fields if applicable
                if (listing.listingType === 'sharedRoom') {
                    setRoomType(listing.roomType || '');
                    setPrivateBathroom(listing.privateBathroom || false);
                    setCurrentOccupants(listing.currentOccupants?.toString() || '');
                    setHouseholdVibe(listing.householdVibe?.join(', ') || '');
                    setHouseRules(listing.houseRules || '');
                }
            } else {
                Alert.alert("Error", "Listing not found.");
                router.back();
            }
        } catch (err) {
            console.error("Failed to fetch listing data:", err);
            Alert.alert("Error", "Could not load listing data.");
        } finally {
            setIsLoading(false);
        }
    }, [listingId]);

    //useFocusEffect(fetchListingData); // Fetch on focus
    useFocusEffect(
        useCallback(() => {
            // Define the async function inside the callback
            async function loadData() {
                await fetchListingData();
            }
            // Call the async function immediately
            loadData();

            // Optional cleanup function (usually not needed for fetching)
            // return () => {
            //   console.log("Edit screen unfocused");
            // };
        }, [fetchListingData]) // Dependency includes the memoized fetch function
    );

    // Handle saving changes (needs updateListing function in sanity.js)
    const handleSave = async () => {
        if (!title || !price) { /* ... validation ... */ return; }
        setIsSaving(true);
        try {
            const householdVibeArray = householdVibe.split(',').map(s => s.trim()).filter(s => s);
            const listingData = {
                title,
                price: Number(price),
                description,
                // listingType, // Usually not editable after creation? Or allow it?
                // Roommate fields (only include if type is sharedRoom)
                ...(listingType === 'sharedRoom' && {
                    roomType,
                    privateBathroom,
                    currentOccupants: Number(currentOccupants),
                    householdVibe: householdVibeArray,
                    houseRules,
                }),
            };

            // ** We need an updateListing function in sanity.js **
            await updateListing(listingId, listingData);
            console.log("Saving updated listing data (placeholder):", listingData);

            Alert.alert("Success", "Listing updated (Placeholder).");
            router.back(); // Go back to listings list

        } catch (error) {
            console.error("Error updating listing:", error);
            Alert.alert("Error", "Could not update listing.");
        } finally {
            setIsSaving(false);
        }
    };


    if (!fontsLoaded || isLoading) {
         return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerClassName="p-5" keyboardShouldPersistTaps="handled">
                {/* --- Header --- */}
                 <View className="flex-row items-center justify-between mb-6">
                     <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                         <Image source={icons.backArrow} className="w-6 h-6" />
                     </TouchableOpacity>
                     <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl text-black-300 flex-1 text-center">
                         Edit Listing Details
                     </Text>
                     <View className="w-8"/>
                 </View>

                 {/* Display Linked Property (Read-only) */}
                 <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mb-1 text-gray-500">Property:</Text>
                 <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-lg mb-4 p-3 bg-gray-100 rounded-lg text-gray-700">{propertyName}</Text>

                 {/* --- Form Fields --- (Similar to Create Listing form) */}
                 <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mb-2">Listing Title*</Text>
                 <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={title} onChangeText={setTitle} className="bg-gray-100 p-3 rounded-lg" />

                 <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Price (per year)*</Text>
                 <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={price} onChangeText={setPrice} keyboardType="numeric" className="bg-gray-100 p-3 rounded-lg" />

                 <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Description</Text>
                 <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={description} onChangeText={setDescription} multiline className="bg-gray-100 p-3 rounded-lg h-24" textAlignVertical="top"/>

                 {/* Display Listing Type (Read-only or make editable if needed) */}
                 <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Listing Type:</Text>
                 <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-lg mb-4 p-3 bg-gray-100 rounded-lg text-gray-700 capitalize">
                     {listingType === 'sharedRoom' ? 'Shared Room' : 'Entire Place'}
                 </Text>


                 {/* --- Conditional Roommate Fields --- */}
                 {listingType === 'sharedRoom' && (
                     <View className="mt-4 border-t border-gray-200 pt-4">
                         <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-lg mb-4">Room Details</Text>
                         <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mb-2">Room Type</Text>
                        <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={roomType} onChangeText={setRoomType} placeholder="e.g., Private Room" className="bg-gray-100 p-3 rounded-lg" />
                        
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Current Occupants</Text>
                        <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={currentOccupants} onChangeText={setCurrentOccupants} placeholder="e.g., 3" keyboardType="numeric" className="bg-gray-100 p-3 rounded-lg" />

                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Household Vibe</Text>
                        <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={householdVibe} onChangeText={setHouseholdVibe} placeholder="Social, Clean, Quiet" className="bg-gray-100 p-3 rounded-lg" />

                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">House Rules</Text>
                        <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={houseRules} onChangeText={setHouseRules} multiline placeholder="e.g., No smoking indoors." className="bg-gray-100 p-3 rounded-lg h-20" />
                        
                        <View className="flex-row items-center justify-between mt-6">
                            <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base">Does the room have a private bathroom?</Text>
                            <Switch value={privateBathroom} onValueChange={setPrivateBathroom} />
                        </View>
                     </View>
                 )}

                 {/* --- Save Button --- */}
                 <TouchableOpacity onPress={handleSave} disabled={isSaving} className={`py-4 rounded-full mt-8 ${isSaving ? 'bg-gray-400' : 'bg-primary-300'}`}>
                     <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">
                         {isSaving ? 'Saving...' : 'Save Changes'}
                     </Text>
                 </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditListingScreen;
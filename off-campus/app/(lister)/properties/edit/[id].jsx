// File: app/(lister)/properties/edit/[id].jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
import { useFonts } from "expo-font";
import * as ImagePicker from 'expo-image-picker';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Image, Platform, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'; // Added useLocalSearchParams, useFocusEffect
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import icons from '../../../../constants/icons'; // Adjust path (e.g., ../../constants/icons)
// Import updateProperty, uploadSanityImage, and sanityClient for fetching
import { updateProperty, uploadSanityImage, sanityClient } from '../../../../sanity'; // Adjust path (e.g., ../../sanity)
import { nanoid } from 'nanoid/non-secure';

const EditPropertyScreen = () => {
    const router = useRouter();
    const { user } = useUser();
    const { id: propertyId } = useLocalSearchParams(); // Get property ID from route
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Form State (initialize empty)
    const [name, setName] = useState('');
    const [area, setArea] = useState('');
    const [type, setType] = useState('house');
    const [totalBedrooms, setTotalBedrooms] = useState('');
    const [totalBathrooms, setTotalBathrooms] = useState('');
    const [facilities, setFacilities] = useState('');
    const [galleryImages, setGalleryImages] = useState([]); // Holds local URIs for *new* images
    const [existingGallery, setExistingGallery] = useState([]); // Holds existing images { _key, asset: { _id, url } }
    // Track keys of existing images marked for deletion
    const [imagesToDelete, setImagesToDelete] = useState(new Set());

    // Font Loading
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Medium": require("../../../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });

    // Fetch Existing Property Data when screen focuses or propertyId changes
    const fetchPropertyData = useCallback(async () => {
        if (!propertyId) return;
        console.log("Fetching data for property:", propertyId);
        setIsLoadingData(true);
        try {
            const query = `*[_type == "property" && _id == $id][0]{ ..., gallery[]{_key, asset->{_id, url}} }`;
            const params = { id: propertyId };
            const property = await sanityClient.fetch(query, params);

            if (property) {
                console.log("Property data fetched:", property);
                setName(property.name || '');
                setArea(property.area || '');
                setType(property.type || 'house');
                setTotalBedrooms(property.totalBedrooms?.toString() || '');
                setTotalBathrooms(property.totalBathrooms?.toString() || '');
                setFacilities(property.facilities?.join(', ') || '');
                setExistingGallery(property.gallery || []);
                setGalleryImages([]); // Clear any previously selected new images
            } else {
                 Alert.alert("Error", "Property not found.");
                 router.back();
            }
        } catch (err) {
            console.error("Failed to fetch property data:", err);
            Alert.alert("Error", "Could not load property data.");
        } finally {
            setIsLoadingData(false);
        }
    }, [propertyId]); // Dependency array includes propertyId

    useFocusEffect(
        useCallback(() => {
            // Define the async function inside the callback
            async function loadData() {
                await fetchPropertyData();
            }
            // Call the async function immediately
            loadData();

            // Optional cleanup function (usually not needed for fetching)
            // return () => {
            //   console.log("Edit screen unfocused");
            // };
        }, [fetchPropertyData]) // Dependency includes the memoized fetch function
    );

    // Function to handle image selection (same as create.jsx)
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) { /* ... alert ... */ return; }
        try {
            let result = await ImagePicker.launchImageLibraryAsync({ /* ... options ... */ });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImageUris = result.assets.map(asset => asset.uri);
                setGalleryImages(prev => [...new Set([...prev, ...newImageUris])]);
            }
        } catch (error) { /* ... error handling ... */ }
    };

    // Function to mark an existing image for deletion
    const markImageForDeletion = (key) => {
        setImagesToDelete(prev => new Set(prev).add(key));
    };

    // Function to unmark an image (optional, if you want undo)
    const unmarkImageForDeletion = (key) => {
        setImagesToDelete(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
   };

    // Function to handle saving changes
    const handleSave = async () => {
        // ... validation ...
        setIsSaving(true);
        let newGalleryReferences = [];

        // --- Upload NEW Images ---
        if (galleryImages.length > 0) {
           // ... (same upload logic as before) ...
           newGalleryReferences = validNewAssets.map(asset => ({ /* ... */ }));
        }

        // --- Combine Gallery: Filter out deleted images ---
        const finalGallery = [
            // Include existing images ONLY if their key is NOT in imagesToDelete set
            ...existingGallery
                .filter(img => !imagesToDelete.has(img._key))
                .map(img => ({
                    _type: 'image', _key: img._key, asset: { _type: 'reference', _ref: img.asset._id }
                })),
            // Add the newly uploaded image references
            ...newGalleryReferences
        ];
        console.log("Final combined gallery:", finalGallery);


        // --- Update Property Phase ---
        try {
            const facilitiesArray = facilities.split(',').map(f => f.trim()).filter(f => f);
            const propertyData = {
                name, area, type,
                totalBedrooms: Number(totalBedrooms),
                totalBathrooms: Number(totalBathrooms),
                facilities: facilitiesArray,
                gallery: finalGallery, // ✅ Use the filtered & combined gallery
            };

            await updateProperty(propertyId, propertyData);
            Alert.alert("Success!", "Property updated.");
            router.push('/(lister)/properties');

        } catch (error) { /* ... error handling ... */ }
        finally { setIsSaving(false); }
    };


    if (!fontsLoaded || isLoadingData) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" color="#0061FF"/></View>;
    }

    // --- JSX ---
    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView contentContainerClassName="p-5" keyboardShouldPersistTaps="handled">
                {/* --- Header --- */}
                 <View className="flex-row items-center justify-between mb-6">
                     <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                         <Image source={icons.backArrow} className="w-6 h-6" />
                     </TouchableOpacity>
                     <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 flex-1 text-center">
                         Edit Property
                     </Text>
                     <View className="w-8"/>{/* Spacer */}
                 </View>

                {/* --- Form Fields (Populated with state from fetchPropertyData) --- */}
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mb-2">Property Name / Address*</Text>
                <TextInput
                    style={{ fontFamily: 'Rubik-Regular' }}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., 15 Main Road, Green Point"
                    className="bg-gray-100 p-3 rounded-lg"
                 />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Area / Suburb*</Text>
                <TextInput
                    style={{ fontFamily: 'Rubik-Regular' }}
                    value={area}
                    onChangeText={setArea}
                    placeholder="e.g., Sea Point"
                    className="bg-gray-100 p-3 rounded-lg"
                 />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Property Type*</Text>
                <View className="bg-gray-100 rounded-lg border border-gray-200">
                    <Picker
                        selectedValue={type}
                        onValueChange={(itemValue) => setType(itemValue)}
                        style={{ height: 50 }}
                        itemStyle={{ fontFamily: 'Rubik-Regular' }}
                    >
                        <Picker.Item label="House" value="house" />
                        <Picker.Item label="Apartment Block" value="apartment" />
                        <Picker.Item label="Townhouse Complex" value="townhouse" />
                        <Picker.Item label="Other" value="other" />
                    </Picker>
                </View>

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Total Bedrooms*</Text>
                <TextInput
                    style={{ fontFamily: 'Rubik-Regular' }}
                    value={totalBedrooms}
                    onChangeText={setTotalBedrooms}
                    placeholder="e.g., 4"
                    keyboardType="numeric"
                    className="bg-gray-100 p-3 rounded-lg"
                 />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Total Bathrooms*</Text>
                <TextInput
                    style={{ fontFamily: 'Rubik-Regular' }}
                    value={totalBathrooms}
                    onChangeText={setTotalBathrooms}
                    placeholder="e.g., 2"
                    keyboardType="numeric"
                    className="bg-gray-100 p-3 rounded-lg"
                 />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Facilities (comma-separated)</Text>
                <TextInput
                    style={{ fontFamily: 'Rubik-Regular' }}
                    value={facilities}
                    onChangeText={setFacilities}
                    placeholder="e.g., Wifi, Parking, Gym"
                    className="bg-gray-100 p-3 rounded-lg h-20"
                    multiline
                    textAlignVertical="top"
                />

                {/* --- Photo Gallery Section --- */}
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Photo Gallery (Tap existing to mark/unmark for removal)</Text>
                <View className="flex-row flex-wrap mb-4 min-h-[90px]">
                    {/* Display existing images with Delete interaction */}
                    {existingGallery.map((img) => {
                        const isMarkedForDeletion = imagesToDelete.has(img._key);
                        return (
                            <View key={img._key} className="relative mr-2 mb-2">
                                <Pressable onPress={() => isMarkedForDeletion ? unmarkImageForDeletion(img._key) : markImageForDeletion(img._key)}>
                                    <Image
                                        source={{ uri: img.asset.url }}
                                        className={`w-20 h-20 rounded border-2 ${isMarkedForDeletion ? 'border-red-500 opacity-40' : 'border-blue-300 opacity-100'}`}
                                    />
                                    {isMarkedForDeletion && (
                                        <View className="absolute top-1 right-1 bg-red-600 rounded-full w-5 h-5 items-center justify-center shadow-md">
                                            <Text className="text-white font-bold text-xs">X</Text>
                                        </View>
                                    )}
                                </Pressable>
                            </View>
                        );
                    })}
                    {/* Display newly selected images (Green border) */}
                    {galleryImages.map((uri, index) => (
                         <Image key={uri + index} source={{ uri }} className="w-20 h-20 rounded mr-2 mb-2 border-2 border-green-400" />
                    ))}
                    {/* Placeholder */}
                     {(existingGallery.length + galleryImages.length) === 0 && (
                          <View className="w-20 h-20 rounded border border-dashed border-gray-400 items-center justify-center mr-2 mb-2 bg-gray-50">
                             <Image source={icons.imagePlaceholder || icons.upload} className="w-8 h-8" tintColor="#9CA3AF"/>
                         </View>
                     )}
                </View>
                {/* Add/Select Photos Button */}
                <TouchableOpacity
                    onPress={pickImage}
                    disabled={isUploading || isSaving}
                    className={`p-3 rounded-lg items-center justify-center flex-row mb-6 ${isUploading || isSaving ? 'bg-gray-300' : 'bg-gray-200'}`}
                >
                     <Image source={icons.upload} className="w-5 h-5 mr-2" tintColor="#666876"/>
                     <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-gray-600 text-center">
                         Add More Photos
                     </Text>
                </TouchableOpacity>

                {/* --- Update Button --- */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving} // Disable based on overall saving state
                    className={`py-4 rounded-full mt-6 ${isSaving ? 'bg-gray-400' : 'bg-primary-300'}`}
                >
                     {isUploading ? (
                        <View className="flex-row justify-center items-center">
                            <ActivityIndicator color="#FFFFFF" size="small" className="mr-2"/>
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">Uploading...</Text>
                        </View>
                    ) : isSaving ? (
                         <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">Saving Changes...</Text>
                    ) : (
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditPropertyScreen;
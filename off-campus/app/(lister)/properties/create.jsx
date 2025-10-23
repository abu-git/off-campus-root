// File: app/(lister)/properties/create.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useFonts } from "expo-font";
import * as ImagePicker from 'expo-image-picker';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import icons from '../../../constants/icons'; // Adjust path if needed (e.g., ../../constants/icons)
// Ensure uploadSanityImage and createProperty are correctly imported
import { createProperty, uploadSanityImage } from '../../../sanity'; // Adjust path if needed (e.g., ../../sanity)
import { nanoid } from 'nanoid/non-secure'; // A simple ID generator

const CreatePropertyScreen = () => {
    const router = useRouter();
    const { user } = useUser();
    const [isSaving, setIsSaving] = useState(false); // Overall saving state
    const [isUploading, setIsUploading] = useState(false); // Image upload state

    // Form State
    const [name, setName] = useState('');
    const [area, setArea] = useState('');
    const [type, setType] = useState('house');
    const [totalBedrooms, setTotalBedrooms] = useState('');
    const [totalBathrooms, setTotalBathrooms] = useState('');
    const [facilities, setFacilities] = useState('');
    const [galleryImages, setGalleryImages] = useState([]); // Array of local URIs for preview & upload

    // Font Loading
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Medium": require("../../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });

    // Use useFocusEffect to reset form state when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log("CreatePropertyScreen focused. Resetting form fields.");
            // Reset all state variables to their initial values
            setName('');
            setArea('');
            setType('house');
            setTotalBedrooms('');
            setTotalBathrooms('');
            setFacilities('');
            setGalleryImages([]);
            setIsSaving(false);
            setIsUploading(false);

            // Optional: Cleanup function when screen goes out of focus
            // return () => {
            //   console.log("CreatePropertyScreen unfocused.");
            // };
        }, []) // Empty dependency array means the reset logic doesn't depend on props/state
    );

    // Function to handle image selection
    const pickImage = async () => {
        // Request permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "Gallery access is needed to upload photos.");
            return;
        }

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7, // Compress images slightly
                allowsMultipleSelection: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImageUris = result.assets.map(asset => asset.uri);
                setGalleryImages(prevImages => {
                    const combined = [...prevImages, ...newImageUris];
                    return [...new Set(combined)]; // Use Set to get unique URIs
                });
            } else {
                 console.log("Image selection cancelled or no assets found.");
            }
        } catch (error) {
             console.error("Error picking image: ", error);
             Alert.alert("Image Error", "Could not select images.");
        }
    };

    // Function to handle saving the property
    const handleSave = async () => {
        // Validation
        if (!name || !area || !totalBedrooms || !totalBathrooms) {
            Alert.alert("Missing Info", "Please fill in Name, Area, Bedrooms, and Bathrooms.");
            return;
        }

        setIsSaving(true); // Set overall saving state

        let uploadedAssets = [];
        let galleryReferences = [];

        // --- Image Upload Phase ---
        if (galleryImages.length > 0) {
            setIsUploading(true); // Start image upload indicator
            console.log("Starting image uploads...");
            try {
                // Attempt to upload all selected images, catching individual errors
                const uploadPromises = galleryImages.map(uri =>
                    uploadSanityImage(uri).catch(err => {
                        console.error(`Failed to upload image ${uri}:`, err);
                        return null; // Return null for failed uploads
                    })
                );
                uploadedAssets = await Promise.all(uploadPromises);
                console.log("Image uploads attempted.");
            } catch (uploadError) {
                 // Catch any error from Promise.all itself (less likely)
                 console.error("Error during image upload phase:", uploadError);
                 Alert.alert("Upload Error", "Could not upload all images. Please try saving again.");
                 setIsUploading(false);
                 setIsSaving(false);
                 return; // Stop the save process if uploads fail catastrophically
            } finally {
                setIsUploading(false); // Stop image upload indicator
            }

            // Filter out failed uploads and prepare references
            const validAssets = uploadedAssets.filter(asset => asset?._id);
            console.log("Valid assets:", validAssets.length);
            galleryReferences = validAssets.map(asset => ({
                _type: 'image', _key: nanoid(), asset: { _type: 'reference', _ref: asset._id }
            }));
        } else {
            console.log("No images selected for upload.");
        }

        // --- Property Creation Phase ---
        try {
            // Prepare other property data
            const facilitiesArray = facilities.split(',').map(f => f.trim()).filter(f => f);
            const propertyData = {
                name, area, type,
                totalBedrooms: Number(totalBedrooms),
                totalBathrooms: Number(totalBathrooms),
                facilities: facilitiesArray,
                authorClerkId: user.id,
                gallery: galleryReferences, // Use the prepared references (will be empty array if no images)
            };

            // Create the property document in Sanity
            console.log("Creating property document...");
            await createProperty(propertyData);

            Alert.alert("Success!", "Property has been created.");
            router.back(); // Navigate back after successful creation

        } catch (error) { // Catch errors specifically from createProperty
            console.error("Error saving property document:", error);
            Alert.alert("Save Error", `Could not create the property. ${error.message || ''}`);
            // isSaving will be set to false in the finally block
        } finally {
            setIsSaving(false); // Stop overall saving indicator regardless of outcome
        }
    };

    // Loading state for fonts
    if (!fontsLoaded) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" color="#0061FF"/></View>;
    }

    // Main component render
    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView contentContainerClassName="p-5" keyboardShouldPersistTaps="handled">
                {/* --- Header --- */}
                <View className="flex-row items-center justify-between mb-6">
                     <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center mr-4"
                    >
                        <Image source={icons.backArrow} className="size-5" />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 flex-1 text-center">
                        Add New Property
                    </Text>
                     <View className="size-11" />
                </View>

                {/* --- Form Fields --- */}
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mb-2">Property Name / Address*</Text>
                <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={name} onChangeText={setName} placeholder="e.g., 15 Main Road, Green Point" className="bg-gray-100 p-3 rounded-lg" />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Area / Suburb*</Text>
                <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={area} onChangeText={setArea} placeholder="e.g., Sea Point" className="bg-gray-100 p-3 rounded-lg" />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Property Type*</Text>
                <View className="bg-gray-100 rounded-lg border border-gray-200"> 
                    <Picker
                        selectedValue={type}
                        onValueChange={(itemValue) => setType(itemValue)}
                        style={{ height: 50 }} // Adjust height as needed
                        itemStyle={{ fontFamily: 'Rubik-Regular' }} // Apply font to picker items if possible
                    >
                        <Picker.Item label="House" value="house" />
                        <Picker.Item label="Apartment Block" value="apartment" />
                        <Picker.Item label="Townhouse Complex" value="townhouse" />
                        <Picker.Item label="Other" value="other" />
                    </Picker>
                </View>

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Total Bedrooms*</Text>
                <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={totalBedrooms} onChangeText={setTotalBedrooms} placeholder="e.g., 4" keyboardType="numeric" className="bg-gray-100 p-3 rounded-lg" />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Total Bathrooms*</Text>
                <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={totalBathrooms} onChangeText={setTotalBathrooms} placeholder="e.g., 2" keyboardType="numeric" className="bg-gray-100 p-3 rounded-lg" />

                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Facilities (comma-separated)</Text>
                <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={facilities} onChangeText={setFacilities} placeholder="e.g., Wifi, Parking, Gym" className="bg-gray-100 p-3 rounded-lg h-20" multiline textAlignVertical="top"/>

                {/* --- Photo Gallery Section --- */}
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Photo Gallery</Text>
                <View className="flex-row flex-wrap mb-4 min-h-[90px]">
                    {galleryImages.map((uri, index) => (
                         <Image key={uri + index} source={{ uri }} className="w-20 h-20 rounded mr-2 mb-2 border border-gray-200" />
                    ))}
                    {/* Placeholder when no images are selected */}
                    {galleryImages.length === 0 && (
                         <View className="w-20 h-20 rounded border border-dashed border-gray-400 items-center justify-center mr-2 mb-2 bg-gray-50">
                             <Image source={icons.imagePlaceholder || icons.upload} className="w-8 h-8" tintColor="#9CA3AF"/>{/* Use a placeholder icon */}
                         </View>
                    )}
                </View>
                {/* Add/Select Photos Button */}
                <TouchableOpacity
                    onPress={pickImage}
                    disabled={isUploading || isSaving} // Disable while processing
                    className={`p-3 rounded-lg items-center justify-center flex-row mb-6 ${isUploading || isSaving ? 'bg-gray-300' : 'bg-gray-200'}`}
                >
                     <Image source={icons.area} className="w-5 h-5 mr-2" tintColor="#666876"/>
                     <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-gray-600 text-center">
                         {galleryImages.length > 0 ? "Add More Photos" : "Select Photos"}
                     </Text>
                </TouchableOpacity>

                {/* --- Save Button --- */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving} // Only disable based on overall saving state
                    className={`py-4 rounded-full ${isSaving ? 'bg-gray-400' : 'bg-primary-300'}`}
                >
                    {isUploading ? (
                        <View className="flex-row justify-center items-center">
                            <ActivityIndicator color="#FFFFFF" size="small" className="mr-2"/>
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">Uploading Images...</Text>
                        </View>
                    ) : isSaving ? (
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">Saving Property...</Text>
                    ) : (
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">Save Property</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreatePropertyScreen;
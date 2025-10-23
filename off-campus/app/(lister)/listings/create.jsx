import React, { useState, useEffect } from 'react';
import { useFonts } from "expo-font";
import { ScrollView, Text, TextInput, TouchableOpacity, View, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import { createListing, getPropertiesForUser } from '../../../sanity';

const CreateListingScreen = () => {
    // --- Hooks and Setup ---
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-Medium": require("../../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../../assets/fonts/Rubik-Regular.ttf"),
    });
    const router = useRouter();
    const { user } = useUser();
    const [isSaving, setIsSaving] = useState(false);

    // --- Form State ---
    const [userProperties, setUserProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isLoadingProperties, setIsLoadingProperties] = useState(true);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [listingType, setListingType] = useState('entirePlace');
    const [roomType, setRoomType] = useState('Private Room');
    const [privateBathroom, setPrivateBathroom] = useState(false);
    const [currentOccupants, setCurrentOccupants] = useState('');
    const [householdVibe, setHouseholdVibe] = useState('');
    const [houseRules, setHouseRules] = useState('');

    // Fetch user's properties on load
    useEffect(() => {
        const fetchUserProperties = async () => {
            if (user) {
                const properties = await getPropertiesForUser(user.id);
                setUserProperties(properties);
                if (properties.length > 0) {
                    setSelectedProperty(properties[0]._id);
                }
                setIsLoadingProperties(false);
            }
        };
        fetchUserProperties();
    }, [user]);

    const handleSave = async () => {
        if (!selectedProperty || !title || !price) {
            Alert.alert("Missing Info", "Please select a property and fill in the title and price.");
            return;
        }
        setIsSaving(true);
        try {
            const householdVibeArray = householdVibe.split(',').map(item => item.trim()).filter(item => item);
            const listingData = {
                title,
                price: Number(price),
                description,
                listingType,
                propertyId: selectedProperty,
                authorClerkId: user.id,
                agent: user.fullName,
                ...(listingType === 'sharedRoom' && {
                    roomType,
                    privateBathroom,
                    currentOccupants: Number(currentOccupants),
                    householdVibe: householdVibeArray,
                    houseRules,
                }),
            };
            await createListing(listingData);
            Alert.alert("Success!", "Your listing has been created.");
            router.push('/profile/my-listings');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not create your listing.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!fontsLoaded) {
        return <View className='flex-1 justify-center items-center bg-white'><ActivityIndicator size="large" className="text-primary-300" /></View>;
    }

    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView contentContainerClassName="p-5" keyboardShouldPersistTaps="handled">
                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 mb-5">
                    Create a New Listing
                </Text>

                {/* --- Dynamic Property Picker --- */}
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mb-2">Property</Text>
                {isLoadingProperties ? (
                    <ActivityIndicator />
                ) : userProperties.length > 0 ? (
                    <View className="bg-gray-100 rounded-lg">
                        <Picker
                            selectedValue={selectedProperty}
                            onValueChange={(itemValue) => setSelectedProperty(itemValue)}
                        >
                            {userProperties.map((prop) => (
                                <Picker.Item key={prop._id} label={prop.name} value={prop._id} />
                            ))}
                        </Picker>
                    </View>
                ) : (
                    <Text className="text-red-500">You haven't created any properties yet. Please add a property first.</Text>
                )}

                {/* --- Main Fields (styles preserved) --- */}
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Listing Title</Text>
                <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={title} onChangeText={setTitle} placeholder="e.g., Modern 2-Bed City Apartment" className="bg-gray-100 p-3 rounded-lg" />
                
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Price (per year)</Text>
                <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={price} onChangeText={setPrice} placeholder="e.g., 150000" keyboardType="numeric" className="bg-gray-100 p-3 rounded-lg" />
                
                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mt-4 mb-2">Description</Text>
                <TextInput style={{ fontFamily: 'Rubik-Regular' }} value={description} onChangeText={setDescription} multiline placeholder="Describe the place..." className="bg-gray-100 p-3 rounded-lg h-24" />

                {/* --- Listing Type Switch --- */}
                <View className="flex-row items-center justify-between mt-6">
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg">Is this for a Shared Room?</Text>
                    <Switch value={listingType === 'sharedRoom'} onValueChange={(isOn) => setListingType(isOn ? 'sharedRoom' : 'entirePlace')} />
                </View>

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

                <TouchableOpacity onPress={handleSave} disabled={isSaving} className="bg-primary-300 py-4 rounded-full mt-8">
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">
                        {isSaving ? 'Creating...' : 'Create Listing'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateListingScreen;
// File: app/payment/[id].jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import icons from '../../constants/icons'; // Adjust path
// We will create this function in the next step
 import { completeRentalApplication } from '../../sanity'; 

const PaymentScreen = () => {
    const router = useRouter();
    // Get the application ID (id) and listingPrice from the URL parameters
    const { id: applicationId, listingPrice } = useLocalSearchParams();
    const [isSaving, setIsSaving] = useState(false);

    // Dummy state for the form
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"), // Adjust path
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"), // Adjust path
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"), // Adjust path
    });

    // Format the price for display
    const formattedPrice = Number(listingPrice || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'NGN', // Use Naira
        minimumFractionDigits: 0,
    });

    const handlePayment = async () => {
        // Basic form validation
        if (!cardNumber || !expiry || !cvv) {
            Alert.alert("Invalid Input", "Please fill in all card details.");
            return;
        }
        setIsSaving(true);
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // ** We will add this in the next step **
            await completeRentalApplication(applicationId);
            
            Alert.alert(
                "Payment Successful!",
                "Your application is complete. The lister has been notified.",
                [{ text: "OK", onPress: () => router.push('/(seeker)/profile/my-applications') }]
            );
        } catch (error) {
            console.error("Error completing application:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
            setIsSaving(false);
        }
    };

    if (!fontsLoaded) {
        return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerClassName="p-5" keyboardShouldPersistTaps="handled">
                {/* --- Header --- */}
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.push('/(seeker)/profile/my-applications')} className="p-2">
                        <Image source={icons.backArrow} className="w-6 h-6" />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl text-black-300 flex-1 text-center">
                        Complete Your Rental
                    </Text>
                    <View className="w-8"/>{/* Spacer */}
                </View>

                {/* --- Payment Summary --- */}
                <View className="items-center bg-gray-100 p-6 rounded-lg mb-8">
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-lg text-gray-500">Amount to Pay</Text>
                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-4xl text-primary-300 mt-1">
                        {formattedPrice}
                    </Text>
                     <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-sm text-gray-500 mt-1">(One-time payment)</Text>
                </View>

                {/* --- Dummy Card Form --- */}
                <View>
                    <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mb-2">Card Number</Text>
                    <TextInput
                        style={{ fontFamily: 'Rubik-Regular' }}
                        className="bg-gray-100 p-4 rounded-lg text-lg"
                        placeholder="0000 0000 0000 0000"
                        keyboardType="numeric"
                        maxLength={16}
                        onChangeText={setCardNumber}
                        value={cardNumber}
                    />

                    <View className="flex-row justify-between mt-4">
                        <View className="flex-1 mr-2">
                            <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mb-2">Expiry Date</Text>
                            <TextInput
                                style={{ fontFamily: 'Rubik-Regular' }}
                                className="bg-gray-100 p-4 rounded-lg text-lg"
                                placeholder="MM/YY"
                                keyboardType="numeric"
                                maxLength={5}
                                onChangeText={setExpiry}
                                value={expiry}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base text-black-200 mb-2">CVV</Text>
                            <TextInput
                                style={{ fontFamily: 'Rubik-Regular' }}
                                className="bg-gray-100 p-4 rounded-lg text-lg"
                                placeholder="123"
                                keyboardType="numeric"
                                maxLength={3}
                                onChangeText={setCvv}
                                value={cvv}
                                secureTextEntry
                            />
                        </View>
                    </View>
                </View>

                {/* --- Pay Now Button --- */}
                <TouchableOpacity
                    onPress={handlePayment}
                    disabled={isSaving}
                    className={`py-4 rounded-full mt-10 ${isSaving ? 'bg-gray-400' : 'bg-primary-300'}`}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-center text-lg">
                            Pay {formattedPrice}
                        </Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

export default PaymentScreen;
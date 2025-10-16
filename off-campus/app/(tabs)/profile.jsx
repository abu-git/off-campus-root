import { useClerk, useUser } from '@clerk/clerk-expo'
import { useFonts } from "expo-font"
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context"
import { settings } from '../../constants/data'
import icons from "../../constants/icons"


const SettingsItem = ({ icon, title, onPress, textStyle, showArrow = true }) => (
    <TouchableOpacity onPress={onPress} className="flex flex-row items-center justify-between py-3">
        <View className="flex flex-row items-center gap-3">
            <Image source={icon} className="size-6" />
            <Text style={{ fontFamily: 'Rubik-Medium' }} className={`text-lg text-black-300 ${textStyle}`}>{title}</Text>
        </View>

        {showArrow && <Image source={icons.rightArrow} className="size-5" />}
    </TouchableOpacity>
)


const Profile = () => {

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Light": require("../../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
    })
      
    

    const router = useRouter()
    const { user, isSignedIn } = useUser()
    const { signOut } = useClerk()

    

    useEffect(() => {
        if(isSignedIn === false){
            router.replace('/(auth)/sign-in')
        }
    }, [router])

    const onLogout = async () => {
        try{
            await signOut()
            // Redirect to your desired page
            router.replace('/(auth)/sign-in') // expo router is used instead of Linking below
            //Linking.openURL(Linking.createURL('/(auth)/sign-in'))
            
        }catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
            Alert.alert('Logout', JSON.stringify(err, null, 2))
        }
    }

    const handleLogout = async () => {
        // show confirm modal
        Alert.alert('Confirm', 'Are you sure you want to logout?', [
            {
                text: 'Cancel',
                onPress: () => console.log('signout modal cancel'),
                style: 'cancel'
            },
            {
                text: 'Logout',
                onPress: () => {onLogout()},
                style: 'destructive'
            }
        ])
    }

    if (!fontsLoaded) {
        return null;
    }

    if(!isSignedIn){
        return(
            <SafeAreaView className="bg-white h-full flex justify-center items-center">
                <ActivityIndicator className="text-primary-300" size="large" />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className='h-full bg-white'>
            <ScrollView showsVerticalScrollIndicator={true} contentContainerClassName="pb-32 px-7">
                <View className="flex flex-row items-center justify-between mt-5">
                    <Text style={{ fontFamily: 'Rubik-Bold', fontSize: 20 }} className="text-xl">Profile</Text>
                    <Image source={icons.bell} className="size-5" />
                </View>

                <View className="flex flex-row justify-center mt-5">
                    <View className="flex flex-col items-center relative mt-5">
                        <Image
                            source={{ uri: user?.imageUrl }}
                            className="size-44 relative rounded-full"
                        />

                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-2xl font-rubik-bold mt-2">{user?.fullName}</Text>
                    </View>
                </View>

                <View className="flex flex-col mt-10">
                    <SettingsItem icon={icons.calendar} title="My Bookings" />
                    <SettingsItem icon={icons.wallet} title="Payments" />
                </View>

                <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
                    {settings.slice(2).map((item, index) => (
                        <SettingsItem key={index} {...item} />
                    ))}
                </View>

                <View className="flex flex-col border-t mt-5 pt-5 border-primary-200">
                    <SettingsItem
                        icon={icons.logout}
                        title="Logout"
                        textStyle="text-danger"
                        showArrow={false}
                        onPress={handleLogout}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Profile
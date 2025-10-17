import { useSSO, useAuth } from "@clerk/clerk-expo"
import * as AuthSession from 'expo-auth-session'
import { useFonts } from "expo-font"
import * as WebBrowser from 'expo-web-browser'
import React, { useCallback, useEffect } from 'react'
import { Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect } from "expo-router"
import icons from "../../constants/icons"
import images from '../../constants/images'

// Preloads the browser for Android devices to reduce authentication load time
// See: https://docs.expo.dev/guides/authentication/#improving-user-experience
export const useWarmUpBrowser = () => {
    useEffect(() => {
        if (Platform.OS !== 'android') return
        void WebBrowser.warmUpAsync()
        return () => {
            // Cleanup: closes browser when component unmounts
            void WebBrowser.coolDownAsync()
        }
    }, [])
}
  
// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

const SignIn = () => {

    

    useWarmUpBrowser()

    // Use the `useSSO()` hook to access the `startSSOFlow()` method
    const { startSSOFlow } = useSSO()

    const onPress = useCallback(async () => {
        try {
            console.log('sign in btn press')
            // Start the authentication process by calling `startSSOFlow()`
            const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
                strategy: 'oauth_google',
                // For web, defaults to current path
                // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
                // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
                //redirectUrl: AuthSession.makeRedirectUri({ scheme: 'offcampus', path: '/'}),
                redirectUrl: AuthSession.makeRedirectUri(),
            })
    
            // If sign in was successful, set the active session
            if (createdSessionId) {
                setActive({ session: createdSessionId })
            } else {
                // If there is no `createdSessionId`,
                // there are missing requirements, such as MFA
                // Use the `signIn` or `signUp` returned from `startSSOFlow`
                // to handle next steps
            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.log(err)
            console.error(JSON.stringify(err, null, 2))
            Alert.alert('Google Sign In', JSON.stringify(err, null, 2))
        }
      }, [])

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Light": require("../../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
    });
      
    const { isSignedIn } = useAuth()

    if (!fontsLoaded) {
        return null;
    }

    if (isSignedIn) {
        return <Redirect href={'/(tabs)/'} />
    }
    
    return (
        <SafeAreaView className='bg-white h-full'>
            <ScrollView contentContainerStyle={{ height: '100%' }}>
                {/* Sign In landing image */}
                <Image source={images.onboarding} className='w-full h-4/6' contentFit='contain'/>

                <View className="px-10">
                    <Text className="text-center text-black-200" style={{ fontFamily: 'Rubik-Regular', fontSize: 17, textTransform: 'uppercase' }}>
                        Welcome To Off Campus
                    </Text>

                    <Text style={{ fontFamily: 'Rubik-Bold', fontSize: 24 }} className="text-3xl text-black-300 text-center mt-2">
                        Let's Get You Closer To {"\n"}
                        <Text className="text-primary-300">Your Ideal Residence</Text>
                    </Text>

                    <Text style={{ fontFamily: '', fontSize: 15}} className="text-lg text-black-200 text-center mt-12">
                        Login to Off Campus with Google
                    </Text>

                    <TouchableOpacity
                        onPress={onPress}
                        className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5"
                    >
                        <View className="flex flex-row items-center justify-center">
                            <Image
                                source={icons.google}
                                className="w-5 h-5"
                                resizeMode="contain"
                            />
                            <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                                Continue with Google
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn
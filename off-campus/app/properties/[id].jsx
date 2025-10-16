import { useFonts } from "expo-font"
import { ScrollView, View, Dimensions, Image, Platform, TouchableOpacity, Text } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react";
import { getProperty, getAgent } from "../../sanity";
import images from "../../constants/images";
import icons from "../../constants/icons";
import { facilities } from "../../constants/data";
import { SafeAreaView } from "react-native-safe-area-context";



const Property = () => {
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Light": require("../../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
    });
      
    if (!fontsLoaded) {
        return null;
    }

    const { id } = useLocalSearchParams()

    const [property, setProperty] = useState(null)
    const [propertyAgent, setPropertyAgent] = useState(null)

    const fetchProperty = async (id) => {
        try{
            const result = await getProperty(id)
            setProperty(result[0])
            fetchPropertyAgent(result[0].agent)
        }catch(err){
            console.log(err)
        }
    }

    const fetchPropertyAgent = async (agentName) => {
        try{
            const result = await getAgent(agentName)
            setPropertyAgent(result[0])
        }catch(err){
            console.log(err)
        }
    }

    useEffect(() => {
        fetchProperty(id)
        //console.log(property)
    }, [])

    const windowHeight = Dimensions.get("window").height

    return(
        <View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 bg-white">
                <View className="relative w-full" style={{ height: windowHeight / 2 }}>
                    <Image source={{ uri: property?.image }} className="size-full" resizeMode="cover" />
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

                <View className="px-5 mt-7 flex gap-2">
                    <Text style={{ fontFamily: 'Rubik-ExtraBold' }} className='text-2xl'>{property?.name}</Text>

                    <View className="flex flex-row items-center gap-3">
                        <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className='text-xs text-primary-300'>{property?.type}</Text>
                        </View>

                        <View className="flex flex-row items-center gap-2">
                            <Image source={icons.star} className="size-5" />
                            <Text style={{ fontFamily: 'Rubik-Medium' }} className='text-black-200 text-sm mt-1'>{property?.rating} (2 reviews)</Text>
                        </View>
                    </View>

                    <View className="flex flex-row items-center mt-5">
                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
                            <Image source={icons.bed} className="size-4" />
                        </View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{property?.bedroom} Beds</Text>

                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
                            <Image source={icons.bath} className="size-4" />
                        </View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{property?.bathroom} Baths</Text>

                        <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
                            <Image source={icons.area} className="size-4" />
                        </View>
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-300 text-sm ml-2">{property?.area} sqft</Text>
                    </View>

                    <View className="w-full border-t border-primary-200 pt-7 mt-5">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Agent</Text>
                        <View className="flex flex-row items-center justify-between mt-4">
                            <Image source={{ uri: propertyAgent?.image }} className="size-14 rounded-full" />

                            <View className="flex flex-col items-start justify-center ml-3">
                                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-lg text-black-300 text-start">{propertyAgent?.name}</Text>
                                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-sm text-black-200 text-start">{property?.isOwner ? 'Owner' : 'Agent' }</Text>
                            </View>
                            <View className="flex flex-row items-center gap-3">
                                <Image source={icons.chat} className="size-7" />
                                <Image source={icons.phone} className="size-7" />
                            </View>
                        </View>

                        <View className="mt-7">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">
                                Overview
                            </Text>
                            <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-black-200 text-base font-rubik mt-2">
                                {property?.description}
                            </Text>
                        </View>

                        <View className="mt-7">
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Facilities</Text>

                            {property?.facilities.length > 0 && (
                                <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                                    {property?.facilities.map((item, index) => {
                                        const facility = facilities.find((facility) => facility.title === item)
                                        return(
                                            <View key={index} className="flex flex-1 flex-col items-center min-w-16 max-w-20">
                                                <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <Image source={facility ? facility.icon : icons.info} className="size-6" />
                                                </View>

                                                <Text style={{ fontFamily: 'Rubik-Regular' }} numberOfLines={1} ellipsizeMode="tail" className="text-black-300 text-sm text-center mt-1.5">{item}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            )}
                        </View>

                        <View className='mt-7'>
                            <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-black-300 text-xl">Location</Text>
                            <View className="flex flex-row items-center justify-start mt-4 gap-2">
                                <Image source={icons.location} className="w-7 h-7" />
                                <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-200 text-sm">{property?.address}</Text>
                            </View>

                            <Image source={images.map} className="h-52 w-full mt-5 rounded-xl" />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <SafeAreaView className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 px-9 py-5">
                <View className="flex flex-row items-center justify-between gap-10">
                    <View className="flex flex-col items-start">
                        <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-black-200 text-xs">Price</Text>
                        <Text style={{ fontFamily: 'Rubik-Bold' }} numberOfLines={1} className="text-primary-300 text-start text-2xl">&#8358;{property?.price}</Text>
                    </View>

                    <TouchableOpacity className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-white text-lg text-center">Rent Now</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default Property
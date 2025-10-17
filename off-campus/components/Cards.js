import { useFonts } from "expo-font"
import { Image, Text, TouchableOpacity, View } from "react-native"
import icons from "../constants/icons"
import images from "../constants/images"

// =========================================================
// UPDATED FeaturedCard
// =========================================================
export const FeaturedCard = ({ item, onPress }) => { // 1. Changed prop destructuring to get the whole 'item'
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    })
    
    if (!fontsLoaded) {
        return null
    }

    return(
        <TouchableOpacity onPress={onPress} className="flex flex-col items-start w-60 h-80 relative">
            {/* 2. Use the new 'imageUrl' field from our updated query */}
            <Image source={{ uri: item.imageUrl }} className="size-full rounded-2xl" />
            <Image source={images.cardGradient} className="size-full rounded-2xl absolute bottom-0"/>

            <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
                <Image source={icons.star} className="size-3.5" />
                {/* 3. The 'rating' field is missing in the new schema. Add it back to 'listing.js' later. */}
                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xs font-rubik-bold text-primary-300 ml-1">{item.rating || '4.5'}</Text>
            </View>

            <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
                {/* 4. Use 'item.title' instead of 'item.name' */}
                <Text style={{ fontFamily: 'Rubik-ExtraBold' }} className="text-xl text-white" numberOfLines={1}>{item.title}</Text>
                
                {/* 5. Access the address from the nested property object */}
                <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-base text-white" numberOfLines={1}>{item.property?.address}</Text>

                <View className="flex flex-row items-center justify-between w-full">
                    {/* 6. 'price' is still top-level */}
                    <Text style={{ fontFamily: 'Rubik-ExtraBold', fontSize: 21 }} className="text-xl text-white">&#8358;{item.price.toLocaleString()}</Text>
                    <Image source={icons.heart} className="size-5" />
                </View>
            </View>
        </TouchableOpacity>
    )
}

// =========================================================
// UPDATED Card
// =========================================================
export const Card = ({ item, onPress }) => { // 1. Changed prop destructuring
    return(
        <TouchableOpacity onPress={onPress} className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative">
            <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50">
                <Image source={icons.star} className="size-2.5" />
                {/* 2. Using fallback for missing 'rating' field */}
                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xs font-rubik-bold text-primary-300 ml-0.5">{item.rating || '4.5'}</Text>
            </View>

            {/* 3. Use the new 'imageUrl' field */}
            <Image source={{ uri: item.imageUrl }} className="w-full h-40 rounded-lg" />

            <View className="flex flex-col mt-2">
                {/* 4. Use 'item.title' */}
                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-base text-black-300">{item.title}</Text>
                
                {/* 5. Use nested 'item.property.address' */}
                <Text style={{ fontFamily: 'Rubik-Regular' }} className="text-xs text-black-200" numberOfLines={1}>{item.property?.address}</Text>

                <View className="flex flex-row items-center justify-between mt-2">
                    {/* 6. 'price' is still top-level */}
                    <Text style={{ fontFamily: 'Rubik-Bold', fontSize: 15 }} className="text-base text-primary-300">&#8358;{item.price.toLocaleString()}</Text>
                    <Image source={icons.heart} className="w-5 h-5 mr-2" tintColor='#191d31' />
                </View>
            </View>
        </TouchableOpacity>
    )
}
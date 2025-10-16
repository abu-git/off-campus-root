import { useFonts } from "expo-font"
import { Image, TextInput, TouchableOpacity, View } from "react-native"
import icons from "../constants/icons"



const Search = ({ value, onChangeText, onSearch }) => {
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
        <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2">
            <View className="flex-1 flex flex-row items-center justify-start z-50">
                {/*<Image source={icons.search} className="size-5" />*/}
                <TextInput
                    placeholder="Search for anything"
                    placeholderTextColor="#7b7b8b"
                    className="text-sm font-rubik text-black-300 ml-2 flex-1"
                    style={{ fontFamily: 'Rubik-Regular' }}
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>

            <TouchableOpacity onPress={onSearch}>
                <Image source={icons.search} className="size-5" />
            </TouchableOpacity>
        </View>
    )
}

export default Search
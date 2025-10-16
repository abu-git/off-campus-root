import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { useFonts } from "expo-font"
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getExploreProperties, searchProperties } from '../../sanity'
import { Card } from '../../components/Cards'
import icons from '../../constants/icons'
import Search from '../../components/Search2'
import Filters from '../../components/Filters'

const Explore = () => {
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

  const [properties, setProperties] = useState([])

  // 👇 Search properties state variables
  const [initialProperties, setInitialProperties] = useState([]) // To store the original list
  const [isSearching, setIsSearching] = useState(false) // For the loading spinner
  const [searchQuery, setSearchQuery] = useState('') // To update the UI text

  const fetchExploreProperties = async () => {
    try{
      const result = await getExploreProperties()
      setProperties(result)
      setInitialProperties(result) // 👈 Set the initial backup list here
    }catch(err){
      console.log(err)
    }
  }

  // 👇 Add the entire handleSearch function
  const handleSearch = async (query) => {
    setSearchQuery(query);
  
    // 👇 CORRECTED LINE: Check if query is falsy first.
    // If the search is empty, undefined, or null, restore the original list.
    if (!query) {
      setProperties(initialProperties);
      // You were missing a finally block here, so the spinner might get stuck
      setIsSearching(false); 
      return;
    }
  
    setIsSearching(true);
    try {
      const results = await searchProperties(query);
      setProperties(results);
    } catch (error) {
      console.log("Failed to fetch search results:", error);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    fetchExploreProperties()
  }, [])

  const handleCardPress = (id) => router.push(`/properties/${id}`)

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={properties}
        renderItem={({item}) => <Card item={item} onPress={() => handleCardPress(item._id)} />}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <TouchableOpacity onPress={() => router.back()} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
                <Image source={icons.backArrow} className="size-5" />
              </TouchableOpacity>
              <Text style={{ fontFamily: 'Rubik-Medium' }} className="text-base mr-2 text-center text-black-300">
                Find Your Ideal Residence
              </Text>
              <Image source={icons.bell} className="w-6 h-6" />
            </View>

            <Search onSearch={handleSearch} />

            <Filters />

            <View className="mt-4">
              <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl mt-5">{searchQuery ? `Found ${properties?.length} results` : `Found ${properties?.length} Properties`}</Text>
              {isSearching && <ActivityIndicator size="small" className="text-primary-300 mt-5" />}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default Explore
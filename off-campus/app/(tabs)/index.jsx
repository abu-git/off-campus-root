import { useUser, useAuth } from '@clerk/clerk-expo'
import { useFonts } from "expo-font"
import React, { useState, useEffect } from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card, FeaturedCard } from '../../components/Cards'
import Search from '../../components/Search2'
import { cards, featuredCards } from '../../constants/data'
import icons from '../../constants/icons'
import Filters from '../../components/Filters'

import { getFeaturedProperties, getHomeProperties, searchProperties } from '../../sanity'
import { router, Redirect } from 'expo-router'
import { useDebounce } from '../../hooks/useDebounce'

const Index = () => {
    const { isSignedIn } = useAuth()

    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Light": require("../../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
    })

    const { user } = useUser()

    const [featured, setFeatured] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] =  useState(false)
    const [isSearching, setIsSearching] = useState(false)

    // 👇 Add state for the search query
    const [searchQuery, setSearchQuery] = useState('')

    // 👇 Create a debounced version of the search query
    //const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const [initialRecommendations, setInitialRecommendations] = useState([])

    // 👇 Create a handler function for the search
    const handleSearch = async (query) => {
        setSearchQuery(query); // Set the query so the title can update

        if (!query.trim()) {
            setRecommendations(initialRecommendations)
            return;
        }

        setIsSearching(true)
        try {
            const results = await searchProperties(query)
            setRecommendations(results)
            setIsSearching(false)
        } catch (error) {
            console.log("Failed to fetch search results:", error)
        } finally {
            setIsSearching(false)
        }
    };

    const fetchFeaturedProperties = async () => {
        try{
            const results = await getFeaturedProperties()
            setFeatured(results)
        }catch(error){
            console.log(error)
        }
    }

    const fetchHomeProperties = async () => {
        try{
            const results = await getHomeProperties()
            setRecommendations(results)
            setInitialRecommendations(results)
        }catch(err){
            console.log(err)
        }
    }

    const handleCardPress = (id) => router.push(`/properties/${id}`)

    const loadInitial = async () => {
        setLoading(true)
        await fetchFeaturedProperties()
        await fetchHomeProperties()
        setTimeout(() => {
            setLoading(false)
        }, 3000)
    }

    // Use useEffect to trigger the search when the *debounced* query changes
    /*useEffect(() => {
        handleSearch(debouncedSearchQuery);
    }, [debouncedSearchQuery])*/

    useEffect(() => {
        loadInitial()
    }, [])

    if (isSignedIn === false) {
        return <Redirect href={'/(auth)/sign-in'} />
    }

    if (!fontsLoaded) {
        return null;
    }

    if(loading === true){
        return(
            <View className='flex-1 flex-row justify-center items-center bg-white'>
                <ActivityIndicator size="large" className="text-primary-300" />
            </View>
        )
    }

    if(loading === false){
        return (
            <SafeAreaView className="bg-white h-full">
                <FlatList
                    data={recommendations}
                    renderItem={({item}) => <Card item={item} onPress={() => handleCardPress(item._id)} />}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerClassName="pb-32"
                    columnWrapperClassName="flex gap-5 px-5"
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View className="px-5">
                            <View className="flex flex-row items-center justify-between mt-5">
                                <View className="flex flex-row">
                                    <Image source={{ uri: user?.imageUrl }} className="size-12 rounded-full" />
                                    <View className="flex flex-col items-start ml-2 justify-center">
                                        <Text style={{ fontFamily: 'Rubik-Regular', fontSize: 11 }} className="text-xs text-black-100">Hello</Text>
                                        <Text style={{ fontFamily: 'Rubik-Medium', fontSize: 15 }} className="text-base font-rubik-medium text-black-300">{user?.fullName}</Text>
                                    </View>
                                </View>
                                <Image source={icons.bell} className="size-6" />
                            </View>

                            <Search onSearch={handleSearch} />

                            <View className="my-5">
                                <View className="flex flex-row items-center justify-between">
                                    <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl text-black-300">Featured</Text>
                                    <TouchableOpacity onPress={() => router.push('/explore')}>
                                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-base text-primary-300">See all</Text>
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={featured}
                                    renderItem={({item}) => (<FeaturedCard item={item} onPress={() => handleCardPress(item._id)} />)}
                                    keyExtractor={(item) => item._id}
                                    horizontal
                                    bounces={false}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerClassName="flex gap-5 mt-5"
                                />
                            </View>

                            <View className="flex flex-row items-center justify-between pb-3">
                                <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-xl text-black-300">{searchQuery ? 'Search Results' : 'Our Recommendations'}</Text>
                                {/* Conditionally show the small spinner ONLY when searching */}
                                {isSearching ? (
                                    <ActivityIndicator size="small" className="text-primary-300" />
                                ) : (
                                    <TouchableOpacity onPress={() => router.push('/explore')}>
                                        <Text style={{ fontFamily: 'Rubik-Bold' }} className="text-base text-primary-300">
                                            See all
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                
                            </View>

                            <Filters />
                        </View>
                    )}
                />
            </SafeAreaView>
        )
    }

    
}

export default Index
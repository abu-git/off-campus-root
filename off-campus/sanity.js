// sanity.js
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
    projectId: 'v8h2zu7p',
    dataset: 'production',
    useCdn: false, // set to `false` to bypass the edge cache
    apiVersion: '2025-10-08', // use current date (YYYY-MM-DD) to target the latest API version. Note: this should always be hard coded. Setting API version based on a dynamic value (e.g. new Date()) may break your application at a random point in the future.
    token: 'skTHKHDV3vxwL4lVprGATDGPpbK8fXl7jMgETufyI0Y8Uujpk5aVaH61SLB23TgmdWQfm0sN7hAZ8nzba8NIHD8kgmj6QJUr29Lb4ETAsvRcm8IlG15mERXkxDUHC6Ixa63ZDvzicKQGRBycSzAPk52I2PYqPOKJIc6TG1CFWdHDQvxKpSXE' // Needed for certain operations like updating content, accessing drafts or using draft perspectives
})


// Get Featured Posts
export async function getFeaturedProperties(){
    try{
        const data = await sanityClient.fetch(`*[_type == "property"]| order(_createdAt desc) [0...3]`)
        //console.log(data)
        return data
    }catch(error){
        console.log(error)
    }
}

// Get Recommendataions (Home)
export async function getHomeProperties() {
    try{
        const data = await sanityClient.fetch(`*[_type == "property"]| order(_createdAt desc) [0...6]`)
        //console.log(data)
        return data
    }catch(error){
        console.log(error)
    }
}

// Get Properties (Explore)
export async function getExploreProperties() {
    try{
        const data = await sanityClient.fetch(`*[_type == "property"]| order(_createdAt desc)`)
        //console.log(data)
        return data
    }catch(error){
        console.log(error)
    }
}


// Get Property Details
export async function getProperty(id){
    try{
        const data = await sanityClient.fetch(`*[_type == "property" && _id == $id]`, {id})
        //console.log(data)
        return data
    }catch(err){
        console.log(err)
    }
}

// Get Property Agent
export async function getAgent(agent){
    try{
        const data = await sanityClient.fetch(`*[_type == "agent" && name == $agent]`, {agent})
        //console.log(data)
        return data
    }catch(err){
        console.log(err)
    }
}

// Search Properties
export async function searchProperties(query) {
    // Return an empty array if the query is empty to avoid unnecessary API calls
    if (!query) return []; 
    console.log('query: ', query)
    try {
        const data = await sanityClient.fetch(
            `*[_type == "property" && (name match $query || description match $query || address match $query || type match $query)]`, 
            { query: `*${query}*` } // Use wildcards for partial, case-insensitive matching
        );
        //console.log(data)
        return data;
    } catch (error) {
        console.log("Error searching properties:", error);
        return []; // Return an empty array on error
    }
}


// =================================================================
// NEW LISTING FUNCTIONS 🏡
// =================================================================

// Get Featured Listings (for the Home screen horizontal list)
export async function getFeaturedListings() {
    try {
        // We now fetch 'listing' type and use the '->' to pull in all data from the referenced 'property'
        const data = await sanityClient.fetch(`*[_type == "listing"]{
            ..., 
            "imageUrl": property->gallery[0].asset->url,
            property-> 
        } | order(_createdAt desc) [0...3]`)
        return data
    } catch (error) {
        console.log("Error fetching featured listings:", error)
    }
}

// Get Home Listings (for the Home screen recommendation list)
export async function getHomeListings() {
    try {
        const data = await sanityClient.fetch(`*[_type == "listing"]{
            ...,
            "imageUrl": property->gallery[0].asset->url,
            property->
        } | order(_createdAt desc) [0...6]`)
        return data
    } catch (error) {
        console.log("Error fetching home listings:", error)
    }
}

// Get All Listings (for the Explore screen)
export async function getExploreListings() {
    try {
        const data = await sanityClient.fetch(`*[_type == "listing"]{
            ...,
            "imageUrl": property->gallery[0].asset->url,
            property->
        } | order(_createdAt desc)`)
        return data
    } catch (error) {
        console.log("Error fetching explore listings:", error)
    }
}

// Get a Single Listing's Details (for the [id].jsx screen)
export async function getListingDetails(id) {
    try {
        const data = await sanityClient.fetch(`*[_type == "listing" && _id == $id]{
            ...,
            "galleryUrls": property->gallery[].asset->url, 
            property->
        }`, { id })
        // Return the first (and only) result
        return data?.[0]; 
    } catch (err) {
        console.log("Error fetching listing details:", err)
    }
}

// NEW: Search Listings (replaces searchProperties)
export async function searchListings(query) {
    if (!query) return [];
    try {
        const data = await sanityClient.fetch(
            `*[_type == "listing" && (
                title match $query || 
                description match $query || 
                property->name match $query || 
                property->area match $query
            )]{
                ...,
                "imageUrl": property->gallery[0].asset->url,
                property->
            }`,
            { query: `*${query}*` }
        );
        return data;
    } catch (error) {
        console.log("Error searching listings:", error);
        return [];
    }
}


// =================================================================
// NEW PERSON PROFILE FUNCTIONS 👤
// =================================================================

// Get a user's roommate profile using their Clerk ID
export async function getPersonProfile(clerkId) {
    try {
        const data = await sanityClient.fetch(`*[_type == "personProfile" && clerkId == $clerkId]`, { clerkId });
        // Return the first profile found, or null if none exists
        return data?.[0] || null;
    } catch (error) {
        console.log("Error fetching person profile:", error);
    }
}

// Create or update a user's roommate profile
export async function createOrUpdatePersonProfile(profileData) {
    try {
        // Use the createOrReplace method to either create a new document or update an existing one
        // The '_id' is based on the Clerk ID to prevent duplicates for the same user
        const result = await sanityClient.createOrReplace({
            _id: `profile_${profileData.clerkId}`,
            _type: 'personProfile',
            ...profileData
        });
        return result;
    } catch (error) {
        console.log("Error creating/updating person profile:", error);
    }
}


// =================================================================
// OLD PROPERTY FUNCTIONS (for reference, will be removed later)
// =================================================================

/*
// Get Featured Posts
export async function getFeaturedProperties(){ ... }

// Get Recommendataions (Home)
export async function getHomeProperties() { ... }

// Get Properties (Explore)
export async function getExploreProperties() { ... }

// Get Property Details
export async function getProperty(id){ ... }

// Search Properties
export async function searchProperties(query) { ... }
*/

// =================================================================
// AGENT FUNCTION (can remain as is for now)
// =================================================================

/*/ Get Property Agent
export async function getAgent(agent) {
    try {
        const data = await sanityClient.fetch(`*[_type == "agent" && name == $agent]`, { agent })
        return data
    } catch (err) {
        console.log(err)
    }
}*/
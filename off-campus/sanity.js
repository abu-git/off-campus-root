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
// NEW APPLICATION FUNCTIONS 🤝
// =================================================================

// Submit a new application for a listing
export async function submitApplication(listingId, seekerProfileId, message = '') {
    try {
        const result = await sanityClient.create({
            _type: 'application',
            listing: {
                _type: 'reference',
                _ref: listingId,
            },
            seeker: {
                _type: 'reference',
                _ref: seekerProfileId,
            },
            status: 'pending', // Applications always start as pending
            message: message,
        });
        console.log('Application submitted:', result._id);
        return result;
    } catch (error) {
        console.error("Error submitting application:", error);
        // It's good practice to re-throw the error so the UI can handle it
        throw new Error('Failed to submit application.');
    }
}

// Get all applications for a specific listing
export async function getApplicationsForListing(listingId) {
    try {
        const data = await sanityClient.fetch(`
            *[_type == "application" && listing._ref == $listingId]{
                ...,
                // Expand the seeker reference to get their full profile details
                seeker->
            } | order(_createdAt desc)
        `, { listingId });
        return data;
    } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
    }
}

// Update the status of an application (e.g., to 'viewed', 'accepted', etc.)
export async function updateApplicationStatus(applicationId, newStatus) {
    try {
        const result = await sanityClient
            .patch(applicationId) // Use the document ID to patch
            .set({ status: newStatus }) // Set the new status
            .commit(); // Commit the change
        return result;
    } catch (error) {
        console.error("Error updating application status:", error);
        throw new Error('Failed to update status.');
    }
}

// Get all applications submitted by a specific seeker
export async function getApplicationsForSeeker(seekerProfileId) {
    try {
        const data = await sanityClient.fetch(`
            *[_type == "application" && seeker._ref == $seekerProfileId]{
                ...,
                // We need to see the listing details for each application
                listing->{
                    ...,
                    "imageUrl": property->gallery[0].asset->url,
                    property->
                }
            } | order(_createdAt desc)
        `, { seekerProfileId });
        return data;
    } catch (error) {
        console.error("Error fetching seeker's applications:", error);
        return [];
    }
}

// Check if an application already exists for a specific seeker and listing
export async function checkIfApplicationExists(listingId, seekerProfileId) {
    try {
        // This query counts the number of matching documents. It's faster than fetching the whole document.
        const query = `count(*[_type == "application" && listing._ref == $listingId && seeker._ref == $seekerProfileId])`;
        const params = { listingId, seekerProfileId };
        
        const count = await sanityClient.fetch(query, params);
        
        // If the count is greater than 0, an application exists.
        return count > 0;
    } catch (error) {
        console.error("Error checking for application:", error);
        return false; // Default to false on error
    }
}

export async function getAllSeekerProfiles() {
    try {
        const data = await sanityClient.fetch(`*[_type == "personProfile"] | order(_createdAt desc)`);
        return data;
    } catch (error) {
        console.log("Error fetching all seeker profiles:", error);
        return [];
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
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
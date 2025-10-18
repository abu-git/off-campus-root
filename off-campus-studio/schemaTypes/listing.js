// File: sanity/schemas/listing.js
import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'listing',
    title: 'Listing (Rental Offer)',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Listing Title',
            type: 'string',
            description: 'E.g., "Spacious Room with Mountain View" or "Modern 2-Bed City Apartment"',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'property',
            title: 'Property',
            type: 'reference',
            to: [{type: 'property'}],
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'listingType',
            title: 'Listing Type',
            type: 'string',
            options: {
                list: [
                { title: 'Entire Place', value: 'entirePlace' },
                { title: 'Shared Room', value: 'sharedRoom' },
                ],
                layout: 'radio',
                direction: 'horizontal',
            },
            initialValue: 'entirePlace',
            validation: Rule => Rule.required(),
        }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'price', title: 'Price (per year)', type: 'number', validation: Rule => Rule.required() }),
        defineField({ name: 'agent', title: 'Listing Agent/Contact', type: 'string' }),
        defineField({
            name: 'authorClerkId',
            title: 'Author Clerk ID',
            type: 'string',
            description: "The unique ID of the Clerk user who created this listing.",
            readOnly: true, // This field should be set by the app, not manually
        }),
        defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime' }),
        
        // --- Fields that ONLY show up for Roommate Listings ---
        defineField({
            name: 'roomType',
            title: 'Room Type',
            type: 'string',
            options: { list: ['Private Room', 'Shared Room'] },
            hidden: ({parent}) => parent?.listingType !== 'sharedRoom'
        }),
        defineField({
            name: 'privateBathroom',
            title: 'Private Bathroom?',
            type: 'boolean',
            initialValue: false,
            hidden: ({parent}) => parent?.listingType !== 'sharedRoom'
        }),
        defineField({
            name: 'currentOccupants',
            title: 'Current Number of Roommates',
            type: 'number',
            description: 'Excluding the new person.',
            hidden: ({parent}) => parent?.listingType !== 'sharedRoom'
        }),
        defineField({
            name: 'householdVibe',
            title: 'Household Vibe',
            type: 'array',
            of: [{type: 'string'}],
            options: {
                list: [
                    { title: 'Social & Outgoing', value: 'social' },
                    { title: 'Quiet & Studious', value: 'quiet' },
                    { title: 'Young Professionals', value: 'professionals' },
                    { title: 'Clean & Tidy', value: 'clean' },
                    { title: 'Creative Hub', value: 'creative' },
                    { title: 'Health & Wellness', value: 'wellness' },
                    { title: 'Night Owls', value: 'night-owls' },
                    { title: 'Early Birds', value: 'early-birds' },
                    { title: 'LGBTQ+ Friendly', value: 'lgbtq-friendly' },
                ],
                layout: 'tags'
            },
            hidden: ({parent}) => parent?.listingType !== 'sharedRoom'
        }),
        defineField({
            name: 'houseRules',
            title: 'Key House Rules',
            type: 'text',
            description: 'E.g., No smoking indoors, vegetarian kitchen, no overnight guests.',
            hidden: ({parent}) => parent?.listingType !== 'sharedRoom'
        }),
    ],
    preview: {
        select: {
            title: 'title',
            listingType: 'listingType',
            property: 'property.name',
        },
        prepare({title, listingType, property}) {
            return {
                title: title,
                subtitle: `${listingType === 'sharedRoom' ? 'Room in' : 'Entire'} ${property}`
            }
        }
    }
})
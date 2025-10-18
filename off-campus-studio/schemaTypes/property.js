// File: sanity/schemas/property.js
import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'property',
    title: 'Property (Physical Building)',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Property Name/Address',
            type: 'string',
            description: 'E.g., "The Orangerie, Vredehoek" or "15 Main Road, Green Point"',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'authorClerkId',
            title: 'Author Clerk ID',
            type: 'string',
            //readOnly: true,
        }),
        defineField({
            name: 'area',
            title: 'Area/Suburb',
            type: 'string',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'type',
            title: 'Property Type',
            type: 'string',
            options: {
                list: [
                { title: 'House', value: 'house' },
                { title: 'Apartment Block', value: 'apartment' },
                { title: 'Townhouse Complex', value: 'townhouse' },
                { title: 'Other', value: 'other' },
                ],
                layout: 'dropdown'
            },
        }),
        defineField({
            name: 'totalBedrooms',
            title: 'Total Bedroom(s) in Property',
            type: 'number',
        }),
        defineField({
            name: 'totalBathrooms',
            title: 'Total Bathroom(s) in Property',
            type: 'number',
        }),
        
        // --- THIS IS THE UPDATED FACILITIES FIELD ---
        defineField({
            name: 'facilities',
            title: 'Building/Property Facilities',
            type: 'array',
            of: [
                {
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Wifi', value: 'wifi' },
                            { title: 'Swimming Pool', value: 'swimming-pool' },
                            { title: 'Laundry', value: 'laundry' },
                            { title: 'Parking', value: 'parking' },
                            { title: 'Sports Center', value: 'sports-center' },
                            { title: 'Gym', value: 'gym' },
                            { title: 'Pet Friendly', value: 'pet-friendly' },
                        ]
                    }
                }
            ],
            options: {
                layout: 'tags'
            }
        }),

        defineField({
            name: 'gallery',
            title: 'Photo Gallery',
            type: 'array',
            of: [{ type: 'image', /* ... your gallery image fields ... */ }] 
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'area'
        }
    },
})

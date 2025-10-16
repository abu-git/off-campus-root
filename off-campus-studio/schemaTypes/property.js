import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'property',
    title: 'Property',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'description',
            title: 'Short Description',
            type: 'string',
        }),
        defineField({
            name: 'address',
            title: 'Address',
            type: 'string',
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'string',
        }),
        defineField({
            name: 'area',
            title: 'Area',
            type: 'string',
        }),
        defineField({
            name: 'bedroom',
            title: 'Bedroom(s)',
            type: 'number',
        }),
        defineField({
            name: 'bathroom',
            title: 'Bathroom(s)',
            type: 'number',
        }),
        defineField({
            name: 'rating',
            title: 'Rating',
            type: 'number',
        }),
        defineField({
            name: 'isOwner',
            title: 'Is Agent the Owner',
            type: 'boolean',
        }),
        defineField({
            name: 'image',
            title: 'Image URL',
            type: 'string',
        }),
        defineField({
            name: 'agent',
            title: 'Agent Name',
            type: 'string'
        }),
        defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'All', value: 'all' },
                    { title: 'House', value: 'house' },
                    { title: 'Condo', value: 'condo' },
                    { title: 'Duplex', value: 'duplex' },
                    { title: 'Studio', value: 'studio' },
                    { title: 'Villa', value: 'villa' },
                    { title: 'Apartment', value: 'apartment' },
                    { title: 'Townhouse', value: 'townhouse' },
                    { title: 'Others', value: 'others' },
                ],
                layout: 'dropdown'
            },
            initialValue: 'all'
        }),
        defineField({
            name: 'facilities',
            title: 'Facilities',
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
            title: 'Gallery',
            type: 'array',
            of: [
                {
                    type: 'image',
                    options: {
                        hotspot: true
                    },
                    fields: [
                        {
                            name: 'alt',
                            title: 'Alternative Text',
                            type: 'string',
                            description: 'Important for SEO and accessibility.',
                            validation: Rule => Rule.required(),
                        },
                        {
                            name: 'caption',
                            title: 'Caption',
                            type: 'string',
                        }
                    ]
                }
            ] 
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
        })
    ],

    preview: {
        select: {
            title: 'name',
        }
    },
})

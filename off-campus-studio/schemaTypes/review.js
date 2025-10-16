import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'review',
    title: 'Review',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'review',
            title: 'Review',
            type: 'string',
        }),
        defineField({
            name: 'propertyId',
            title: 'Property ID',
            type: 'string',
        }),
        defineField({
            name: 'image',
            title: 'Image URL',
            type: 'string',
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

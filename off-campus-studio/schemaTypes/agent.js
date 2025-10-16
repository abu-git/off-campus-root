import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'agent',
    title: 'Agent',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
        }),
        defineField({
            name: 'phone',
            title: 'Phone Number',
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

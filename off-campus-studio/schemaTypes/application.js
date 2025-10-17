import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'application',
    title: 'Roommate Application',
    type: 'document',
    fields: [
        defineField({
            name: 'listing',
            title: 'Listing',
            type: 'reference',
            to: [{type: 'listing'}],
            readOnly: true,
        }),
        defineField({
            name: 'seeker',
            title: 'Seeker Profile',
            type: 'reference',
            to: [{type: 'personProfile'}],
            readOnly: true,
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                {title: 'Pending', value: 'pending'},
                {title: 'Viewed', value: 'viewed'},
                {title: 'Accepted', value: 'accepted'},
                {title: 'Rejected', value: 'rejected'},
                ],
                layout: 'radio'
            },
            initialValue: 'pending',
        }),
        defineField({
            name: 'message',
            title: 'Introductory Message',
            type: 'text',
        }),
    ],
})
// File: sanity/schemas/personProfile.js
import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'personProfile',
    title: 'Person Profile (Roommate Seeker)',
    type: 'document',
    fields: [
        defineField({
            name: 'clerkId',
            title: 'Clerk User ID',
            type: 'string',
            readOnly: true, // Set from your backend, not manually in the Studio
        }),
        defineField({ name: 'fullName', title: 'Full Name', type: 'string', validation: Rule => Rule.required() }),
        defineField({ name: 'age', title: 'Age', type: 'number' }),
        defineField({ name: 'occupation', title: 'Occupation', type: 'string', options: { list: ['Student', 'Professional', 'Creative/Freelancer', 'Other'] } }),
        
        // --- Lifestyle & Preferences ---
        defineField({
            name: 'bio',
            title: 'About Me',
            type: 'text',
            description: 'A short bio to introduce yourself to potential roommates.',
        }),
        defineField({
            name: 'socialHabits',
            title: 'Social Habits',
            type: 'array',
            of: [{type: 'string'}],
            options: {
                list: ['Often have friends over', 'Mostly keep to myself', 'A mix of both', 'Love to host'],
                layout: 'tags'
            }
        }),
        defineField({
            name: 'cleanliness',
            title: 'Cleanliness Level',
            type: 'string',
            options: { list: ['Very Tidy', 'Casually Clean', 'A bit messy is ok'] }
        }),
        defineField({ name: 'smoker', title: 'Smoker?', type: 'boolean', initialValue: false }),
        defineField({ name: 'hasPets', title: 'Do you have pets?', type: 'boolean', initialValue: false }),
        
        // --- What they're looking for ---
        defineField({ name: 'maxBudget', title: 'Maximum Budget (per month)', type: 'number' }),
        defineField({ name: 'moveInDate', title: 'Ideal Move-in Date', type: 'date' }),
    ],
    preview: {
        select: {
            title: 'fullName',
            subtitle: 'occupation',
        }
    }
})
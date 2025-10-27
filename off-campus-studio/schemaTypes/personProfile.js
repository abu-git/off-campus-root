// File: sanity/schemas/personProfile.js
import {defineField, defineType} from 'sanity'
import React from 'react'

export default defineType({
  name: 'personProfile',
  title: 'Person Profile (Roommate Seeker)',
  type: 'document',
  // Define groups for organization in the Sanity Studio
  groups: [
    {name: 'base', title: 'Base Info', default: true},
    {name: 'characteristics', title: 'About Me (Characteristics)'},
    {name: 'preferences', title: 'My Preferred Roommate'},
  ],
  fields: [
    // --- Base Info ---
    defineField({
      name: 'clerkId',
      title: 'Clerk User ID',
      type: 'string',
      readOnly: true,
      group: 'base',
    }),
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'base',
    }),
    defineField({
      name: 'imageUrl',
      title: 'Image URL',
      type: 'url',
      readOnly: true,
      group: 'base',
    }),
    defineField({
      name: 'age',
      title: 'Age',
      type: 'number',
      group: 'base',
    }),
    defineField({
      name: 'occupation',
      title: 'Occupation',
      type: 'string',
      options: {
        list: ['Student', 'Professional', 'Creative/Freelancer', 'Other'],
      },
      group: 'base',
    }),
    defineField({
      name: 'gender',
      title: 'Gender',
      type: 'string',
      options: {
        list: [
          {title: 'Male', value: 'male'},
          {title: 'Female', value: 'female'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
      description: 'Taken from the user profile for matching.',
      group: 'base',
    }),
    defineField({
      name: 'bio',
      title: 'About Me',
      type: 'text',
      description: 'A short bio to introduce yourself.',
      group: 'base',
    }),
    defineField({
      name: 'smoker',
      title: 'Smoker?',
      type: 'boolean',
      initialValue: false,
      group: 'base',
    }),
    defineField({
      name: 'hasPets',
      title: 'Do you have pets?',
      type: 'boolean',
      initialValue: false,
      group: 'base',
    }),
    defineField({
      name: 'moveInDate',
      title: 'Ideal Move-in Date',
      type: 'date',
      group: 'base',
    }),

    // --- CHARACTERISTICS (About You) ---
    defineField({
      name: 'sleepSchedule',
      title: 'How would you describe your sleep schedule?',
      type: 'string',
      group: 'characteristics',
      options: {
        list: [
          {title: 'Early Riser (I sleep before midnight and wake up early)', value: 'early_riser'},
          {title: 'Night Owl (Active at night, I sleep late and wake up late)', value: 'night_owl'},
          {title: 'Regular/Balanced Sleeper (Around midnight to 8am)', value: 'balanced'},
          {title: 'Flexible / Irregular (Depends on classes or workload)', value: 'flexible'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'cleanliness',
      title: 'How tidy are you?',
      type: 'string',
      group: 'characteristics',
      options: {
        // Updated options based on PDF [cite: 393-399]
        list: [
          {title: 'Very Neat (I like my space spotless and organized)', value: 'very_neat'},
          {title: 'Moderately Clean (I keep things clean but not overly strict)', value: 'moderate'},
          {title: 'Laidback (I\'m okay with a little clutter sometimes)', value: 'laidback'},
          {title: 'Irregular (It depends on my mood)', value: 'irregular'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'socialLifestyle',
      title: 'How social are you at home?',
      type: 'string',
      group: 'characteristics',
      options: {
        // Replaces old socialHabits field [cite: 400-407]
        list: [
          {title: 'Social/Outgoing (Enjoy hanging out and having friends over)', value: 'social'},
          {title: 'Moderately Social (Enjoy company sometimes but also like quiet time)', value: 'moderate'},
          {title: 'Reserved (I prefer to keep to myself most times)', value: 'reserved'},
          {title: 'Flexible / Depends on Situation', value: 'flexible'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'noisePreference',
      title: 'What kind of noise level do you prefer at home?',
      type: 'string',
      group: 'characteristics',
      options: {
        list: [
          {title: 'Very Quiet (I like a calm, peaceful space)', value: 'quiet'},
          {title: 'Moderate (I\'m fine with some background activity)', value: 'moderate'},
          {title: 'Lively (I don\'t mind a bit of noise or movement)', value: 'lively'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'respect',
      title: 'How do you handle boundaries and respect?',
      type: 'string',
      group: 'characteristics',
      options: {
        list: [
          {title: "Very Respectful (I always ask before using anyone's things)", value: 'very_respectful'},
          {title: 'Respectful but Easygoing (I respect boundaries but don\'t mind sharing)', value: 'respectful_easygoing'},
          {title: "Chill/Easygoing (I'm relaxed about privacy as long as it's mutual)", value: 'chill'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'maxBudget',
      title: "What's your maximum budget?",
      type: 'number',
      group: 'characteristics',
    }),

    // --- PREFERENCES (My Preferred Roommate) ---
    defineField({
      name: 'preferredGender',
      title: 'Preferred roommate gender?',
      type: 'string',
      group: 'preferences',
      options: {
        list: [
          {title: 'Male', value: 'male'},
          {title: 'Female', value: 'female'},
          {title: 'No Preference', value: 'no_preference'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'preferredSleepSchedule',
      title: 'Preferred roommate sleep schedule?',
      type: 'string',
      group: 'preferences',
      options: {
        list: [
          {title: 'Early Riser', value: 'early_riser'},
          {title: 'Night Owl', value: 'night_owl'},
          {title: 'Flexible / No Preference', value: 'no_preference'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'preferredCleanliness',
      title: 'Preferred roommate tidiness?',
      type: 'string',
      group: 'preferences',
      options: {
        list: [
          {title: 'Very Neat', value: 'very_neat'},
          {title: 'Moderately Clean', value: 'moderate'},
          {title: 'Laidback / Easygoing', value: 'laidback'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'preferredSocialLifestyle',
      title: 'Preferred roommate social lifestyle?',
      type: 'string',
      group: 'preferences',
      options: {
        list: [
          {title: 'Outgoing/Sociable', value: 'social'},
          {title: 'Balanced', value: 'moderate'}, // Using 'moderate' for consistency
          {title: 'Reserved / Quiet', value: 'reserved'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'preferredNoiseLevel',
      title: 'Preferred living space noise level?',
      type: 'string',
      group: 'preferences',
      options: {
        list: [
          {title: 'Very Quiet (study or rest-friendly)', value: 'quiet'},
          {title: 'Moderate (some noise is fine)', value: 'moderate'},
          {title: 'No Preference', value: 'no_preference'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'preferredRespect',
      title: 'Preferred roommate respect level?',
      type: 'string',
      group: 'preferences',
      options: {
        list: [
          {title: 'Very Respectful', value: 'very_respectful'},
          {title: 'Respectful but Easygoing', value: 'respectful_easygoing'},
          {title: 'Chill/Easygoing', value: 'chill'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'preferredMinBudget',
      title: "What's the minimum budget you'd prefer your roommate to have?",
      type: 'number',
      group: 'preferences',
    }),
  ],
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'occupation',
      media: 'imageUrl', // Still select the URL
    },
    // Add this 'prepare' function
    prepare({title, subtitle, media}) {
        return {
          title,
          subtitle,
          // This is the plain JavaScript equivalent of JSX
          media: media ? React.createElement('img', { src: media, alt: title }) : undefined,
        }
    },
  },
})
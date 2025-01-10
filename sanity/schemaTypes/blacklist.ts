import { defineField, defineType } from 'sanity';

export const blacklist = defineType({
  name: 'blacklist',
  title: 'Blacklisted Words',
  type: 'document',
  fields: [
    defineField({
      name: 'word',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Profanity', value: 'profanity' },
          { title: 'Spam', value: 'spam' },
          { title: 'Hate Speech', value: 'hate' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'notes',
      type: 'text',
    }),
  ],
});

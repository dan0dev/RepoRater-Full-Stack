import { defineField, defineType } from 'sanity';

export const card = defineType({
  name: 'card',
  title: 'Card',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      type: 'number',
    }),
    defineField({
      name: 'url',
      type: 'url',
    }),
    defineField({
      name: 'user',
      type: 'reference',
      to: { type: 'user' },
    }),
    defineField({
      name: 'isAnonymous',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'rating',
      type: 'number',
    }),
    defineField({
      name: 'postedAt',
      type: 'datetime',
      options: {
        dateFormat: 'DD-MM-YYYY',
        timeFormat: 'HH:mm',
      },
    }),
  ],
});

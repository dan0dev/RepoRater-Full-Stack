import { defineField, defineType } from 'sanity';

export const user = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'userId',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      type: 'string',
    }),
    defineField({
      name: 'username',
      type: 'string',
    }),
    defineField({
      name: 'image',
      type: 'url',
    }),
    defineField({
      name: 'isBlocked',
      type: 'boolean',
      title: 'Block User',
      description: 'Block this user from posting',
      initialValue: false,
    }),
    defineField({
      name: 'blockReason',
      type: 'string',
      title: 'Block Reason',
      description: 'Reason why the user was blocked',
      hidden: ({ document }) => !document?.isBlocked,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'username',
      blocked: 'isBlocked',
    },
    prepare({ title, subtitle, blocked }) {
      return {
        title: `${title}${blocked ? ' (BLOCKED)' : ''}`,
        subtitle,
      };
    },
  },
});

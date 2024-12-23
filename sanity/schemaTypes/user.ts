import { defineField, defineType } from "sanity";

export const user = defineType({
  name: "user",
  title: "User",
  type: "document",
  fields: [
    defineField({
      name: "id",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "username",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "url",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "username",
    },
  },
});

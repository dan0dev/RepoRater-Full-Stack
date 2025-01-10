import { defineField, defineType } from "sanity";

export const blacklist = defineType({
  name: "blacklist",
  title: "Blacklisted Words",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      initialValue: "Blacklist Configuration",
      readOnly: true,
    }),
    defineField({
      name: "words",
      title: "Blacklisted Words",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "word",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "category",
              type: "string",
              options: {
                list: [
                  { title: "Profanity", value: "profanity" },
                  { title: "Spam", value: "spam" },
                  { title: "Hate Speech", value: "hate" },
                  { title: "Other", value: "other" },
                ],
              },
            },
            {
              name: "notes",
              type: "text",
            },
          ],
        },
      ],
    }),
  ],
});

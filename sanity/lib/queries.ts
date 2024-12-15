import { defineQuery } from "next-sanity";

export const CARDS_QUERY = defineQuery(
  `*[_type == "card"] | order(postedAt desc) {
    url,
    "user": coalesce(user->, {
      "username": "anonymous",
      "name": "Anonymous",
      "image": null
    }),
    description,
    rating,
    postedAt
  }`
);

import { defineQuery } from "next-sanity";

export const CARDS_QUERY = defineQuery(
  `*[_type == "card" && defined(user._type)] | order(postedAt desc) {
  url,
  user -> {
    _id, name, username, image
  },
  description,
  rating,
  postedAt
}`
);

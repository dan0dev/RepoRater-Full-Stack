import { card } from "@/sanity/schemaTypes/card";
import { user } from "@/sanity/schemaTypes/user";
import { type SchemaTypeDefinition } from "sanity";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [user, card],
};

import { type SchemaTypeDefinition } from 'sanity';
import { blacklist } from './blacklist';
import { card } from './card';
import { user } from './user';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [user, card, blacklist],
};

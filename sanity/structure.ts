import type { StructureResolver } from 'sanity/structure';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('user').title('Users'),
      S.documentTypeListItem('card').title('Cards'),
      S.listItem()
        .title('Blacklisted Words')
        .child(S.document().schemaType('blacklist').documentId('blacklistConfig')),
    ]);

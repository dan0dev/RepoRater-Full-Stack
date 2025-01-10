import { createClient } from '@sanity/client';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        try {
          const existingUser = await sanityClient.fetch(`*[_type == "user" && userId == $id][0]`, {
            id: user.id,
          });

          if (!existingUser) {
            await sanityClient.create({
              _type: 'user',
              userId: user.id,
              name: user.name,
              username: user.username || profile?.login,
              image: user.image,
            });
          } else {
            await sanityClient
              .patch(existingUser._id)
              .set({
                name: user.name,
                username: user.username || profile?.login,
                image: user.image,
              })
              .commit();
          }
          return true;
        } catch (error) {
          console.error('Error handling user in Sanity:', error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.username = token.username as string;
      }
      return session;
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.username = profile.login;
      }
      return token;
    },
  },
});

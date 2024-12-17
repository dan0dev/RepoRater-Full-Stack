import { createClient } from "@sanity/client";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "github") {
        const githubProfile = profile as {
          id: string;
          login: string;
          name: string;
          email: string;
          avatar_url: string;
        };

        try {
          // Felhasználó ellenőrzése kizárólag az ID alapján
          const existingUser = await sanityClient.fetch(
            `*[_type == "user" && id == $id][0]`,
            {
              id: githubProfile.id,
            }
          );

          if (!existingUser) {
            // Új felhasználó létrehozása, ha nem létezik
            await sanityClient.create({
              _id: `user-${githubProfile.id}`,
              _type: "user",
              id: githubProfile.id,
              name: githubProfile.name || githubProfile.login,
              username: githubProfile.login,
              image: githubProfile.avatar_url,
            });
          } else {
            // Meglévő felhasználó adatainak frissítése
            await sanityClient
              .patch(existingUser._id)
              .set({
                name: githubProfile.name || githubProfile.login,
                username: githubProfile.login,
                image: githubProfile.avatar_url,
              })
              .commit();
          }
        } catch (error) {
          console.error("Error handling user in Sanity:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});

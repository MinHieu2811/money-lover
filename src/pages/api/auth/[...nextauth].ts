import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import getConfig from "next/config";
import { v4 as uuidv4 } from "uuid";

declare module "next-auth" {
}

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  secret: getConfig().serverRuntimeConfig.nextAuthSecret || '',
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24h
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24h
  },
  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: any;
      account: any;
      profile: any;
    }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile.id || uuidv4();
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: any;
      token: any;
    }) {
      session.accessToken = token?.accessToken;
      session.user.id = token?.sub;

      return session;
    },
  },
  providers: [
    GoogleProvider({
      clientId: getConfig().serverRuntimeConfig.googleClientId || "",
      clientSecret: getConfig().serverRuntimeConfig.googleClientSecret || "",
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile?.sub || "",
          name: profile?.name || "",
          email: profile?.email || "",
          image: profile?.picture || "",
        };
      },
    }),
  ],
};
export default NextAuth(authOptions as NextAuthOptions);

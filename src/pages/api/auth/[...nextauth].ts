import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24h
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24h
  },
  // callbacks: {
  //   async jwt({ token, account }: any) {
  //     if (account) {
  //       token.accessToken = account?.access_token || '';
  //     }
  //     return token;
  //   },
  //   async session({ session, token }: any) {
  //     session.accessToken = token?.accessToken || '';
  //     return session;
  //   },
  // },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: 'openid profile',
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

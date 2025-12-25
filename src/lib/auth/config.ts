import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Implement credential validation with Supabase
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/overview") ||
        nextUrl.pathname.startsWith("/costs") ||
        nextUrl.pathname.startsWith("/usage") ||
        nextUrl.pathname.startsWith("/providers") ||
        nextUrl.pathname.startsWith("/optimization") ||
        nextUrl.pathname.startsWith("/budgets") ||
        nextUrl.pathname.startsWith("/alerts") ||
        nextUrl.pathname.startsWith("/reports") ||
        nextUrl.pathname.startsWith("/teams") ||
        nextUrl.pathname.startsWith("/projects") ||
        nextUrl.pathname.startsWith("/cost-centers") ||
        nextUrl.pathname.startsWith("/api-keys") ||
        nextUrl.pathname.startsWith("/settings");
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

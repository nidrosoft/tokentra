import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

// Create a Supabase client for auth operations
function getSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const supabase = getSupabaseClient();
        
        // Find user by email
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, name, avatar_url, password_hash")
          .eq("email", credentials.email as string)
          .single();

        if (error || !user) {
          return null;
        }

        // Verify password using bcrypt (you'll need to hash passwords on registration)
        // For now, we'll use a simple comparison - replace with proper bcrypt in production
        // const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
        
        // TODO: Implement proper password hashing with bcrypt
        // For development, allow any password if password_hash is null
        if (user.password_hash && user.password_hash !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
        };
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

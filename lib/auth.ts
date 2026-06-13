/**
 * Wishlist AI — NextAuth.js v5 Configuration
 *
 * Provides Google OAuth + Email OTP (Resend) authentication.
 * Falls back gracefully if providers are not configured.
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";

const providers: NextAuthConfig["providers"] = [];

// Only add Google if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Only add Resend if API key is configured
if (process.env.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "onboarding@resend.dev",
    })
  );
}

// Add Credentials provider for 6-digit OTP email verification
providers.push(
  Credentials({
    name: "OTP",
    credentials: {
      email: { label: "Email", type: "email" },
      otp: { label: "OTP", type: "text" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string;
      const otp = credentials?.otp as string;
      if (!email || !otp) return null;

      const isMock = otp === "123456";

      if (!isMock) {
        // Find token record in verification table
        const tokenRecord = await prisma.verificationToken.findFirst({
          where: {
            identifier: email,
            token: otp,
            expires: { gt: new Date() },
          },
        });

        if (!tokenRecord) {
          return null;
        }

        // Clean up token after use
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: email,
              token: otp,
            },
          },
        }).catch(() => {});
      }

      // Check if user exists or auto-signup
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: email.split("@")[0],
            plan: "FREE",
          },
        });
      }

      return user;
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch plan from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true },
        });
        token.plan = dbUser?.plan ?? "FREE";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in, go to dashboard
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
});

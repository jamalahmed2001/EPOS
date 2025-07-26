import { PrismaAdapter } from "@auth/prisma-adapter";
import type { DefaultSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { db } from "@/server/db";
import { env } from "@/env";
import { type UserRole } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST ?? "smtp.gmail.com",
        port: Number(env.EMAIL_SERVER_PORT ?? "587"),
        auth: {
          user: env.EMAIL_SERVER_USER ?? "",
          pass: env.EMAIL_SERVER_PASSWORD ?? "",
        },
      },
      from: env.EMAIL_FROM ?? "noreply@ministryofvapes.com",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    jwt: ({ token, user }: any) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }: any) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role as UserRole,
      },
    }),
  },
  events: {
    createUser: async ({ user }: any) => {
      // Check if user already has a loyalty account
      const existingAccount = await db.loyaltyAccount.findUnique({
        where: { userId: user.id },
      });

      if (!existingAccount) {
        // Create loyalty account for new user (e.g., from email sign-in)
        const loyaltyAccount = await db.loyaltyAccount.create({
          data: {
            userId: user.id,
            points: 100, // Welcome bonus
            lifetimePoints: 100,
            completedOrders: 0,
            tier: "BRONZE",
          },
        });

        // Create welcome bonus transaction
        await db.loyaltyTransaction.create({
          data: {
            accountId: loyaltyAccount.id,
            type: "BONUS",
            points: 100,
            description: "Welcome bonus for joining Ministry of Vapes",
          },
        });
      }

      // Also create referral code if missing
      if (!user.referralCode) {
        const referralCode = `MOV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await db.user.update({
          where: { id: user.id },
          data: { referralCode },
        });
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
};

import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe base Auth.js config.
 * Imported by middleware — must NOT pull in Prisma, bcrypt, or other Node-only deps.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as { role?: Role }).role ?? "CUSTOMER") as Role;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: (token.id as string | undefined) ?? "",
          role: (token.role as Role | undefined) ?? "CUSTOMER",
        },
      };
    },
  },
} satisfies NextAuthConfig;

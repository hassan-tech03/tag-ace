import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, adminUsers } from "./db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, credentials.email.toLowerCase().trim()))
          .limit(1);
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        // Fire-and-forget timestamp update; ignore errors.
        db.update(adminUsers)
          .set({ lastLoginAt: new Date() })
          .where(eq(adminUsers.id, user.id))
          .catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

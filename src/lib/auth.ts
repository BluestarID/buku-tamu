import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const user = await prisma.resepsionis.findUnique({
            where: { username: credentials.username },
          });

          if (!user) {
            console.log(`[AUTH] User not found in database: "${credentials.username}"`);
            return null;
          }

          // Support both bcrypt hashed password and direct plain text password
          let isPasswordValid = credentials.password === user.password;
          if (!isPasswordValid) {
            try {
              isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.password
              );
            } catch {
              isPasswordValid = false;
            }
          }

          if (!isPasswordValid) {
            console.log(`[AUTH] Invalid password for user: ${credentials.username}`);
            return null;
          }

          return {
            id: user.id.toString(),
            name: user.nama,
            username: user.username,
          };
        } catch (error) {
          console.error("NextAuth authorize error (check DB connection / prisma):", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as unknown as { username: string }).username;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { username: string }).username = token.username as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "buku-tamu-secret-key-super-secure-32chars",
};

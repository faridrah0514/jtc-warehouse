// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { openDB } from '@/helper/db';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const connection = openDB();
          const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [credentials.username]);
          connection.end();

          const userRows = rows as mysql.RowDataPacket[];

          if (userRows.length === 0) {
            return null;
          }

          const user = userRows[0];

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

          if (isPasswordValid) {
            return { id: user.id, name: user.username, username: user.username, role: user.role, editable_until: user.editable_until };
          } else {
            return null;
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60 * 8,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.role = user.role;
        token.editable_until = user.editable_until
      }
      return token;
    },
    async session({ session, token }) {
      session.user.username = token.username as string;
      session.user.role = token.role as string;
      session.user.editable_until = token.editable_until as number;
      return session;
    },
  },
});

export { handler as GET, handler as POST };

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt'; // For password hashing
import mysql from "mysql2/promise";
import { openDB } from "@/helper/db";

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

        // Fetch the user from the database
        try {
          const connection = openDB();
          const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [credentials.username]);
          connection.end();

          const userRows = rows as mysql.RowDataPacket[];

          if (userRows.length === 0) {
            return null; // User not found
          }

          const user = userRows[0];

          // Compare the provided password with the hashed password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

          if (isPasswordValid) {
            // Return the user object if authentication is successful
            return { id: user.id, name: user.username, username: user.username };
          } else {
            return null; // Invalid password
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          return null; // Internal server error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Use JWT strategy if you want token-based sessions
    maxAge: 30 * 60 * 8, // Session max age in seconds (e.g., 30 minutes)
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };

// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         username: { label: 'Username', type: 'text' },
//         password: { label: 'Password', type: 'password' }
//       },
//       authorize(credentials) {
//         // Hardcoded credentials
//         const user = { id: '1', name: 'user', username: 'user', password: 'password' };
//         console.log("credentials -----> ", credentials)

//         if (
//           credentials?.username === user.username &&
//           credentials?.password === user.password
//         ) {
//           return user;
//         } else {
//           return null;
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: 'jwt', // Use JWT strategy if you want token-based sessions
//     maxAge: 30 * 60 * 8, // Session max age in seconds (e.g., 30 minutes)
//   },
//   pages: {
//     signIn: '/login',
//   },
// });

// export { handler as GET, handler as POST };
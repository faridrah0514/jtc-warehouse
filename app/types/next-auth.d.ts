// types/next-auth.d.ts

import 'next-auth';
import { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User {
    username?: string;
    role?: string;
    editable_until?: number;
  }

  interface Session {
    user: {
      id?: number;
      username?: string;
      role?: string;
      editable_until?: number;
    } & DefaultUser;
  }

  interface Token {
    username?: string;
    role?: string;
    editable_until?: number;
  }
}

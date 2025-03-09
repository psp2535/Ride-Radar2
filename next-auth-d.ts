import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string; // ✅ Add role here
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string; // ✅ Add role here
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: string; // ✅ Add role here
  }
}

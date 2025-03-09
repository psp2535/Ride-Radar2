// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing email or password");
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user) {
//           throw new Error("No user found with this email");
//         }

//         const isValid = bcrypt.compareSync(credentials.password, user.password);
//         if (!isValid) {
//           throw new Error("Incorrect password");
//         }

//         return {
//           id: user.id.toString(),
//           name: user.name,
//           email: user.email,
//           role: user.role,
//         };
//       },
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/login",
//     error: "/login", // Redirect errors to login page
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user.role = token.role;
//       return session;
//     },
//   },
// });

// // ✅ Correct export for App Router (Next.js 13+)
// export { handler as GET, handler as POST };
// import NextAuth, { AuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import { JWT } from "next-auth/jwt";
// import { Session } from "next-auth";

// const prisma = new PrismaClient();

// export const authOptions: AuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing email or password");
//         }

//         const user = await prisma.user.findUnique({ where: { email: credentials.email } });
//         if (!user) {
//           throw new Error("No user found with this email");
//         }

//         const isValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isValid) {
//           throw new Error("Incorrect password");
//         }

//         return { id: user.id, name: user.name, email: user.email, role: user.role };
//       },
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async jwt({ token, user }: { token: JWT; user?: any }) {
//       if (user) {
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }: { session: Session; token: JWT }) {
//       if (session.user) {
//         session.user.role = token.role as string;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
// };

// export default NextAuth(authOptions);

import NextAuth, { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing email or password");
          throw new Error("Missing email or password");
        }

        console.log("🔍 Checking user with email:", credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("❌ No user found with this email:", credentials.email);
          throw new Error("No user found with this email");
        }

        console.log("✅ User found:", user);

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          console.log("❌ Incorrect password for user:", user.email);
          throw new Error("Incorrect password");
        }

        console.log("✅ Password correct, logging in user:", user.email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: JWT; user?: any }) {
      console.log("🔹 JWT Callback - Before:", token);
      
      if (user) {
        token.id = user.id;
        token.role = user.role; // Ensure role is stored
        console.log("✅ JWT Updated with Role:", token.role);
      }
    
      console.log("🔹 JWT Callback - After:", token);
      return token;
    },
    

    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("🔹 Session Callback - Before:", session);
      
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as string; // Ensure role is passed
        console.log("✅ Session Updated with Role:", session.user.role);
      }
    
      console.log("🔹 Session Callback - After:", session);
      return session;
    },
    
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


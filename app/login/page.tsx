// "use client";

// import { signIn, useSession } from "next-auth/react";
// import { useRouter } from "next/navigation"; 
// import { useEffect, useState } from "react";

// export default function Login() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//     if (session && isClient) {
//       if (session.user.role === "user") {
//         router.push("/user");
//       } else if (session.user.role === "driver") {
//         router.push("/driver");
//       }
//     }
//   }, [session, isClient, router]);

//   if (!isClient || status === "loading") return <p>Loading...</p>;

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <button
//         onClick={() => signIn("credentials")}
//         className="px-4 py-2 bg-blue-600 text-white rounded"
//       >
//         Sign In
//       </button>
//     </div>
//   );
// }

"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSession } from "next-auth/react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      console.log("✅ Login successful", result);

      // Fetch session to check user role
      const session = await getSession();

      if (session?.user?.role === "driver") {
        router.push("/driver"); // Redirect to driver dashboard
      } else {
        router.push("/user"); // Redirect to user dashboard
      }
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 w-full mb-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full">
          Sign In
        </button>
      </form>
    </div>
  );
}


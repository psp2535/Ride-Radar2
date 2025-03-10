"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Prevent redirects until session is loaded
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "driver") {
        router.replace("/driver");
      } else {
        router.replace("/user");
      }
    }
  }, [session, status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (isSignUp) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Account created! Please sign in.");
        setIsSignUp(false);
      } else {
        setMessage(`❌ ${data.message || "Error occurred"}`);
      }
    } else {
      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (result?.error) {
        setMessage(`❌ ${result.error}`);
      }
    }
  }

 

  return (
    <main className="flex min-h-screen">
      {/* Left Side - Background Image */}
      <div className="w-1/2 h-screen">
        <img src="/back.jpg" alt="Background" className="w-full h-full" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-10">
        <h1 className="text-4xl font-bold mb-6 text-black">{isSignUp ? "Sign Up" : "Sign In"}</h1>

        {message && (
          <p className={`mb-4 p-2 rounded ${message.startsWith("✅") ? "bg-green-300" : "bg-red-300"} text-black`}>
            {message}
          </p>
        )}

        {status !== "authenticated" ? (
          <form onSubmit={handleSubmit} className="w-80 bg-transparent p-6 rounded-lg">
            {isSignUp && (
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 mb-4 rounded bg-gray-300 text-black placeholder-gray-600"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 mb-4 rounded bg-gray-300 text-black placeholder-gray-600"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 mb-4 rounded bg-gray-300 text-black placeholder-gray-600"
              required
            />

            {isSignUp && (
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full p-3 mb-4 rounded bg-gray-300 text-black"
              >
                <option value="user">User</option>
                <option value="driver">Driver</option>
              </select>
            )}

            <button
              type="submit"
              className="w-full bg-yellow-500 text-black p-3 rounded font-bold hover:bg-yellow-600 transition"
            >
              {isSignUp ? "Create Account" : "Login"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-black mb-4">✅ Logged in as {session?.user?.email}</p>
           
          </div>
        )}

        {status !== "authenticated" && (
          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-black underline font-semibold">
            {isSignUp ? "Already have an account? Sign In" : "New here? Sign Up"}
          </button>
        )}
      </div>
    </main>
  );
}

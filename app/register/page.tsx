// "use client";

// import { useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// export default function Register() {
//   const router = useRouter();
  
//   // ✅ Explicit types for state
//   const [userData, setUserData] = useState<{ name: string; email: string; password: string; role: "user" | "driver" }>({
//     name: "",
//     email: "",
//     password: "",
//     role: "user",
//   });

//   const [error, setError] = useState<string | null>(null);

//   // ✅ Explicit event type
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setUserData({ ...userData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
  
//     try {
//       await axios.post("/api/register", userData);
//       router.push("/login"); // Redirect to login after successful registration
//     } catch (err) {
//       if (axios.isAxiosError(err)) {
//         // Handle Axios error properly
//         setError(err.response?.data?.message || "Registration failed. Please try again.");
//       } else {
//         // Handle unexpected errors
//         setError("An unexpected error occurred. Please try again.");
//       }
//       console.error("Error during registration:", err);
//     }
//   };
  

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
//         <h2 className="text-2xl mb-4">Register</h2>
//         {error && <p className="text-red-500">{error}</p>}
//         <input type="text" name="name" placeholder="Name" value={userData.name} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
//         <input type="email" name="email" placeholder="Email" value={userData.email} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
//         <input type="password" name="password" placeholder="Password" value={userData.password} onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
//         <select name="role" value={userData.role} onChange={handleChange} className="w-full p-2 border rounded mb-2">
//           <option value="user">User</option>
//           <option value="driver">Driver</option>
//         </select>
//         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
//       </form>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/login"); // Redirect to login after successful registration
    } else {
      const data = await res.json();
      setError(data.message || "Registration failed");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full mb-2"
          required
        />
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
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border p-2 w-full mb-2"
        >
          <option value="user">User</option>
          <option value="driver">Driver</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full">
          Register
        </button>
      </form>
    </div>
  );
}

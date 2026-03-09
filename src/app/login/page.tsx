"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
 
export default function LoginPage() {
 
  const router = useRouter();
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
 
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
 
      // if API failed
      if (!res.ok) {
        const text = await res.text();
        alert(text || "Login failed");
        return;
      }
 
      const data = await res.json();
 
      // store JWT token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
 
      // role-based redirect
      if (data.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/tickets");
      }
 
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong during login");
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-right from-indigo-500 to-purple-600 px-4">
 
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
 
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back 👋
        </h2>
 
        <form onSubmit={handleLogin} className="space-y-4">
 
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
 
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
 
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Login
          </button>
 
        </form>
 
        <p className="text-center text-gray-500 mt-4 text-sm">
          Admin: admin@test.com | 123456
        </p>
 
      </div>
 
    </div>
  );
}
 
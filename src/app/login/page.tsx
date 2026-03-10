"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
 
export default function LoginPage() {
 
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important: ensure cookies are sent/received
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("token", data.token);

      // Redirect based on role
      // Role IDs: 1=USER, 4=ADMIN, 5=AGENT, 6=MANAGER
      if (data.role === 4 || data.role === 6) {
        // ADMIN or MANAGER → dashboard
        window.location.href = "/dashboard";
      } else {
        // USER or AGENT → tickets
        window.location.href = "/tickets";
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#6B46C1,#4338CA)] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-2">
          JDESK
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Welcome Back 👋
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
 
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
 
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
          >
            Login
          </button>
 
        </form>
      </div>
 
    </div>
  );
}
 
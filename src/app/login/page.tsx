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
      const isAdminOrManager = data.roleName
        ? data.roleName === "ADMIN" || data.roleName === "MANAGER"
        : data.role === 4 || data.role === 6;

      if (isAdminOrManager) {
        // ADMIN or MANAGER → dashboard
        window.location.href = "/dashboard";
      } else {
        // EMPLOYEE or AGENT → tickets
        window.location.href = "/tickets";
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] font-sans px-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl border border-gray-200 shadow-sm w-full max-w-md">
        
        <div className="flex justify-center mb-8">
           <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
        </div>

        <h1 className="text-2xl font-semibold text-center text-black mb-1.5 tracking-tight">
          Welcome back
        </h1>

        <p className="text-center text-sm text-gray-500 mb-8">
          Enter your details to sign in to your account
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
               {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mt-2"
          >
            Sign In
          </button>
  
        </form>
      </div>
  
    </div>
  );
}
 
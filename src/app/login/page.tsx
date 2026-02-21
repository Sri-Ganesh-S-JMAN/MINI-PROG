"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      // Success → middleware will handle protection
      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#0A1F44] to-[#1F3C88] text-white flex-col justify-center p-16">
        <h1 className="text-5xl font-black mb-6">JDesk</h1>
        <p className="text-xl opacity-90 mb-10">
          Enterprise IT Service Management Platform
        </p>

        <div className="space-y-4">
          <p>✔ SLA Tracking</p>
          <p>✔ Asset Lifecycle</p>
          <p>✔ Structured Workflow</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">
            Welcome back. Please enter your credentials.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold block mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-sm font-medium">
                {error}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F3C88] hover:bg-[#162d66] text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
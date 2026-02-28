"use client";

import { useState } from "react";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();


    if (!res.ok) {
      setError("Invalid email or password ❌");
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "/dashboard";
  };

  return (
    return (
  <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#6B46C1,#4338CA)] px-4">
    
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-2">
        JDESK
      </h1>

      <p className="text-center text-gray-500 mb-6">
        Welcome Back 👋
      </p>

      {/* Keep your form here */}

    </div>

  </div>
);
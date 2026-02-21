"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    setRole(payload.role);

    if (payload.role !== "Admin") {
      router.push("/dashboard");
    }
  }, []);

  if (role !== "Admin") return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <p>Only Admin can see this page 👑</p>
    </div>
  );
}
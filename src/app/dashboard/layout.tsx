"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    setRole(payload.role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">JDesk</h2>

        <ul className="space-y-4">
          <li>Dashboard</li>

          {role === "Admin" && (
            <>
              <li
  onClick={() => router.push("/dashboard/users")}
  className="cursor-pointer hover:text-orange-400"
>
  User Management
</li>
              <li>Reports</li>
            </>
          )}
        </ul>

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-600 px-4 py-2 rounded w-full"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-8 bg-gray-100">{children}</div>
    </div>
  );
}
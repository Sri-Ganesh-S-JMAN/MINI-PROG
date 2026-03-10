"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
 
export default function CreateAssetPage() {
  const router = useRouter();
 
  const [name, setName] = useState("");
  const [serialNo, setSerialNo] = useState("");
 
  const handleSubmit = async (e: any) => {
    e.preventDefault();
 
    await fetch("/api/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, serialNo }),
    });
 
    router.push("/assets");
  };
 
  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Create Asset</h1>
 
      <form onSubmit={handleSubmit} className="space-y-4">
 
        <input
          type="text"
          placeholder="Asset Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
 
        <input
          type="text"
          placeholder="Serial Number"
          value={serialNo}
          onChange={(e) => setSerialNo(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
 
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Asset
        </button>
 
      </form>
    </div>
  );
}
"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
 
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
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/assets" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Assets
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Create Asset</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new asset to your inventory.</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Asset Name</label>
                <input
                    type="text"
                    placeholder="e.g. MacBook Pro M2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Serial Number</label>
                <input
                    type="text"
                    placeholder="e.g. C02X123456"
                    value={serialNo}
                    onChange={(e) => setSerialNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
                    required
                />
            </div>
            <div className="pt-2">
                <button
                    type="submit"
                    className="w-full bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shadow-sm"
                >
                    Create Asset
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
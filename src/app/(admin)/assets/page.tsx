"use client";
 
import { useEffect, useState } from "react";
import Link from "next/link";
import AssetCard from "@/components/AssetCard";
 
export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
 
  useEffect(() => {
    fetch("/api/assets")
      .then((res) => res.json())
      .then((data) => setAssets(data))
      .catch((err) => console.error("Error fetching assets:", err));
  }, []);
 
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Assets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your hardware and software assets.</p>
        </div>
 
        <Link
          href="/assets/create"
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Asset
        </Link>
      </div>
 
      {/* Asset List */}
      {assets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">No assets found.</p>
            <Link href="/assets/create" className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Create your first asset</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset: any) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
 
    </div>
  );
}

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
    <div className="p-6">
 
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assets</h1>
 
        <Link
          href="/assets/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Create Asset
        </Link>
      </div>
 
      {/* Asset List */}
      {assets.length === 0 ? (
        <p>No assets found</p>
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

"use client";
import AssetCard from "@/components/AssetCard"; 
import { useEffect, useState } from "react";
 
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
      <h1 className="text-2xl font-bold mb-4">Assets</h1>
 
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

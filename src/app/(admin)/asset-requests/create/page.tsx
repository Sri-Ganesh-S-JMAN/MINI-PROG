"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateRequest() {
  const router = useRouter();

  const [assetId, setAssetId] = useState("");
  const [reason, setReason] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/assets")
      .then(res => res.json())
      .then(data => {
        // Filter out retired assets if needed, but for now we'll just show them
        setAssets(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to fetch assets for dropdown", err));
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    if (!assetId || !reason.trim()) {
      setError("Asset and Reason are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/asset-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit request.");
        setLoading(false);
        return;
      }

      router.push("/asset-requests");
    } catch (err) {
      console.error(err);
      setError("A network error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl py-4">
      <div className="mb-6">
        <Link href="/asset-requests" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Requests
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Request Asset</h1>
        <p className="text-sm text-gray-500 mt-1">Submit a request to be allocated a new hardware or software asset.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={submit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 focus-within:text-black transition-colors" htmlFor="assetId">
                Select Asset Required
            </label>
            <div className="relative">
              <select
                id="assetId"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer"
                required
              >
                <option value="">Choose an asset...</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} (SN: {a.serialNo}) - {a.status}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 focus-within:text-black transition-colors" htmlFor="reason">
                Justification / Reason
            </label>
            <textarea
              id="reason"
              placeholder="Please explain why you need this asset..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow shadow-sm min-h-[120px] resize-y"
              required
            />
          </div>

          <div className="pt-2 flex items-center gap-3 border-t border-gray-100 mt-6">
            <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shadow-sm disabled:opacity-50"
            >
                {loading ? "Submitting..." : "Submit Request"}
            </button>
            <Link href="/asset-requests" className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm">
                Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
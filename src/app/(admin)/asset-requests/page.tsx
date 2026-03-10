"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/asset-requests").then((res) => res.json()),
      fetch("/api/auth/me").then((res) => res.ok ? res.json() : null)
    ]).then(([requestsData, authData]) => {
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      if (authData?.user) setCurrentUser(authData.user);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
      case "MANAGER_APPROVED":
      case "ADMIN_APPROVED":
      case "ALLOCATED": return "bg-gray-900 text-white border-transparent";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isStaff = currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Asset Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isStaff ? "Manage employee requests for new hardware and software." : "Track the status of your hardware and software requests."}
          </p>
        </div>
        <Link href="/asset-requests/create" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-4">No asset requests found.</p>
          <Link href="/asset-requests/create" className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Submit a request</Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Asset</th>
                  <th className="px-6 py-3">Requested By</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Date</th>
                  {isStaff && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.asset?.name || `Asset #${r.assetId}`}</td>
                    <td className="px-6 py-4">{r.user?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(r.status)}`}>
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    {isStaff && (
                      <td className="px-6 py-4 text-right">
                        <Link href={`/approvals/${r.id}`} className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-black transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200">
                          Review
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
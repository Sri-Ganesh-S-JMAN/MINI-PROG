"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IdBadge } from "@/components/IdBadge";

export default function ApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requestData, setRequestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const requestId = Number(params?.requestId);

  useEffect(() => {
    if (!requestId) return;

    Promise.all([
      fetch("/api/auth/me").then((res) => res.ok ? res.json() : null),
      fetch(`/api/asset-requests/${requestId}`).then((res) => res.ok ? res.json() : null)
    ]).then(([authData, reqData]) => {
      if (authData?.user) setCurrentUser(authData.user);
      if (reqData) setRequestData(reqData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [requestId]);

  if (!requestId) {
    return (
        <div className="p-12 text-center text-gray-500">
            Invalid request ID
        </div>
    );
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
    );
  }

  if (currentUser?.role === "USER" || currentUser?.role === "EMPLOYEE") {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200 mt-6 max-w-xl mx-auto">
        <svg className="w-8 h-8 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span className="font-semibold block mb-1">Unauthorized</span>
        <span className="text-sm">You do not have permission to view or approve asset requests.</span>
      </div>
    );
  }

  if (!requestData) {
    return (
        <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm max-w-xl mx-auto mt-6">
            <p className="font-medium text-gray-900 mb-2">Request not found.</p>
            <p className="text-sm mb-4">The asset request could not be found or was deleted.</p>
            <button onClick={() => router.push("/asset-requests")} className="text-sm font-medium text-black hover:underline">Return to requests</button>
        </div>
    );
  }

  async function handleAction(status: "APPROVED" | "REJECTED") {
    setSaving(true);
    try {
      await fetch("/api/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
        }),
      });
      router.push("/asset-requests");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the approval.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl py-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <button onClick={() => router.push("/asset-requests")} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 focus:outline-none focus:underline">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
               Back to Requests
           </button>
           <div className="flex items-center gap-3">
             <IdBadge id={requestData.id} />
             <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
               Review Asset Request
             </h1>
           </div>
           <p className="text-sm text-gray-500 mt-1">Approve or reject this request for a new asset allocation.</p>
        </div>
        
        {(requestData.status === "PENDING" || (requestData.status === "MANAGER_APPROVED" && currentUser?.role === "ADMIN")) && (
            <div className="flex gap-2">
                <button 
                  onClick={() => handleAction("REJECTED")} 
                  disabled={saving}
                  className="bg-white border text-red-600 border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-100 disabled:opacity-50 shadow-sm"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction("APPROVED")} 
                  disabled={saving}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 shadow-sm"
                >
                  {requestData.status === "MANAGER_APPROVED" ? "Final Approve" : "Approve"}
                </button>
            </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h2 className="text-base font-semibold text-gray-900">Request Details</h2>
             <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
               requestData.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200"
               : requestData.status === "MANAGER_APPROVED" ? "bg-blue-50 text-blue-700 border-blue-200"
               : requestData.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200"
               : "bg-gray-900 text-white border-transparent"
             }`}>
                {requestData.status.replace(/_/g, " ")}
             </span>
          </div>
          <div className="p-6 divide-y divide-gray-100">
             <div className="grid grid-cols-3 gap-4 pb-4">
                 <div className="col-span-1 text-sm font-medium text-gray-500">Applicant</div>
                 <div className="col-span-2 text-sm text-gray-900 font-medium">{requestData.user?.name} <span className="text-gray-500 font-normal ml-1">({requestData.user?.email})</span></div>
             </div>
             <div className="grid grid-cols-3 gap-4 py-4">
                 <div className="col-span-1 text-sm font-medium text-gray-500">Requested Asset</div>
                 <div className="col-span-2 text-sm text-gray-900 font-medium">
                     {requestData.asset?.name}
                     <div className="text-xs text-gray-500 mt-0.5 font-normal">SN: {requestData.asset?.serialNo}</div>
                 </div>
             </div>
             <div className="grid grid-cols-3 gap-4 py-4">
                 <div className="col-span-1 text-sm font-medium text-gray-500">Submitted</div>
                 <div className="col-span-2 text-sm text-gray-900">{new Date(requestData.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
             </div>
             <div className="grid grid-cols-3 gap-4 pt-4">
                 <div className="col-span-1 text-sm font-medium text-gray-500">Justification</div>
                 <div className="col-span-2 text-sm text-gray-900 leading-relaxed max-w-prose whitespace-pre-wrap">{requestData.reason}</div>
             </div>
          </div>
      </div>
    </div>
  );
}
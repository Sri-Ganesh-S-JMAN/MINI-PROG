"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRequest() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [reason, setReason] = useState("");

  async function submit(e: any) {
    e.preventDefault();

    await fetch("/api/asset-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(userId),
        assetId: Number(assetId),
        reason,
      }),
    });

    router.push("/asset-requests");
  }

  return (
    <form onSubmit={submit}>
      <h1>Create Request</h1>

      <input
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <input
        placeholder="Asset ID"
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
      />

      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
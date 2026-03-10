"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/asset-requests")
      .then((res) => res.json())
      .then(setRequests);
  }, []);

  return (
    <div>
      <h1>Asset Requests</h1>

      <Link href="/asset-requests/create">
        <button>Create Request</button>
      </Link>

      <table border={1}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Asset</th>
            <th>Status</th>
            <th>Approval</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.user?.name}</td>
              <td>{r.asset?.name}</td>
              <td>{r.status}</td>
              <td>
                <Link href={`/approvals/${r.id}`}>
                  <button>View</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
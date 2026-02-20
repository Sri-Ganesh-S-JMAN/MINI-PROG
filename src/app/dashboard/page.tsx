"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  const { tickets, assets, requests, notifications } = data;

  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      {/* Ticket KPIs */}
      <Card title="Total Tickets" value={tickets.totalTickets} />
      <Card title="SLA Breaches" value={tickets.slaBreaches} />

      {/* Asset KPIs */}
      <Card title="Total Assets" value={assets.totalAssets} />
      <Card title="Allocated Assets" value={assets.allocatedAssets} />

      {/* Request KPIs */}
      <Card title="Pending Requests" value={requests.pendingRequests} />

      {/* Notifications */}
      <Card title="Unread Notifications" value={notifications.unreadNotifications} />
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="shadow p-4 rounded bg-white">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-3xl">{value}</p>
    </div>
  );
}

"use client";


export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">MyApp 🚀</h2>

        <ul className="space-y-4">
          <li className="hover:bg-indigo-600 p-2 rounded cursor-pointer">
            Dashboard
          </li>
          <li className="hover:bg-indigo-600 p-2 rounded cursor-pointer">
            Users
          </li>
          <li className="hover:bg-indigo-600 p-2 rounded cursor-pointer">
            Settings
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl mt-2 text-indigo-600">120</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            <p className="text-3xl mt-2 text-green-600">45</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold">Admin Accounts</h3>
            <p className="text-3xl mt-2 text-purple-600">5</p>
          </div>
        </div>
      </div>
    </div>

import { useEffect, useState } from "react";

type DashboardData = {
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    recent: {
      id: number;
      title: string;
      status: string;
      priority: string;
      createdBy: { name: string };
      assignedTo: { name: string } | null;
      createdAt: string;
    }[];
  };
  assets: {
    total: number;
    available: number;
    allocated: number;
    inRepair: number;
    retired: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: {
      id: number;
      status: string;
      reason: string;
      user: { name: string };
      asset: { name: string; serialNo: string };
      createdAt: string;
    }[];
  };
  users: { total: number };
  notifications: { unread: number };
  recentActivity: {
    id: number;
    message: string;
    user: { name: string };
    ticket: { title: string };
    createdAt: string;
  }[];
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#00f5a0",
  IN_PROGRESS: "#fbbf24",
  RESOLVED: "#60a5fa",
  CLOSED: "#6b7280",
  AVAILABLE: "#00f5a0",
  ALLOCATED: "#60a5fa",
  IN_REPAIR: "#fbbf24",
  RETIRED: "#6b7280",
  PENDING: "#fbbf24",
  ADMIN_APPROVED: "#00f5a0",
  ALLOCATED_REQ: "#60a5fa",
  REJECTED: "#f87171",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#6b7280",
  medium: "#fbbf24",
  high: "#f87171",
  critical: "#c084fc",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function RadialStat({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="radial-stat">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a2e" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="36" y="41" textAnchor="middle" fill={color} fontSize="14" fontFamily="'DM Mono', monospace" fontWeight="700">
          {value}
        </text>
      </svg>
      <span className="radial-label">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard");
        setLoading(false);
      });
  }, []);

  // Subtle clock tick for the "live" feel
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-ring" />
        <span>Initializing systems...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="loading-screen">
        <span style={{ color: "#f87171" }}>{error || "Unknown error"}</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080810;
          color: #e2e8f0;
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
        }

        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        /* Header */
        .header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .header-left h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #00f5a0, #00d9f5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .header-left p {
          font-size: 11px;
          color: #4a5568;
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .clock {
          font-size: 22px;
          font-weight: 500;
          color: #00f5a0;
          letter-spacing: 2px;
        }
        .date-str {
          font-size: 10px;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #00f5a0;
          letter-spacing: 1px;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00f5a0;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* KPI Strip */
        .kpi-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }
        .kpi-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px 20px 16px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .kpi-card:hover { border-color: rgba(0,245,160,0.2); }
        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 16px 16px 0 0;
        }
        .kpi-card.green::before { background: linear-gradient(90deg, #00f5a0, transparent); }
        .kpi-card.blue::before { background: linear-gradient(90deg, #60a5fa, transparent); }
        .kpi-card.yellow::before { background: linear-gradient(90deg, #fbbf24, transparent); }
        .kpi-card.purple::before { background: linear-gradient(90deg, #c084fc, transparent); }
        .kpi-card.red::before { background: linear-gradient(90deg, #f87171, transparent); }

        .kpi-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #4a5568;
          margin-bottom: 10px;
        }
        .kpi-value {
          font-family: 'Syne', sans-serif;
          font-size: 36px;
          font-weight: 800;
          line-height: 1;
        }
        .kpi-card.green .kpi-value { color: #00f5a0; }
        .kpi-card.blue .kpi-value { color: #60a5fa; }
        .kpi-card.yellow .kpi-value { color: #fbbf24; }
        .kpi-card.purple .kpi-value { color: #c084fc; }
        .kpi-card.red .kpi-value { color: #f87171; }
        .kpi-sub {
          font-size: 10px;
          color: #374151;
          margin-top: 4px;
        }

        /* Main grid */
        .grid-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .grid-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .grid-main { grid-template-columns: 1fr; }
          .grid-bottom { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .grid-bottom { grid-template-columns: 1fr; }
          .kpi-strip { grid-template-columns: repeat(2, 1fr); }
        }

        /* Panel */
        .panel {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #94a3b8;
        }
        .panel-count {
          font-size: 10px;
          color: #374151;
          background: rgba(255,255,255,0.04);
          padding: 2px 8px;
          border-radius: 20px;
        }

        /* Radial row */
        .radial-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: space-around;
        }
        .radial-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .radial-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #4a5568;
        }

        /* Table rows */
        .data-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .data-row:last-child { border-bottom: none; }
        .data-row-main {
          flex: 1;
          min-width: 0;
        }
        .data-row-title {
          font-size: 12px;
          color: #cbd5e1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .data-row-sub {
          font-size: 10px;
          color: #374151;
          margin-top: 2px;
        }
        .badge {
          font-size: 9px;
          padding: 2px 7px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          border: 1px solid currentColor;
          opacity: 0.8;
        }
        .dot-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .time-stamp {
          font-size: 10px;
          color: #374151;
          white-space: nowrap;
        }

        /* Asset bar chart */
        .bar-chart { display: flex; flex-direction: column; gap: 12px; }
        .bar-row { display: flex; flex-direction: column; gap: 4px; }
        .bar-meta { display: flex; justify-content: space-between; }
        .bar-meta-label { font-size: 10px; color: #4a5568; text-transform: uppercase; letter-spacing: 1px; }
        .bar-meta-val { font-size: 10px; color: #94a3b8; }
        .bar-track { height: 4px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }

        /* Loading */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
          font-size: 13px;
          color: #4a5568;
          letter-spacing: 2px;
        }
        .loader-ring {
          width: 40px; height: 40px;
          border: 2px solid rgba(0,245,160,0.1);
          border-top-color: #00f5a0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="dashboard">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1>CONTROL ROOM</h1>
            <p>IT Asset & Helpdesk Operations</p>
          </div>
          <div className="header-right">
            <div className="clock">{timeStr}</div>
            <div className="date-str">
              {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="live-badge">
              <span className="live-dot" />
              LIVE
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="kpi-strip">
          <div className="kpi-card green">
            <div className="kpi-label">Total Tickets</div>
            <div className="kpi-value">{data.tickets.total}</div>
            <div className="kpi-sub">{data.tickets.open} open · {data.tickets.inProgress} active</div>
          </div>
          <div className="kpi-card blue">
            <div className="kpi-label">Total Assets</div>
            <div className="kpi-value">{data.assets.total}</div>
            <div className="kpi-sub">{data.assets.available} available</div>
          </div>
          <div className="kpi-card yellow">
            <div className="kpi-label">Pending Requests</div>
            <div className="kpi-value">{data.requests.pending}</div>
            <div className="kpi-sub">of {data.requests.total} total</div>
          </div>
          <div className="kpi-card purple">
            <div className="kpi-label">Users</div>
            <div className="kpi-value">{data.users.total}</div>
            <div className="kpi-sub">registered accounts</div>
          </div>
          <div className="kpi-card red">
            <div className="kpi-label">Notifications</div>
            <div className="kpi-value">{data.notifications.unread}</div>
            <div className="kpi-sub">unread alerts</div>
          </div>
        </div>

        {/* Main 2-col grid */}
        <div className="grid-main">
          {/* Ticket breakdown */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Ticket Status</span>
              <span className="panel-count">{data.tickets.total} total</span>
            </div>
            <div className="radial-row">
              <RadialStat label="Open" value={data.tickets.open} total={data.tickets.total} color="#00f5a0" />
              <RadialStat label="Active" value={data.tickets.inProgress} total={data.tickets.total} color="#fbbf24" />
              <RadialStat label="Resolved" value={data.tickets.resolved} total={data.tickets.total} color="#60a5fa" />
              <RadialStat label="Closed" value={data.tickets.closed} total={data.tickets.total} color="#6b7280" />
            </div>
          </div>

          {/* Asset breakdown */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Asset Health</span>
              <span className="panel-count">{data.assets.total} assets</span>
            </div>
            <div className="bar-chart">
              {[
                { label: "Available", val: data.assets.available, color: "#00f5a0" },
                { label: "Allocated", val: data.assets.allocated, color: "#60a5fa" },
                { label: "In Repair", val: data.assets.inRepair, color: "#fbbf24" },
                { label: "Retired", val: data.assets.retired, color: "#6b7280" },
              ].map(({ label, val, color }) => (
                <div className="bar-row" key={label}>
                  <div className="bar-meta">
                    <span className="bar-meta-label">{label}</span>
                    <span className="bar-meta-val">{val}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: data.assets.total > 0 ? `${(val / data.assets.total) * 100}%` : "0%",
                        background: color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom 3-col grid */}
        <div className="grid-bottom">
          {/* Recent Tickets */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Recent Tickets</span>
            </div>
            {data.tickets.recent.length === 0 ? (
              <p style={{ color: "#374151", fontSize: 12 }}>No tickets yet.</p>
            ) : (
              data.tickets.recent.map((t) => (
                <div className="data-row" key={t.id}>
                  <div
                    className="dot-indicator"
                    style={{ background: STATUS_COLORS[t.status] || "#6b7280" }}
                  />
                  <div className="data-row-main">
                    <div className="data-row-title">{t.title}</div>
                    <div className="data-row-sub">
                      {t.createdBy.name}
                      {t.assignedTo ? ` → ${t.assignedTo.name}` : " · unassigned"}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{ color: PRIORITY_COLORS[t.priority?.toLowerCase()] || "#6b7280" }}
                  >
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Recent Requests */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Asset Requests</span>
            </div>
            {data.requests.recent.length === 0 ? (
              <p style={{ color: "#374151", fontSize: 12 }}>No requests yet.</p>
            ) : (
              data.requests.recent.map((r) => (
                <div className="data-row" key={r.id}>
                  <div
                    className="dot-indicator"
                    style={{ background: STATUS_COLORS[r.status] || "#6b7280" }}
                  />
                  <div className="data-row-main">
                    <div className="data-row-title">{r.asset.name}</div>
                    <div className="data-row-sub">{r.user.name} · {r.asset.serialNo}</div>
                  </div>
                  <span className="badge" style={{ color: STATUS_COLORS[r.status] || "#6b7280" }}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Recent Activity */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Activity Feed</span>
            </div>
            {data.recentActivity.length === 0 ? (
              <p style={{ color: "#374151", fontSize: 12 }}>No activity yet.</p>
            ) : (
              data.recentActivity.map((a) => (
                <div className="data-row" key={a.id}>
                  <div className="dot-indicator" style={{ background: "#60a5fa" }} />
                  <div className="data-row-main">
                    <div className="data-row-title">{a.user.name}</div>
                    <div className="data-row-sub">on "{a.ticket.title}"</div>
                  </div>
                  <span className="time-stamp">{timeAgo(a.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>

  );
}
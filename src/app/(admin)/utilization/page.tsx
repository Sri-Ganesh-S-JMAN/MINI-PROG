"use client";

import { useEffect, useState } from "react";

interface UtilizationRow {
  userId: number;
  name: string;
  email: string;
  role: string;
  weekTotals: number[];
}

interface UtilizationData {
  weeks: string[];
  rows: UtilizationRow[];
}

function cellStyle(pct: number): string {
  if (pct === 0) return "text-gray-400";
  if (pct > 100) return "bg-red-100 text-red-700 font-semibold rounded-md";
  if (pct >= 80) return "bg-yellow-50 text-yellow-700 font-semibold rounded-md";
  return "bg-green-50 text-green-700 font-medium rounded-md";
}

export default function UtilizationPage() {
  const [data, setData] = useState<UtilizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/utilization")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load utilization data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading utilization data…</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black">Resource Utilization Forecast</h1>
        <p className="text-sm text-gray-500 mt-1">Weekly allocation summary — this week + next 3 weeks</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-200" />
          <span className="text-gray-600">&lt; 80% — Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-yellow-100 border border-yellow-200" />
          <span className="text-gray-600">80–100% — Near capacity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-200" />
          <span className="text-gray-600">&gt; 100% — Over-allocated</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">Resource</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs whitespace-nowrap">Role</th>
              {data.weeks.map((week, i) => (
                <th key={i} className="px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap min-w-[130px]">
                  {i === 0 ? (
                    <span>
                      <span className="text-black font-semibold text-xs uppercase tracking-wide mr-1">This Week</span>
                      <br />
                      <span className="font-normal text-gray-400 text-xs">{week}</span>
                    </span>
                  ) : (
                    <span>
                      <span className="text-gray-600 text-xs">Week {i + 1}</span>
                      <br />
                      <span className="font-normal text-gray-400 text-xs">{week}</span>
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.map((row) => (
              <tr key={row.userId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-black">{row.name}</div>
                  <div className="text-xs text-gray-400">{row.email}</div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{row.role}</td>
                {row.weekTotals.map((pct, i) => (
                  <td key={i} className="px-4 py-3 text-center">
                    {pct > 0 ? (
                      <span className={`inline-block px-2 py-0.5 text-sm ${cellStyle(pct)}`}>
                        {pct}%
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {data.rows.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No users found.</div>
        )}
      </div>
    </div>
  );
}

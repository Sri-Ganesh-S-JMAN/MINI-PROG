/**
 * My Projects page — shows all projects the logged-in user is allocated to.
 * Accessible to EMPLOYEE and AGENT roles.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-50 border border-green-200 text-green-700",
  ON_HOLD: "bg-yellow-50 border border-yellow-200 text-yellow-700",
  COMPLETED: "bg-gray-100 border border-gray-200 text-gray-500",
};

export default async function MyProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userId = parseInt(user.userId, 10);

  const allocations = await prisma.projectAllocation.findMany({
    where: { userId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          clientName: true,
          status: true,
          startDate: true,
          endDate: true,
          description: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black">My Projects</h1>
        <p className="text-sm text-gray-500 mt-1">Projects you are currently allocated to</p>
      </div>

      {allocations.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl text-sm text-gray-400 shadow-sm">
          You have not been allocated to any projects yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Project ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Project Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">My Allocation</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Period</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Project Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-black">{alloc.project.id}</td>
                  <td className="px-4 py-3 text-gray-700">{alloc.project.clientName}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-black">{alloc.project.name}</div>
                    {alloc.project.description && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{alloc.project.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-black">{alloc.percentage}%</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {format(new Date(alloc.startDate), "MMM d, yyyy")}
                    <span className="text-gray-400 mx-1">→</span>
                    {format(new Date(alloc.endDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[alloc.project.status]}`}>
                      {alloc.project.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

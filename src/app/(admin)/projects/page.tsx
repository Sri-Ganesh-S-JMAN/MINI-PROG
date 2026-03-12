/**
 * Admin Projects List Page
 * GET /projects
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-50 border border-green-200 text-green-700",
  ON_HOLD: "bg-yellow-50 border border-yellow-200 text-yellow-700",
  COMPLETED: "bg-gray-100 border border-gray-200 text-gray-500",
};

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/tickets");

  const projects = await prisma.project.findMany({
    include: { _count: { select: { allocations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-black">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/projects/create"
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* Table */}
      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No projects yet. Create your first one.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Project ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Project Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Resources</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Start Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">End Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-black">{project.id}</td>
                  <td className="px-4 py-3 text-gray-700">{project.clientName}</td>
                  <td className="px-4 py-3 font-medium text-black">{project.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[project.status]}`}>
                      {project.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{project._count.allocations}</td>
                  <td className="px-4 py-3 text-gray-600">{format(new Date(project.startDate), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-gray-600">{format(new Date(project.endDate), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-medium text-black hover:underline"
                    >
                      Manage →
                    </Link>
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

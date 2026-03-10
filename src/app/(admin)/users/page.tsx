import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { IdBadge } from "@/components/IdBadge";

export default async function UsersPage(
  props: { searchParams: Promise<{ search?: string }> }
) {
  const searchParams = await props.searchParams;
  let whereClause = {};

  if (searchParams.search) {
      const searchId = parseInt(searchParams.search, 10);
      if (!isNaN(searchId)) {
          whereClause = { id: searchId };
      }
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-black">Users</h1>
          <p className="text-sm text-gray-500">Manage individuals and their roles in your workspace.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <form className="relative w-full sm:w-64" action="/users" method="GET">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="search"
                    name="search"
                    placeholder="Search by ID..."
                    defaultValue={searchParams.search || ""}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm"
                />
            </form>
            <Link
            href="/users/create"
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex-shrink-0"
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add User</span>
            </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-black">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                     <IdBadge id={u.id} />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-gray-600">
                          {u.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {u.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(u.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

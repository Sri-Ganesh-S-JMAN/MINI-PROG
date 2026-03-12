"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
}

interface Allocation {
  id: number;
  userId: number;
  percentage: number;
  startDate: string;
  endDate: string;
  user: User;
}

interface Project {
  id: string;
  clientName: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED";
  allocations: Allocation[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-50 border border-green-200 text-green-700",
  ON_HOLD: "bg-yellow-50 border border-yellow-200 text-yellow-700",
  COMPLETED: "bg-gray-100 border border-gray-200 text-gray-500",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Add Allocation form state ─────────────────────────────────────────────
  const [addForm, setAddForm] = useState({
    userId: "",
    percentage: "",
    startDate: "",
    endDate: "",
  });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [availability, setAvailability] = useState<{ allocated: number; available: number } | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  // ── Edit Allocation state ─────────────────────────────────────────────────
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ percentage: "", startDate: "", endDate: "" });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editAvailability, setEditAvailability] = useState<{ allocated: number; available: number } | null>(null);

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) { router.push("/projects"); return; }
    const data = await res.json();
    setProject(data.project);
  }, [id, router]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([
        fetchProject(),
        fetch("/api/users").then((r) => r.json()).then((d) => setAllUsers(d.users ?? [])),
      ]);
      setLoading(false);
    }
    init();
  }, [fetchProject]);

  // ─── Availability check (Add form) ───────────────────────────────────────

  const fetchAvailability = useCallback(async (
    userId: string,
    startDate: string,
    endDate: string,
    excludeId?: number
  ) => {
    if (!userId || !startDate || !endDate) { setAvailability(null); return; }
    setAvailLoading(true);
    try {
      const url = `/api/users/${userId}/availability?startDate=${startDate}&endDate=${endDate}${excludeId ? `&excludeAllocationId=${excludeId}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAvailability(data);
      }
    } finally {
      setAvailLoading(false);
    }
  }, []);

  // ─── Add Form Handlers ────────────────────────────────────────────────────

  function handleAddChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const updated = { ...addForm, [e.target.name]: e.target.value };
    setAddForm(updated);
    setAddError("");

    if (e.target.name !== "percentage") {
      fetchAvailability(updated.userId, updated.startDate, updated.endDate);
    }
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    const pct = parseFloat(addForm.percentage);
    if (!addForm.userId || isNaN(pct) || !addForm.startDate || !addForm.endDate) {
      setAddError("All fields are required.");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/allocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, percentage: pct }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error); return; }
      setAddForm({ userId: "", percentage: "", startDate: "", endDate: "" });
      setAvailability(null);
      await fetchProject();
    } catch {
      setAddError("Network error.");
    } finally {
      setAddLoading(false);
    }
  }

  // ─── Edit Handlers ────────────────────────────────────────────────────────

  function startEdit(alloc: Allocation) {
    setEditId(alloc.id);
    setEditForm({
      percentage: String(alloc.percentage),
      startDate: alloc.startDate.split("T")[0],
      endDate: alloc.endDate.split("T")[0],
    });
    setEditError("");
    setEditAvailability(null);
    fetchEditAvailability(alloc.userId, alloc.startDate.split("T")[0], alloc.endDate.split("T")[0], alloc.id);
  }

  async function fetchEditAvailability(userId: number, startDate: string, endDate: string, excludeId: number) {
    if (!startDate || !endDate) return;
    const url = `/api/users/${userId}/availability?startDate=${startDate}&endDate=${endDate}&excludeAllocationId=${excludeId}`;
    const res = await fetch(url);
    if (res.ok) setEditAvailability(await res.json());
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setEditError("");
  }

  async function handleEditSubmit(allocId: number, userId: number) {
    setEditError("");
    const pct = parseFloat(editForm.percentage);
    if (isNaN(pct) || !editForm.startDate || !editForm.endDate) {
      setEditError("All fields are required.");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/allocations/${allocId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentage: pct, startDate: editForm.startDate, endDate: editForm.endDate }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error); return; }
      setEditId(null);
      await fetchProject();
    } catch {
      setEditError("Network error.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(allocId: number) {
    if (!confirm("Remove this allocation?")) return;
    await fetch(`/api/projects/${id}/allocations/${allocId}`, { method: "DELETE" });
    await fetchProject();
  }

  async function handleDeleteProject() {
    if (!confirm(`Delete project ${id}? This will remove all allocations.`)) return;
    setDeleteLoading(true);
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-400">Loading project…</div>
    );
  }

  if (!project) return null;

  const maxForAdd = availability ? availability.available : 100;
  const pctValue = parseFloat(addForm.percentage) || 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back */}
      <Link href="/projects" className="text-sm text-gray-500 hover:text-black transition-colors">
        ← Back to Projects
      </Link>

      {/* Project Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono font-bold text-lg text-black">{project.id}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[project.status]}`}>
                {project.status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-black">{project.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{project.clientName}</p>
            {project.description && (
              <p className="text-sm text-gray-600 mt-2">{project.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {format(new Date(project.startDate), "MMM d, yyyy")} → {format(new Date(project.endDate), "MMM d, yyyy")}
            </p>
          </div>
          <button
            onClick={handleDeleteProject}
            disabled={deleteLoading}
            className="text-sm text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            Delete Project
          </button>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-black">Resource Allocations</h2>
          <span className="text-sm text-gray-400">{project.allocations.length} resource{project.allocations.length !== 1 ? "s" : ""}</span>
        </div>

        {project.allocations.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">No resources allocated yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Allocation %</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Start Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">End Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {project.allocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                  {editId === alloc.id ? (
                    // ── Inline Edit Row ──
                    <>
                      <td className="px-4 py-3 font-medium text-black">{alloc.user.name}</td>
                      <td className="px-4 py-3">
                        <div>
                          <input
                            type="number"
                            name="percentage"
                            value={editForm.percentage}
                            onChange={handleEditChange}
                            min={1}
                            max={editAvailability ? editAvailability.available + parseFloat(editForm.percentage || "0") : 100}
                            className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          {editAvailability && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {editAvailability.allocated}% used · up to{" "}
                              {Math.min(100, editAvailability.available + parseFloat(editForm.percentage || "0"))}% available
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditChange}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditChange}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        {editError && <span className="text-xs text-red-600">{editError}</span>}
                        <button
                          onClick={() => handleEditSubmit(alloc.id, alloc.userId)}
                          disabled={editLoading}
                          className="text-xs font-medium text-white bg-black px-3 py-1 rounded-md hover:bg-gray-800 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // ── View Row ──
                    <>
                      <td className="px-4 py-3">
                        <div className="font-medium text-black">{alloc.user.name}</div>
                        <div className="text-xs text-gray-400">{alloc.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-black">{alloc.percentage}%</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{format(new Date(alloc.startDate), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 text-gray-600">{format(new Date(alloc.endDate), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => startEdit(alloc)}
                          className="text-xs font-medium text-gray-700 border border-gray-200 px-2 py-1 rounded-md hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(alloc.id)}
                          className="text-xs font-medium text-red-600 border border-red-200 px-2 py-1 rounded-md hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Allocation Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-black mb-4">Add Resource</h2>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource <span className="text-red-500">*</span>
              </label>
              <select
                name="userId"
                value={addForm.userId}
                onChange={handleAddChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select a resource…</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            {/* Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation % <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="percentage"
                value={addForm.percentage}
                onChange={handleAddChange}
                disabled={!addForm.userId || !addForm.startDate || !addForm.endDate}
                min={1}
                max={maxForAdd}
                step={1}
                placeholder={
                  !addForm.userId || !addForm.startDate || !addForm.endDate
                    ? "Select resource & dates first"
                    : `1 – ${maxForAdd}%`
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
              {availLoading && <p className="text-xs text-gray-400 mt-0.5">Checking availability…</p>}
              {availability && !availLoading && (
                <p className={`text-xs mt-0.5 ${availability.available === 0 ? "text-red-600 font-medium" : "text-gray-500"}`}>
                  {availability.allocated}% already allocated —{" "}
                  {availability.available === 0
                    ? "no capacity available in this period"
                    : `up to ${availability.available}% available`}
                </p>
              )}
              {pctValue > maxForAdd && availability && (
                <p className="text-xs text-red-600 mt-0.5 font-medium">
                  Exceeds available capacity ({maxForAdd}%)
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={addForm.startDate}
                onChange={handleAddChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={addForm.endDate}
                onChange={handleAddChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {addError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {addError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addLoading || availability?.available === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {addLoading ? "Adding…" : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

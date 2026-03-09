"use client";
/**
 * src/app/(app)/tickets/create/page.tsx
 * Form to create a new support ticket.
 */

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TICKET_CATEGORIES } from "@/lib/constants";
import type { Priority } from "@/types/dashboard";

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const PRIORITY_DESCRIPTIONS: Record<Priority, string> = {
    LOW: "Minor issue, no urgency (72h SLA)",
    MEDIUM: "Normal issue (24h SLA)",
    HIGH: "Significant impact (8h SLA)",
    CRITICAL: "System down or blocking work (4h SLA)",
};

export default function CreateTicketPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "MEDIUM" as Priority,
        category: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (!form.title.trim() || !form.description.trim() || !form.category) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Failed to create ticket.");
                return;
            }

            router.push(`/tickets/${data.ticket.id}`);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl">
            <div className="page-header">
                <div>
                    <h1 className="page-title">New Ticket</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Describe your issue and we'll get it resolved</p>
                </div>
                <Link href="/tickets" className="btn-secondary">Cancel</Link>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div>
                    <label className="label" htmlFor="title">Issue title <span className="text-red-500">*</span></label>
                    <input
                        id="title" name="title" type="text" className="input"
                        placeholder="e.g. Cannot access shared network drive"
                        value={form.title} onChange={handleChange} required
                    />
                </div>

                <div>
                    <label className="label" htmlFor="category">Category <span className="text-red-500">*</span></label>
                    <select id="category" name="category" className="input"
                        value={form.category} onChange={handleChange} required>
                        <option value="">Select a category…</option>
                        {TICKET_CATEGORIES.map((c: string) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label">Priority <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                        {PRIORITIES.map((p: Priority) => (
                            <label
                                key={p}
                                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${form.priority === p
                                    ? "border-brand-500 bg-brand-50"
                                    : "border-slate-200 hover:border-slate-300"
                                    }`}
                            >
                                <input
                                    type="radio" name="priority" value={p}
                                    checked={form.priority === p}
                                    onChange={handleChange}
                                    className="mt-0.5 accent-brand-600"
                                />
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{p}</p>
                                    <p className="text-xs text-slate-500">{PRIORITY_DESCRIPTIONS[p]}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label" htmlFor="description">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description" name="description" rows={5} className="input resize-none"
                        placeholder="Please describe the issue in detail. Include any error messages, steps to reproduce, and when it started."
                        value={form.description} onChange={handleChange} required
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Submitting…" : "Submit Ticket"}
                    </button>
                    <Link href="/tickets" className="btn-secondary">Cancel</Link>
                </div>
            </form>
        </div>
    );
}


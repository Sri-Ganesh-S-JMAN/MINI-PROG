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
    low: "Minor issue, no urgency (72h SLA)",
    MEDIUM: "Normal issue (24h SLA)",
    medium: "Normal issue (24h SLA)",
    HIGH: "Significant impact (8h SLA)",
    high: "Significant impact (8h SLA)",
    CRITICAL: "System down or blocking work (4h SLA)",
    critical: "System down or blocking work (4h SLA)",
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
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">New Ticket</h1>
                    <p className="text-sm text-gray-500 mt-1">Describe your issue and we'll get it resolved</p>
                </div>
                <Link href="/tickets" className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm">Cancel</Link>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="title">Issue title <span className="text-red-500">*</span></label>
                    <input
                        id="title" name="title" type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm"
                        placeholder="e.g. Cannot access shared network drive"
                        value={form.title} onChange={handleChange} required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="category">Category <span className="text-red-500">*</span></label>
                    <select id="category" name="category" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm"
                        value={form.category} onChange={handleChange} required>
                        <option value="">Select a category…</option>
                        {TICKET_CATEGORIES.map((c: string) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PRIORITIES.map((p: Priority) => (
                            <label
                                key={p}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.priority === p
                                    ? "border-black bg-gray-50/50"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <input
                                    type="radio" name="priority" value={p}
                                    checked={form.priority === p}
                                    onChange={handleChange}
                                    className="mt-0.5 accent-black w-4 h-4 border-gray-300 focus:ring-black"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 leading-none mb-1.5">{p}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{PRIORITY_DESCRIPTIONS[p]}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description" name="description" rows={5} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm resize-y"
                        placeholder="Please describe the issue in detail. Include any error messages, steps to reproduce, and when it started."
                        value={form.description} onChange={handleChange} required
                    />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-6">
                    <button type="submit" 
                        className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 shadow-sm" 
                        disabled={loading}>
                        {loading ? "Submitting…" : "Submit Ticket"}
                    </button>
                    <Link href="/tickets" className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm">Cancel</Link>
                </div>
            </form>
        </div>
    );
}


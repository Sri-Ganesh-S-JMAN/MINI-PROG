"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteTicketButton({ ticketId, redirectAfter = false }: { ticketId: number, redirectAfter?: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                if (redirectAfter) {
                    router.push("/tickets");
                    router.refresh();
                } else {
                    router.refresh();
                }
            } else {
                alert("Failed to delete ticket.");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting ticket.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete Ticket"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function IdBadge({ id }: { id: string | number }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(id.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <span 
            className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-500 bg-gray-100 border border-gray-200 pl-2 pr-1 py-0.5 rounded group/badge hover:border-gray-300 transition-colors cursor-pointer"
            onClick={handleCopy}
            title="Copy ID to clipboard"
        >
            #{id}
            <button
                className={`p-1 rounded transition-colors ${copied ? 'text-green-600 bg-green-50' : 'text-gray-400 group-hover/badge:text-gray-700 hover:bg-gray-200'}`}
                aria-label="Copy ID"
            >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
        </span>
    );
}

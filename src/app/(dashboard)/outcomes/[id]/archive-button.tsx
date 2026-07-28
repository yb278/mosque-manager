"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArchiveButton({ outcomeId, archived }: { outcomeId: string; archived: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/outcomes/${outcomeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !archived }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors disabled:opacity-50 ${
        archived
          ? "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50"
          : "bg-white text-amber-600 border-amber-300 hover:bg-amber-50"
      }`}
    >
      {loading ? "..." : archived ? "Unarchive" : "Archive"}
    </button>
  );
}

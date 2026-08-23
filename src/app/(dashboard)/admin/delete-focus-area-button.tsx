"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteFocusAreaButton({
  id,
  name,
  outcomeCount,
}: {
  id: string;
  name: string;
  outcomeCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const message =
      outcomeCount > 0
        ? `Delete focus area "${name}"? This will permanently delete ${outcomeCount} outcome${
            outcomeCount === 1 ? "" : "s"
          } under it, including milestones and progress history.`
        : `Delete focus area "${name}"?`;
    if (!confirm(message)) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/focus-areas/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error deleting focus area");
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-600 hover:underline disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

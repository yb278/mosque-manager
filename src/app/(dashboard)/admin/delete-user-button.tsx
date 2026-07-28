"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteUserButton({ userId, userName }: { userId: number; userName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete user "${userName}"? This cannot be undone. Their outcomes will be unassigned.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-2 py-1 rounded font-medium border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}

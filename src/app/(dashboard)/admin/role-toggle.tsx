"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoleToggle({
  userId,
  currentRole,
}: {
  userId: number;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const newRole = currentRole === "admin" ? "editor" : "admin";

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded font-medium border disabled:opacity-50 ${
        currentRole === "admin"
          ? "text-blue-700 border-blue-300 hover:bg-blue-50"
          : "text-purple-700 border-purple-300 hover:bg-purple-50"
      }`}
    >
      {loading ? "..." : `Make ${newRole}`}
    </button>
  );
}

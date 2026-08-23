"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ToggleActiveButton({
  userId,
  userName,
  isActive,
}: {
  userId: number;
  userName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleToggle() {
    const message = isActive
      ? `Deactivate "${userName}"? They will no longer be able to sign in. Their history is preserved.`
      : `Activate "${userName}"? They will be able to sign in again.`;
    if (!confirm(message)) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error updating user");
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`text-xs px-2 py-1 rounded font-medium border disabled:opacity-50 ${
          isActive
            ? "border-red-300 text-red-700 hover:bg-red-50"
            : "border-green-300 text-green-700 hover:bg-green-50"
        }`}
      >
        {loading ? "..." : isActive ? "Deactivate" : "Activate"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

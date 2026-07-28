"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordButton({ userId, userName }: { userId: number; userName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    if (!confirm(`Send a new password to "${userName}"? They will need to change it on next login.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
    if (res.ok) {
      setDone(true);
      router.refresh();
    }
    setLoading(false);
  }

  if (done) {
    return <span className="text-xs text-primary">Emailed!</span>;
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="text-xs px-2 py-1 rounded font-medium border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
    >
      {loading ? "..." : "Reset Password"}
    </button>
  );
}

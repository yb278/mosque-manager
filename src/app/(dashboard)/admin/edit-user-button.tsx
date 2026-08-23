"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditUserButton({
  userId,
  userName,
  userEmail,
}: {
  userId: number;
  userName: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState(userEmail);
  const [name, setName] = useState(userName);

  async function handleSave() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        name: name.trim() || undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.message?.includes("emailed")) {
        setDone(true);
      } else {
        setOpen(false);
      }
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error updating");
    }
    setLoading(false);
  }

  if (done) {
    return <span className="text-xs text-primary">Emailed!</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 rounded font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-56">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="text-xs px-2 py-1 border border-zinc-300 rounded"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="text-xs px-2 py-1 border border-zinc-300 rounded"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-1">
        <button onClick={handleSave} disabled={loading} className="text-xs px-2 py-1 rounded font-medium bg-primary text-white hover:bg-primary-dark disabled:opacity-50">
          {loading ? "..." : "Save"}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 rounded font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

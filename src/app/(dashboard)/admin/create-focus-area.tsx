"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateFocusArea({
  users,
}: {
  users: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sltLead, setSltLead] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !sltLead) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/focus-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), sltLead }),
      });
      if (res.ok) {
        setName("");
        setSltLead("");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error creating focus area");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap mb-4 pb-4 border-b border-zinc-100">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Youth Engagement"
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">SLT Lead</label>
        <select
          value={sltLead}
          onChange={(e) => setSltLead(e.target.value)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Select a lead</option>
          {sortedUsers.map((u) => (
            <option key={u.id} value={u.name}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
      >
        {saving ? "Creating..." : "Add Focus Area"}
      </button>
      {error && <p className="text-sm text-red-600 w-full">{error}</p>}
    </form>
  );
}

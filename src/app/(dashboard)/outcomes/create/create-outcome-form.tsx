"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function CreateOutcomeForm({
  focusAreas,
  users,
}: {
  focusAreas: { id: string; name: string }[];
  users: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  function toggleUser(id: number) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/outcomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        focusAreaId: form.get("focusAreaId"),
        title: form.get("title"),
        department: form.get("department"),
        userIds: selectedUserIds,
        riskLevel: form.get("riskLevel"),
        targetDate: form.get("targetDate"),
        benefit: form.get("benefit"),
        startingPoint: form.get("startingPoint"),
        desiredOutcome: form.get("desiredOutcome"),
        actions: form.get("actions"),
        notes: form.get("notes"),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/outcomes/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error || "Error creating outcome");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Focus Area *</label>
        <select name="focusAreaId" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Select...</option>
          {focusAreas.map(fa => <option key={fa.id} value={fa.id}>{fa.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Title *</label>
        <input name="title" type="text" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Department</label>
          <input name="department" type="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Owner(s)</label>
          <div className="border border-zinc-300 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
            {users.map((u) => (
              <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-50 px-1 py-0.5 rounded">
                <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} className="rounded border-zinc-300 text-primary focus:ring-primary" />
                {u.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Risk Level</label>
          <input name="riskLevel" type="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. High, Medium, Low" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Target Date</label>
          <input name="targetDate" type="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Q1 2026" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Benefit</label>
        <textarea name="benefit" rows={2} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Starting Point</label>
        <textarea name="startingPoint" rows={2} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Desired Outcome</label>
        <textarea name="desiredOutcome" rows={2} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Actions</label>
        <textarea name="actions" rows={3} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Notes</label>
        <textarea name="notes" rows={3} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">
          {loading ? "Creating..." : "Create Outcome"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
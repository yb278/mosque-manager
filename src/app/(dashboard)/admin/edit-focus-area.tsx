"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditFocusArea({
  focusArea,
}: {
  focusArea: { id: string; name: string; sltLead: string };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(focusArea.name);
  const [sltLead, setSltLead] = useState(focusArea.sltLead);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name === focusArea.name && sltLead === focusArea.sltLead) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/focus-areas/${focusArea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sltLead }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-100 last:border-0">
        <div className="min-w-0">
          <p className="text-sm font-medium">{focusArea.name}</p>
          <p className="text-xs text-zinc-400">Lead: {focusArea.sltLead}</p>
        </div>
        <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline shrink-0">
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-3 border-b border-zinc-100 last:border-0">
      <div className="flex flex-col gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-1.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <input
          value={sltLead}
          onChange={(e) => setSltLead(e.target.value)}
          className="px-3 py-1.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="SLT Lead"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => { setName(focusArea.name); setSltLead(focusArea.sltLead); setEditing(false); }} className="text-xs px-3 py-1.5 bg-zinc-100 rounded-lg hover:bg-zinc-200">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

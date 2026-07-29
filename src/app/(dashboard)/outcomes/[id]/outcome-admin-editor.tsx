"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toInputDate } from "@/lib/dates";

type Milestone = { description: string; targetDate: string };
type User = { id: number; name: string; email: string };

export default function OutcomeAdminEditor({
  outcome,
  users,
}: {
  outcome: {
    id: string;
    title: string;
    benefit: string | null;
    startingPoint: string | null;
    desiredOutcome: string | null;
    department: string | null;
    riskLevel: string | null;
    riskIfNot: string | null;
    targetDate: string | null;
    actions: string | null;
    userIds: number[];
    milestones: { description: string; targetDate: string | null }[];
  };
  users: User[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(outcome.userIds);
  const [milestones, setMilestones] = useState<Milestone[]>(
    outcome.milestones.map((m) => ({ description: m.description, targetDate: m.targetDate || "" }))
  );

  function toggleUser(id: number) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  }

  function addMilestone() {
    setMilestones([...milestones, { description: "", targetDate: "" }]);
  }

  function removeMilestone(index: number) {
    setMilestones(milestones.filter((_, i) => i !== index));
  }

  function updateMilestone(index: number, field: keyof Milestone, value: string) {
    const next = [...milestones];
    next[index] = { ...next[index], [field]: value };
    setMilestones(next);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      title: form.get("title"),
      benefit: form.get("benefit"),
      startingPoint: form.get("startingPoint"),
      desiredOutcome: form.get("desiredOutcome"),
      department: form.get("department"),
      riskLevel: form.get("riskLevel"),
      riskIfNot: form.get("riskIfNot"),
      targetDate: form.get("targetDate"),
      actions: form.get("actions"),
      userIds: selectedUserIds,
      milestones: milestones.filter((m) => m.description.trim()),
    };

    const res = await fetch(`/api/outcomes/${outcome.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push(`/outcomes/${outcome.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error saving");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">Basic Info</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
            <input name="title" defaultValue={outcome.title} required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Benefit</label>
            <input name="benefit" defaultValue={outcome.benefit || ""} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Department</label>
              <input name="department" defaultValue={outcome.department || ""} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Risk Level</label>
              <input name="riskLevel" defaultValue={outcome.riskLevel || ""} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Risk if Not Achieved</label>
            <textarea name="riskIfNot" defaultValue={outcome.riskIfNot || ""} rows={3} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Target Date</label>
              <input name="targetDate" type="date" defaultValue={toInputDate(outcome.targetDate)} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">Starting Point & Desired Outcome</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Starting Point</label>
            <textarea name="startingPoint" defaultValue={outcome.startingPoint || ""} rows={3} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Desired Outcome</label>
            <textarea name="desiredOutcome" defaultValue={outcome.desiredOutcome || ""} rows={3} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">Actions</h2>
        <textarea name="actions" defaultValue={outcome.actions || ""} rows={4} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Milestones</h2>
          <button type="button" onClick={addMilestone} className="text-xs bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors">
            + Add Milestone
          </button>
        </div>
        {milestones.length === 0 ? (
          <p className="text-sm text-zinc-400">No milestones yet.</p>
        ) : (
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <input
                  value={m.description}
                  onChange={(e) => updateMilestone(i, "description", e.target.value)}
                  placeholder="Milestone description"
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={m.targetDate}
                  onChange={(e) => updateMilestone(i, "targetDate", e.target.value)}
                  placeholder="Date"
                  className="w-32 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="button" onClick={() => removeMilestone(i)} className="text-red-500 hover:text-red-700 text-sm px-2 py-2">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push(`/outcomes/${outcome.id}`)} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-300 hover:bg-zinc-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
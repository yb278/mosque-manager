"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Status = "not_started" | "in_progress" | "complete" | "delayed";
type Milestone = { description: string; targetDate: string };

export default function OutcomeEditor({
  outcomeId,
  currentStatus,
  currentPct,
  currentNotes,
  currentReason,
  currentMilestones,
}: {
  outcomeId: string;
  currentStatus: Status;
  currentPct: number;
  currentNotes: string;
  currentReason: string;
  currentMilestones: { description: string; targetDate: string | null }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>(
    currentMilestones.map((m) => ({ description: m.description, targetDate: m.targetDate || "" }))
  );

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
    setMessage("");

    const form = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      status: form.get("status"),
      completePct: Number(form.get("completePct")) / 100,
      notes: form.get("notes"),
      reasonForDelay: form.get("reasonForDelay"),
      milestones: milestones.filter((m) => m.description.trim()),
    };

    const res = await fetch(`/api/outcomes/${outcomeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setMessage("Saved!");
      router.refresh();
    } else {
      setMessage("Error saving");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Status
          </label>
          <select
            name="status"
            defaultValue={currentStatus}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="complete">Complete</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Complete %
          </label>
          <input
            type="number"
            name="completePct"
            min={0}
            max={100}
            defaultValue={Math.ceil(currentPct * 100)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Reason for Delay
        </label>
        <input
          type="text"
          name="reasonForDelay"
          defaultValue={currentReason}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          rows={4}
          defaultValue={currentNotes}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-zinc-700">Milestones</label>
          <button type="button" onClick={addMilestone} className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded hover:bg-zinc-200 transition-colors">
            + Add
          </button>
        </div>
        {milestones.length === 0 ? (
          <p className="text-sm text-zinc-400">No milestones yet.</p>
        ) : (
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  value={m.description}
                  onChange={(e) => updateMilestone(i, "description", e.target.value)}
                  placeholder="Description"
                  className="flex-1 px-2 py-1.5 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={m.targetDate}
                  onChange={(e) => updateMilestone(i, "targetDate", e.target.value)}
                  className="w-40 px-2 py-1.5 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="button" onClick={() => removeMilestone(i)} className="text-red-500 hover:text-red-700 text-sm px-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message && (
          <span className="text-sm text-zinc-500">{message}</span>
        )}
      </div>
    </form>
  );
}
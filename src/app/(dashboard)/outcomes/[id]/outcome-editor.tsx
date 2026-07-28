"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Status = "not_started" | "in_progress" | "complete" | "delayed";

export default function OutcomeEditor({
  outcomeId,
  currentStatus,
  currentPct,
  currentNotes,
  currentReason,
}: {
  outcomeId: string;
  currentStatus: Status;
  currentPct: number;
  currentNotes: string;
  currentReason: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/outcomes/${outcomeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        completePct: Number(form.get("completePct")) / 100,
        notes: form.get("notes"),
        reasonForDelay: form.get("reasonForDelay"),
      }),
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
            defaultValue={Math.round(currentPct * 100)}
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

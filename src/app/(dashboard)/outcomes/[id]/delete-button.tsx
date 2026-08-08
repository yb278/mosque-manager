"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OUTCOMES_VIEW_KEY } from "../view-tracker";

export default function DeleteButton({ outcomeId }: { outcomeId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/outcomes/${outcomeId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const saved = sessionStorage.getItem(OUTCOMES_VIEW_KEY);
      router.push(saved || "/outcomes");
      router.refresh();
    } else {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 border border-red-200"
    >
      Delete
    </button>
  );
}

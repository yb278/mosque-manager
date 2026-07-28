"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function CreateUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        role: form.get("role") || "editor",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult({
        success: true,
        message: `User "${data.name}" created. They will receive an email with login instructions.`,
      });
      router.refresh();
    } else {
      const err = await res.json();
      setResult({ success: false, message: err.error || "Error creating user" });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Name</label>
        <input
          name="name"
          type="text"
          required
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Full name"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Role</label>
        <select
          name="role"
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create User"}
      </button>
      {result && (
        <div className={`text-sm w-full ${result.success ? "text-primary" : "text-red-600"}`}>
          {result.message}
        </div>
      )}
    </form>
  );
}

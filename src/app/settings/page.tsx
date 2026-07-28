"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isForced = session?.user?.mustChangePassword ?? false;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const form = new FormData(e.currentTarget);
    const newPassword = form.get("newPassword") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setResult({ success: false, message: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setResult({ success: false, message: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword,
      }),
    });

    if (res.ok) {
      setResult({ success: true, message: "Password changed successfully" });
      (e.target as HTMLFormElement).reset();
      if (isForced) {
        await signIn("credentials", {
          email: session?.user?.email,
          password: newPassword,
          redirect: false,
        });
        router.refresh();
        router.push("/dashboard");
      }
    } else {
      const err = await res.json();
      setResult({ success: false, message: err.error || "Error changing password" });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md">
      <Link href="/overview" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </Link>
      {isForced && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-amber-800 font-medium">
            You must change your password before continuing.
          </p>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">{isForced ? "Set Your Password" : "Settings"}</h1>
        <p className="text-sm text-zinc-500 mt-1">Change your password</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              name="currentPassword"
              type={showCurrent ? "text" : "password"}
              required
              className="w-full px-3 py-2 pr-10 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              {showCurrent ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              name="newPassword"
              type={showNew ? "text" : "password"}
              required
              minLength={6}
              className="w-full px-3 py-2 pr-10 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              {showNew ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              minLength={6}
              className="w-full px-3 py-2 pr-10 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>

        {result && (
          <p className={`text-sm ${result.success ? "text-primary" : "text-red-600"}`}>
            {result.message}
          </p>
        )}
      </form>
    </div>
  );
}

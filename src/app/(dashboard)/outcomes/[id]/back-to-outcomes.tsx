"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { OUTCOMES_VIEW_KEY } from "../view-tracker";

function getSnapshot() {
  if (typeof window === "undefined") return "/outcomes";
  return sessionStorage.getItem(OUTCOMES_VIEW_KEY) || "/outcomes";
}

function subscribe() {
  return () => {};
}

export default function BackToOutcomes() {
  const href = useSyncExternalStore(subscribe, getSnapshot, () => "/outcomes");

  return (
    <Link href={href} className="text-sm text-zinc-500 hover:text-primary">
      &larr; Back to outcomes
    </Link>
  );
}

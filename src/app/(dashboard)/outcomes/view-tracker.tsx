"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const OUTCOMES_VIEW_KEY = "aec:outcomesView";

export default function OutcomesViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === "/outcomes") {
      const qs = searchParams.toString();
      sessionStorage.setItem(OUTCOMES_VIEW_KEY, qs ? `${pathname}?${qs}` : pathname);
    }
  }, [pathname, searchParams]);

  return null;
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  complete: "bg-green-100 text-green-700",
  in_progress: "bg-amber-100 text-amber-700",
  delayed: "bg-red-100 text-red-700",
  not_started: "bg-zinc-100 text-zinc-500",
};

function pctVal(n: number): number {
  return Math.round(n * 100);
}
function pctColor(v: number): string {
  return v >= 70 ? "#16a34a" : v >= 30 ? "#ca8a04" : "#dc2626";
}

export default async function OutcomesPage({
  searchParams,
}: {
  searchParams: Promise<{ focusArea?: string; status?: string; my?: string; archived?: string; sortPct?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const focusAreas = await prisma.focusArea.findMany();

  const showArchived = params.archived === "true";
  const where: Record<string, unknown> = { archived: showArchived };
  if (params.focusArea) where.focusAreaId = params.focusArea;
  if (params.status) where.status = params.status;
  if (params.my === "true" && session?.user) {
    where.assignments = { some: { userId: Number(session.user.id) } };
  }

  const sortPct = params.sortPct as "asc" | "desc" | undefined;
  const orderBy = sortPct
    ? { completePct: sortPct }
    : { id: "asc" as const };

  const outcomes = await prisma.outcome.findMany({
    where,
    include: { focusArea: true, assignments: { include: { user: true } } },
    orderBy,
  });

  const isMyTasks = params.my === "true";

  function pctSortHref(next: "asc" | "desc") {
    const sp = new URLSearchParams();
    if (params.focusArea) sp.set("focusArea", params.focusArea);
    if (params.status) sp.set("status", params.status);
    if (params.my === "true") sp.set("my", "true");
    if (params.archived === "true") sp.set("archived", "true");
    sp.set("sortPct", next);
    const qs = sp.toString();
    return `/outcomes?${qs}`;
  }

  const nextSort = sortPct === "asc" ? "desc" : "asc";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isMyTasks ? "My Tasks" : "All Outcomes"}</h1>
        <div className="flex items-center gap-3">
          {session?.user?.role === "admin" && (
            <Link href="/outcomes/create" className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors">
              + New Outcome
            </Link>
          )}
          <p className="text-sm text-zinc-500">{outcomes.length} outcomes</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {session?.user && (
          <Link
            href={`/outcomes${isMyTasks ? "" : "?my=true"}${showArchived ? `${isMyTasks ? "?" : "&"}archived=true` : ""}`}
            className={`text-xs px-4 py-1.5 rounded-lg border-2 font-semibold transition-all ${
              isMyTasks
                ? "bg-amber-500 text-white border-amber-500 shadow-md scale-105"
                : "bg-white text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400"
            }`}
          >
            {isMyTasks ? "★ My Tasks" : "☆ My Tasks"}
          </Link>
        )}
        <Link
          href={`/outcomes${isMyTasks ? "?my=true" : ""}${showArchived ? `${isMyTasks ? "&" : "?"}archived=true` : ""}`}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !params.focusArea && !params.status
              ? "bg-primary text-white border-primary"
              : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          All
        </Link>
        {focusAreas.map((fa) => (
          <Link
            key={fa.id}
            href={`/outcomes${isMyTasks ? "?my=true" : "?"}${showArchived ? `${isMyTasks ? "&" : ""}archived=true&` : ""}focusArea=${fa.id}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              params.focusArea === fa.id
                ? "bg-primary text-white border-primary"
                : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {fa.name}
          </Link>
        ))}
        {["not_started", "in_progress", "complete", "delayed"].map((s) => (
          <Link
            key={s}
            href={`/outcomes${isMyTasks ? "?my=true&" : "?"}status=${s}${showArchived ? "&archived=true" : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              params.status === s
                ? "bg-primary text-white border-primary"
                : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
        {session?.user?.role === "admin" && (
          <Link
            href={showArchived ? "/outcomes" : "/outcomes?archived=true"}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              showArchived
                ? "bg-zinc-700 text-white border-zinc-700"
                : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            Archived
          </Link>
        )}
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left py-3 px-4 font-medium text-zinc-500">ID</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Outcome</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Focus Area</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Owner</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                <Link href={pctSortHref(nextSort)} className="inline-flex items-center gap-1 hover:text-zinc-800">
                  %
                  {sortPct === "desc" && <span className="text-xs">▼</span>}
                  {sortPct === "asc" && <span className="text-xs">▲</span>}
                  {!sortPct && <span className="text-xs text-zinc-300">▼</span>}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => (
              <tr key={o.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                <td className="py-3 px-4 text-zinc-400 font-mono text-xs">{o.id}</td>
                <td className="py-3 px-4">
                  <Link href={`/outcomes/${o.id}`} className="font-medium text-primary hover:text-primary">{o.title}</Link>
                </td>
                <td className="py-3 px-4 text-zinc-500 text-xs">{o.focusArea.name}</td>
                <td className="py-3 px-4 text-zinc-600 text-xs">{o.assignments.map((a) => a.user.name).join(", ") || "-"}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status.replace("_", " ")}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-zinc-200 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pctVal(o.completePct)}%`, backgroundColor: pctColor(pctVal(o.completePct)) }} />
                    </div>
                    <span className="text-xs" style={{ color: pctColor(pctVal(o.completePct)) }}>{pctVal(o.completePct)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden space-y-3">
        {outcomes.map((o) => (
          <Link key={o.id} href={`/outcomes/${o.id}`} className="block bg-white rounded-xl shadow-sm border border-zinc-200 p-4 hover:border-primary transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-zinc-900 truncate">{o.title}</p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{o.id}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 ${STATUS_COLORS[o.status]}`}>{o.status.replace("_", " ")}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
              <span>{o.focusArea.name}</span>
              <span>{o.assignments.map((a) => a.user.name).join(", ") || "Unassigned"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-200 rounded-full h-2">
                <div className="h-2 rounded-full" style={{ width: `${pctVal(o.completePct)}%`, backgroundColor: pctColor(pctVal(o.completePct)) }} />
              </div>
              <span className="text-xs font-medium" style={{ color: pctColor(pctVal(o.completePct)) }}>{pctVal(o.completePct)}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
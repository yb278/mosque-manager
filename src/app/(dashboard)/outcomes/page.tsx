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
  const pct = Math.min(v, 100);
  const hue = pct <= 70 ? (pct / 70) * 60 : 60 + ((pct - 70) / 30) * 60;
  return `hsl(${hue}, 75%, 40%)`;
}

export default async function OutcomesPage({
  searchParams,
}: {
  searchParams: Promise<{ focusArea?: string; status?: string; my?: string; archived?: string; sortBy?: string; sortDir?: string }>;
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

  const isMyTasks = params.my === "true";

  const sortBy = params.sortBy;
  const sortDir = (params.sortDir || "asc") as "asc" | "desc";

  function dbOrderBy(): Record<string, "asc" | "desc"> {
    if (sortBy === "pct") return { completePct: sortDir };
    if (sortBy === "status") return { status: sortDir };
    if (sortBy === "owner") return { id: "asc" as const };
    return { id: sortBy === "id" ? sortDir : "asc" };
  }

  let outcomes = await prisma.outcome.findMany({
    where,
    include: { focusArea: true, assignments: { include: { user: true } } },
    orderBy: dbOrderBy(),
  });

  if (sortBy === "owner") {
    const ownerName = (o: typeof outcomes[number]) =>
      o.assignments.map((a) => a.user.name).join(", ") || "";
    outcomes.sort((a, b) => {
      const cmp = ownerName(a).localeCompare(ownerName(b));
      return sortDir === "desc" ? -cmp : cmp;
    });
  }

  function sortHref(column: string) {
    const sp = new URLSearchParams();
    if (params.focusArea) sp.set("focusArea", params.focusArea);
    if (params.status) sp.set("status", params.status);
    if (params.my === "true") sp.set("my", "true");
    if (params.archived === "true") sp.set("archived", "true");
    const nextDir = sortBy === column && sortDir === "asc" ? "desc" : "asc";
    sp.set("sortBy", column);
    sp.set("sortDir", nextDir);
    return `/outcomes?${sp.toString()}`;
  }

  function sortIcon(column: string) {
    if (sortBy === column) {
      return <span className="text-xs">{sortDir === "desc" ? "▼" : "▲"}</span>;
    }
    return <span className="text-xs text-zinc-300">▼</span>;
  }

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
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                <Link href={sortHref("id")} className="inline-flex items-center gap-1 hover:text-zinc-800">ID {sortIcon("id")}</Link>
              </th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Outcome</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">Focus Area</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                <Link href={sortHref("owner")} className="inline-flex items-center gap-1 hover:text-zinc-800">Owner {sortIcon("owner")}</Link>
              </th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                <Link href={sortHref("status")} className="inline-flex items-center gap-1 hover:text-zinc-800">Status {sortIcon("status")}</Link>
              </th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                <Link href={sortHref("pct")} className="inline-flex items-center gap-1 hover:text-zinc-800">% {sortIcon("pct")}</Link>
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
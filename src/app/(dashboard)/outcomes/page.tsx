import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function OutcomesPage({
  searchParams,
}: {
  searchParams: Promise<{ focusArea?: string; status?: string; my?: string; archived?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const focusAreas = await prisma.focusArea.findMany();

  const showArchived = params.archived === "true";
  const where: Record<string, unknown> = { archived: showArchived };
  if (params.focusArea) where.focusAreaId = params.focusArea;
  if (params.status) where.status = params.status;
  if (params.my === "true" && session?.user) {
    where.responsibleUserId = Number(session.user.id);
  }

  const outcomes = await prisma.outcome.findMany({
    where,
    include: { focusArea: true, responsibleUser: true },
    orderBy: { id: "asc" },
  });

  const isMyTasks = params.my === "true";

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

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                ID
              </th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                Outcome
              </th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                Focus Area
              </th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                Owner
              </th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-zinc-500">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => (
              <tr
                key={o.id}
                className="border-b border-zinc-100 hover:bg-zinc-50"
              >
                <td className="py-3 px-4 text-zinc-400 font-mono text-xs">
                  {o.id}
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/outcomes/${o.id}`}
                    className="font-medium text-primary hover:text-primary"
                  >
                    {o.title}
                  </Link>
                </td>
                <td className="py-3 px-4 text-zinc-500 text-xs">
                  {o.focusArea.name}
                </td>
                <td className="py-3 px-4 text-zinc-600 text-xs">
                  {o.responsibleUser?.name || "-"}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      o.status === "complete"
                        ? "bg-green-100 text-green-700"
                        : o.status === "in_progress"
                          ? "bg-amber-100 text-amber-700"
                          : o.status === "delayed"
                            ? "bg-red-100 text-red-700"
                            : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {o.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-zinc-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${Math.round(o.completePct * 100)}%`, backgroundColor: Math.round(o.completePct * 100) >= 70 ? "#16a34a" : Math.round(o.completePct * 100) >= 30 ? "#ca8a04" : "#dc2626" }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: Math.round(o.completePct * 100) >= 70 ? "#16a34a" : Math.round(o.completePct * 100) >= 30 ? "#ca8a04" : "#dc2626" }}>
                      {Math.round(o.completePct * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

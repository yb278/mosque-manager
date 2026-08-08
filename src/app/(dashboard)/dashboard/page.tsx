import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StackedAreaChart, DepartmentPie, LeadBarChart } from "@/components/strategy-charts";
import { pct, pctColor } from "@/lib/format";

async function getStats() {
  const outcomes = await prisma.outcome.findMany({
    where: { archived: false },
    include: { focusArea: true, assignments: { include: { user: true } } },
  });

  const focusAreas = await prisma.focusArea.findMany();

  const milestones = await prisma.milestone.findMany({
    where: { outcome: { archived: false } },
    include: { outcome: { select: { focusAreaId: true } } },
  });

  const byArea = focusAreas.map((fa) => {
    const areaOutcomes = outcomes.filter((o) => o.focusAreaId === fa.id);
    const total = areaOutcomes.length;
    const avgPct =
      total > 0
        ? areaOutcomes.reduce((sum, o) => sum + o.completePct, 0) / total
        : 0;
    const byStatus = {
      not_started: areaOutcomes.filter((o) => o.status === "not_started").length,
      in_progress: areaOutcomes.filter((o) => o.status === "in_progress").length,
      complete: areaOutcomes.filter((o) => o.status === "complete").length,
      delayed: areaOutcomes.filter((o) => o.status === "delayed").length,
    };
    const milestoneCount = milestones.filter((m) => m.outcome.focusAreaId === fa.id).length;
    return { ...fa, total, avgPct: pct(avgPct), byStatus, milestoneCount };
  });

  const byDepartment = Object.entries(
    outcomes.reduce<Record<string, number>>((acc, o) => {
      if (o.department) acc[o.department] = (acc[o.department] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const stackedData = focusAreas.map((fa) => {
    const areaOutcomes = outcomes.filter((o) => o.focusAreaId === fa.id);
    return {
      name: fa.name,
      complete: areaOutcomes.filter((o) => o.status === "complete").length,
      in_progress: areaOutcomes.filter((o) => o.status === "in_progress").length,
      delayed: areaOutcomes.filter((o) => o.status === "delayed").length,
      not_started: areaOutcomes.filter((o) => o.status === "not_started").length,
    };
  });

  const deptPieData = byDepartment.map(([name, value]) => ({ name, value }));

  const leadMap = focusAreas.reduce<Record<string, { outcomes: number; complete: number; in_progress: number; delayed: number; not_started: number }>>((acc, fa) => {
    const areaOutcomes = outcomes.filter((o) => o.focusAreaId === fa.id);
    const entry = acc[fa.sltLead] || { outcomes: 0, complete: 0, in_progress: 0, delayed: 0, not_started: 0 };
    entry.outcomes += areaOutcomes.length;
    entry.complete += areaOutcomes.filter((o) => o.status === "complete").length;
    entry.in_progress += areaOutcomes.filter((o) => o.status === "in_progress").length;
    entry.delayed += areaOutcomes.filter((o) => o.status === "delayed").length;
    entry.not_started += areaOutcomes.filter((o) => o.status === "not_started").length;
    acc[fa.sltLead] = entry;
    return acc;
  }, {});
  const leadData = Object.entries(leadMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.outcomes - a.outcomes);

  const totalMilestones = milestones.length;

  const recentOutcomeIds = (await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM Outcome WHERE archived = 0 ORDER BY rowid DESC LIMIT 10
  `).map(r => r.id);
  const outcomeMap = new Map(outcomes.map((o) => [o.id, o]));
  const recentOutcomes = recentOutcomeIds.map((id) => outcomeMap.get(id)).filter(Boolean) as typeof outcomes;

  return { outcomes, recentOutcomes, byArea, byDepartment, stackedData, deptPieData, leadData, totalMilestones };
}

export default async function DashboardPage() {
  const session = await auth();
  const data = await getStats();

  const totalOutcomes = data.outcomes.length;
  const totalComplete = data.outcomes.filter((o) => o.status === "complete").length;
  const overallAvg =
    totalOutcomes > 0
      ? data.outcomes.reduce((sum, o) => sum + o.completePct, 0) / totalOutcomes
      : 0;
  const ov = pct(overallAvg);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Strategy Dashboard</h1>
        <p className="text-zinc-500 text-sm">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Overall Progress</p>
          <p className="text-3xl font-bold" style={{ color: pctColor(ov) }}>{ov}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Total Milestones</p>
          <p className="text-3xl font-bold text-zinc-900">{data.totalMilestones}</p>
        </div>
        <div className="col-span-2 md:col-span-3 bg-white rounded-xl shadow-sm border border-zinc-200 p-4 flex items-center justify-around">
          <div className="text-center">
            <p className="text-sm text-zinc-500">Total Outcomes</p>
            <p className="text-3xl font-bold text-zinc-900">{totalOutcomes}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-500">Outcomes Completed</p>
            <p className="text-3xl font-bold text-green-600">{totalComplete}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-500">Outcomes In Progress</p>
            <p className="text-3xl font-bold text-amber-600">
              {data.outcomes.filter((o) => o.status === "in_progress").length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StackedAreaChart data={data.stackedData} />
        <DepartmentPie data={data.deptPieData} />
      </div>

      <LeadBarChart data={data.leadData} />

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Progress by Focus Area</h2>
        <div className="space-y-4">
          {data.byArea.map((area) => (
            <div key={area.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{area.name}</span>
                <span className="font-bold" style={{ color: pctColor(area.avgPct) }}>{area.avgPct}%</span>
              </div>
              <div className="bg-zinc-200 rounded-full h-3">
                <div className="h-3 rounded-full transition-all" style={{ width: `${area.avgPct}%`, backgroundColor: pctColor(area.avgPct) }} />
              </div>
              <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                <span className="text-green-600">{area.byStatus.complete} complete</span>
                <span className="text-amber-600">{area.byStatus.in_progress} in prog</span>
                <span className="text-red-600">{area.byStatus.delayed} delayed</span>
                <span>{area.byStatus.not_started} not started</span>
                <span className="ml-auto">{area.total} outcomes &middot; {area.milestoneCount} milestones</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Outcomes</h2>
        <div className="space-y-2">
          {data.recentOutcomes.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0"
            >
              <div>
                <span className="text-sm font-medium">{o.title}</span>
                <span className="text-xs text-zinc-400 ml-2">
                  {o.focusArea.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {o.assignments.map((a) => a.user.name).join(", ") || "Unassigned"}
                </span>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import { prisma } from "@/lib/prisma";
import { OverallPie, AreaBarChart, FocusAreaPies } from "@/components/dashboard-charts";

function pct(n: number) {
  return Math.ceil(n * 100);
}

function pctColor(v: number) {
  return v >= 70 ? "#16a34a" : v >= 30 ? "#ca8a04" : "#dc2626";
}

async function getData() {
  const outcomes = await prisma.outcome.findMany({
    where: { archived: false },
    include: { focusArea: true },
  });
  const focusAreas = await prisma.focusArea.findMany();

  const milestones = await prisma.milestone.findMany({
    where: { outcome: { archived: false } },
    include: { outcome: { select: { focusAreaId: true } } },
  });

  const areaStats = focusAreas.map((fa) => {
    const areaOutcomes = outcomes.filter((o) => o.focusAreaId === fa.id);
    const total = areaOutcomes.length;
    const complete = areaOutcomes.filter((o) => o.status === "complete").length;
    const avgPct = total > 0 ? areaOutcomes.reduce((sum, o) => sum + o.completePct, 0) / total : 0;
    const milestoneCount = milestones.filter((m) => m.outcome.focusAreaId === fa.id).length;
    return { name: fa.name, sltLead: fa.sltLead, totalOutcomes: total, completeOutcomes: complete, avgCompletePct: pct(avgPct), milestoneCount };
  });

  const totalOutcomes = outcomes.length;
  const totalComplete = outcomes.filter((o) => o.status === "complete").length;
  const overallAvg = totalOutcomes > 0 ? outcomes.reduce((sum, o) => sum + o.completePct, 0) / totalOutcomes : 0;

  const statusCounts = [
    { name: "complete", value: outcomes.filter((o) => o.status === "complete").length },
    { name: "in_progress", value: outcomes.filter((o) => o.status === "in_progress").length },
    { name: "not_started", value: outcomes.filter((o) => o.status === "not_started").length },
    { name: "delayed", value: outcomes.filter((o) => o.status === "delayed").length },
  ];

  const barData = areaStats.map((a) => ({ name: a.name, pct: a.avgCompletePct }));

  const statuses = ["complete", "in_progress", "not_started", "delayed"] as const;
  const areaPieData = focusAreas.map((fa) => {
    const areaOutcomes = outcomes.filter((o) => o.focusAreaId === fa.id);
    return { name: fa.name, statuses: statuses.map((s) => ({ name: s, value: areaOutcomes.filter((o) => o.status === s).length })) };
  });

  const totalMilestones = milestones.length;

  return { areaStats, statusCounts, barData, areaPieData, totalOutcomes, totalComplete, overallAvg, totalMilestones };
}

export default async function OverviewPage() {
  const data = await getData();
  const ov = pct(data.overallAvg);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Outcomes</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{data.totalOutcomes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Milestones</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{data.totalMilestones}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{data.totalComplete}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{data.statusCounts.find(s => s.name === "in_progress")?.value || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Overall Progress</p>
          <p className="text-3xl font-bold mt-1" style={{ color: pctColor(ov) }}>{ov}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-zinc-200 rounded-full h-5">
            <div className="h-5 rounded-full transition-all" style={{ width: `${ov}%`, backgroundColor: pctColor(ov) }} />
          </div>
          <span className="text-2xl font-bold" style={{ color: pctColor(ov) }}>{ov}%</span>
        </div>
        <p className="text-sm text-zinc-500 mt-2">{data.totalComplete} of {data.totalOutcomes} outcomes completed</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <OverallPie data={data.statusCounts} />
        <AreaBarChart data={data.barData} />
      </div>

      <FocusAreaPies data={data.areaPieData} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.areaStats.map((area) => (
          <div key={area.name} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
            <h3 className="font-semibold text-zinc-900 mb-1">{area.name}</h3>
            <p className="text-xs text-zinc-500 mb-3">Lead: {area.sltLead}</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-zinc-200 rounded-full h-3">
                <div className="h-3 rounded-full transition-all" style={{ width: `${area.avgCompletePct}%`, backgroundColor: pctColor(area.avgCompletePct) }} />
              </div>
              <span className="text-lg font-bold" style={{ color: pctColor(area.avgCompletePct) }}>{area.avgCompletePct}%</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{area.completeOutcomes} complete</span>
              <span>{area.totalOutcomes} outcomes &middot; {area.milestoneCount} milestones</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
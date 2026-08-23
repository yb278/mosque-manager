import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const ACTION_LABELS: Record<string, string> = {
  "outcome.create": "created outcome",
  "outcome.update": "updated outcome",
  "outcome.delete": "deleted outcome",
  "user.create": "created user",
  "user.update": "updated user",
  "user.resetPassword": "reset password for",
  "focusArea.create": "created focus area",
  "focusArea.update": "updated focus area",
  "focusArea.delete": "deleted focus area",
};

const FIELD_LABELS: Record<string, string> = {
  status: "Status",
  completePct: "Progress",
  notes: "Notes",
  reasonForDelay: "Delay reason",
  title: "Title",
  benefit: "Benefit",
  startingPoint: "Starting point",
  desiredOutcome: "Desired outcome",
  department: "Department",
  riskLevel: "Risk level",
  riskIfNot: "Risk if not achieved",
  targetDate: "Target date",
  actions: "Actions",
  archived: "Archive status",
  name: "Name",
  role: "Role",
  email: "Email",
  sltLead: "SLT lead",
  milestoneCount: "Milestone count",
  reportedToOpex: "OPEX report",
};

function humanizeEnum(value: string) {
  if (!value) return "empty";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(field: string, value: string) {
  if (value === "—" || value === "") return "none";
  if (field === "completePct") return `${Math.round(Number(value) || 0)}%`;
  if (field === "status" || field === "role") return humanizeEnum(value);
  return value;
}

function humanizeSegments(details: string): string[] {
  return details
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((seg) => {
      let match = seg.match(/^Email changed for "([^"]*)";\s*(.+)$/);
      if (match) return `Email changed — ${match[2]}`;

      if (seg === "deactivated") return "Deactivated the user";
      if (seg === "activated") return "Activated the user";
      if (seg === "archived") return "Archived the outcome";
      if (seg === "unarchived") return "Unarchived the outcome";

      match = seg.match(/^(\w+):\s*(.*?) →\s*(.*)$/);
      if (match) {
        const [, field, from, to] = match;
        const label = FIELD_LABELS[field] || humanizeEnum(field);
        return `${label}: ${formatValue(field, from)} → ${formatValue(field, to)}`;
      }

      match = seg.match(/^(milestones|owners) set to (\d+)$/);
      if (match) {
        return match[1] === "milestones"
          ? `Milestones updated (${match[2]})`
          : `Owners updated (${match[2]})`;
      }

      if (seg.includes(" → ")) {
        const [field, to] = seg.split(" → ");
        const label = FIELD_LABELS[field.trim()] || field.trim();
        return `${label} changed to ${to}`;
      }

      match = seg.match(/^(\w+) updated$/);
      if (match) return `${FIELD_LABELS[match[1]] || humanizeEnum(match[1])} updated`;

      return seg;
    });
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ActivityPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actorIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as number[];
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true },
      })
    : [];
  const actorMap = new Map(actors.map((u) => [u.id, u.name]));

  const outcomeIds = [
    ...new Set(
      logs
        .filter((l) => l.entityType === "outcome" && l.entityId)
        .map((l) => l.entityId as string)
    ),
  ];
  const outcomes = outcomeIds.length
    ? await prisma.outcome.findMany({
        where: { id: { in: outcomeIds } },
        select: { id: true, title: true },
      })
    : [];
  const outcomeMap = new Map(outcomes.map((o) => [o.id, o.title]));

  const userEntityIds = [
    ...new Set(
      logs
        .filter((l) => l.entityType === "user" && l.entityId)
        .map((l) => Number(l.entityId))
    ),
  ];
  const targetUsers = userEntityIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userEntityIds } },
        select: { id: true, name: true },
      })
    : [];
  const targetUserMap = new Map(targetUsers.map((u) => [u.id, u.name]));

  const focusAreaIds = [
    ...new Set(
      logs
        .filter((l) => l.entityType === "focusArea" && l.entityId)
        .map((l) => l.entityId as string)
    ),
  ];
  const focusAreas = focusAreaIds.length
    ? await prisma.focusArea.findMany({
        where: { id: { in: focusAreaIds } },
        select: { id: true, name: true },
      })
    : [];
  const focusAreaMap = new Map(focusAreas.map((f) => [f.id, f.name]));

  function targetName(log: (typeof logs)[number]): string | null {
    if (log.entityType === "outcome") return outcomeMap.get(log.entityId ?? "") ?? null;
    if (log.entityType === "user") return targetUserMap.get(Number(log.entityId)) ?? null;
    if (log.entityType === "focusArea") return focusAreaMap.get(log.entityId ?? "") ?? null;
    return null;
  }

  function detailLines(log: (typeof logs)[number]): string[] {
    if (log.action === "user.resetPassword") return ["New password sent by email"];
    if (
      (log.action === "outcome.update" ||
        log.action === "user.update" ||
        log.action === "focusArea.update") &&
      log.details
    ) {
      return humanizeSegments(log.details);
    }
    return [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-zinc-500">Recent changes across the system</p>
        </div>
        <Link
          href="/admin"
          className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
        >
          ← Back to Admin
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <ul className="space-y-5">
            {logs.map((log) => {
              const actor = actorMap.get(log.userId ?? -1) || "System";
              const verb = ACTION_LABELS[log.action] || log.action;
              const target =
                targetName(log) ??
                ((log.action.endsWith(".create") || log.action.endsWith(".delete")) && log.details
                  ? log.details
                  : null);
              const lines = detailLines(log);
              return (
                <li key={log.id} className="border-b border-zinc-100 last:border-0 pb-4 last:pb-0">
                  <p className="text-sm">
                    <span className="font-medium">{actor}</span>{" "}
                    <span className="text-zinc-500">{verb}</span>
                    {target && (
                      <span className="text-zinc-800 font-medium"> &ldquo;{target}&rdquo;</span>
                    )}
                  </p>
                  {lines.length > 0 && (
                    <ul className="mt-1 pl-5 space-y-0.5 text-sm text-zinc-600 list-disc">
                      {lines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">{timeAgo(log.createdAt)}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

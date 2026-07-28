import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import OutcomeEditor from "./outcome-editor";
import DeleteButton from "./delete-button";
import ArchiveButton from "./archive-button";

export default async function OutcomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const outcome = await prisma.outcome.findUnique({
    where: { id },
    include: {
      focusArea: true,
      responsibleUser: true,
      milestones: true,
    },
  });

  if (!outcome) notFound();

  const userId = Number(session.user.id);
  const isAdmin = session.user.role === "admin";
  const isOwner = outcome.responsibleUserId === userId;
  const canEdit = isAdmin || isOwner;

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-400 font-mono">{outcome.id}</p>
          <h1 className="text-2xl font-bold mt-1">{outcome.title}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {outcome.focusArea.name}
            {outcome.department && ` · ${outcome.department}`}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <ArchiveButton outcomeId={outcome.id} archived={outcome.archived} />
          )}
          {isAdmin && <DeleteButton outcomeId={outcome.id} />}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <h2 className="font-semibold mb-3">Details</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-zinc-500">Benefit</dt>
              <dd>{outcome.benefit || "-"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Risk Level</dt>
              <dd>{outcome.riskLevel || "-"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Risk if Not Achieved</dt>
              <dd>{outcome.riskIfNot || "-"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Target Date</dt>
              <dd>{outcome.targetDate || "-"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Owner</dt>
              <dd>{outcome.responsibleUser?.name || "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Department</dt>
              <dd>{outcome.department || "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <h2 className="font-semibold mb-3">Starting Point</h2>
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">
            {outcome.startingPoint || "Not specified"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <h2 className="font-semibold mb-3">Desired Outcome</h2>
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">
            {outcome.desiredOutcome || "Not specified"}
          </p>
        </div>

        {outcome.milestones.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
            <h2 className="font-semibold mb-3">
              Milestones ({outcome.milestones.length})
            </h2>
            <ul className="space-y-2">
              {outcome.milestones.map((m) => (
                <li key={m.id} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <div>
                    <span>{m.description}</span>
                    {m.targetDate && (
                      <span className="text-zinc-400 ml-1 text-xs">
                        ({m.targetDate})
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {outcome.actions && (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
            <h2 className="font-semibold mb-3">Actions</h2>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">
              {outcome.actions}
            </p>
          </div>
        )}

        {canEdit && (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
            <h2 className="font-semibold mb-3">Progress</h2>
            <p className="text-xs text-zinc-500 mb-1">
              Reported to OPEX: {outcome.reportedToOpex || "Not set"}
            </p>
            <OutcomeEditor
              outcomeId={outcome.id}
              currentStatus={outcome.status}
              currentPct={outcome.completePct}
              currentNotes={outcome.notes || ""}
              currentReason={outcome.reasonForDelay || ""}
            />
          </div>
        )}

        {outcome.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
            <h2 className="font-semibold mb-3">Notes</h2>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">
              {outcome.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

async function getSession() {
  return auth();
}

const PROGRESS_FIELDS = ["status", "completePct", "notes", "reasonForDelay"] as const;
const ADMIN_FIELDS = ["title", "benefit", "startingPoint", "desiredOutcome", "department", "riskLevel", "riskIfNot", "targetDate", "actions", "archived"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const outcome = await prisma.outcome.findUnique({
    where: { id },
    include: { milestones: true, assignments: true },
  });
  if (!outcome) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = Number(session.user.id);
  const isAdmin = session.user.role === "admin";
  const isAssigned = outcome.assignments.some((a) => a.userId === userId);

  if (!isAdmin && !isAssigned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};

  if (isAssigned) {
    for (const field of PROGRESS_FIELDS) {
      if (body[field] !== undefined) data[field] = body[field];
    }
  }

  if (isAdmin) {
    for (const field of ADMIN_FIELDS) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    for (const field of PROGRESS_FIELDS) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.archived !== undefined) data.archived = body.archived;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.outcome.update({ where: { id }, data });

    if ((isAdmin || isAssigned) && body.milestones !== undefined) {
      await tx.milestone.deleteMany({ where: { outcomeId: id } });
      if (body.milestones.length > 0) {
        await tx.milestone.createMany({
          data: body.milestones.map((m: { description: string; targetDate?: string }) => ({
            outcomeId: id,
            description: m.description,
            targetDate: m.targetDate || null,
          })),
        });
      }
    }

    if (isAdmin && body.userIds !== undefined) {
      await tx.outcomeAssignment.deleteMany({ where: { outcomeId: id } });
      if (body.userIds.length > 0) {
        await tx.outcomeAssignment.createMany({
          data: body.userIds.map((uid: number) => ({ outcomeId: id, userId: uid })),
        });
      }
    }

    const progressChanged =
      (isAdmin || isAssigned) && PROGRESS_FIELDS.some((f) => body[f] !== undefined);

    if (progressChanged) {
      await tx.outcomeProgress.create({
        data: {
          outcomeId: id,
          status: (data.status as typeof outcome.status) ?? outcome.status,
          completePct: (data.completePct as number) ?? outcome.completePct,
          reasonForDelay: (data.reasonForDelay as string | null) ?? outcome.reasonForDelay,
          notes: (data.notes as string | null) ?? outcome.notes,
          userId,
        },
      });
    }

    const changes: string[] = [];
    for (const field of PROGRESS_FIELDS) {
      if (body[field] !== undefined && body[field] !== outcome[field]) {
        changes.push(`${field}: ${outcome[field] ?? "—"} → ${body[field] ?? "—"}`);
      }
    }
    for (const field of ADMIN_FIELDS) {
      if (isAdmin && body[field] !== undefined && body[field] !== outcome[field]) {
        changes.push(field === "archived" ? (body.archived ? "archived" : "unarchived") : `${field} updated`);
      }
    }
    if (body.milestones !== undefined) {
      changes.push(`milestones set to ${body.milestones.length}`);
    }
    if (isAdmin && body.userIds !== undefined) {
      changes.push(`owners set to ${body.userIds.length}`);
    }

    if (changes.length > 0) {
      await tx.activityLog.create({
        data: {
          userId,
          action: "outcome.update",
          entityType: "outcome",
          entityId: id,
          details: changes.join("; "),
        },
      });
    }

    return updated;
  });

  return NextResponse.json(result);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const outcome = await prisma.outcome.findUnique({ where: { id } });
  if (!outcome) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.activityLog.create({
    data: {
      userId: Number(session.user.id),
      action: "outcome.delete",
      entityType: "outcome",
      entityId: id,
      details: outcome.title,
    },
  });

  await prisma.milestone.deleteMany({ where: { outcomeId: id } });
  await prisma.outcome.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

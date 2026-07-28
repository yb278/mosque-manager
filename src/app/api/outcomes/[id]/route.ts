import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

async function getSession() {
  return auth();
}

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

  const outcome = await prisma.outcome.findUnique({ where: { id } });
  if (!outcome) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = Number(session.user.id);
  const isAdmin = session.user.role === "admin";
  const isOwner = outcome.responsibleUserId === userId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: Record<string, unknown> = {
    status: body.status ?? outcome.status,
    completePct: body.completePct ?? outcome.completePct,
    notes: body.notes ?? outcome.notes,
    reasonForDelay: body.reasonForDelay ?? outcome.reasonForDelay,
  };

  if (body.archived !== undefined) {
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can archive" }, { status: 403 });
    }
    data.archived = body.archived;
  }

  const updated = await prisma.outcome.update({ where: { id }, data });

  return NextResponse.json(updated);
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

  await prisma.milestone.deleteMany({ where: { outcomeId: id } });
  await prisma.outcome.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

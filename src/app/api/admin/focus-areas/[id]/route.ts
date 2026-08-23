import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, sltLead } = body;

    const existing = await prisma.focusArea.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Focus area not found" }, { status: 404 });
    }

    const updated = await prisma.focusArea.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(sltLead !== undefined && { sltLead }),
      },
    });

    const changes: string[] = [];
    if (name !== undefined && name !== existing.name) changes.push(`name → ${name}`);
    if (sltLead !== undefined && sltLead !== existing.sltLead) {
      changes.push(`SLT lead → ${sltLead}`);
    }
    if (changes.length > 0) {
      await prisma.activityLog.create({
        data: {
          userId: Number(session.user.id),
          action: "focusArea.update",
          entityType: "focusArea",
          entityId: id,
          details: changes.join("; "),
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating focus area:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.focusArea.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Focus area not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.milestone.deleteMany({ where: { outcome: { focusAreaId: id } } });
      await tx.outcome.deleteMany({ where: { focusAreaId: id } });
      await tx.focusArea.delete({ where: { id } });
      await tx.activityLog.create({
        data: {
          userId: Number(session.user.id),
          action: "focusArea.delete",
          entityType: "focusArea",
          entityId: id,
          details: existing.name,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting focus area:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

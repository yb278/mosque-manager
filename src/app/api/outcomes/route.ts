import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { focusAreaId, title, department, responsibleUserId, riskLevel, targetDate, benefit, startingPoint, desiredOutcome, actions, notes } = body;

    if (!focusAreaId || !title) {
      return NextResponse.json({ error: "Focus area and title required" }, { status: 400 });
    }

    const focusArea = await prisma.focusArea.findUnique({ where: { id: focusAreaId } });
    if (!focusArea) {
      return NextResponse.json({ error: "Focus area not found" }, { status: 404 });
    }

    const existing = await prisma.outcome.findMany({ where: { focusAreaId }, orderBy: { id: "desc" }, take: 1 });
    const lastNum = existing.length > 0 ? parseInt(existing[0].id.replace(focusAreaId, "")) || 0 : 0;
    const newId = `${focusAreaId}${lastNum + 1}`;

    const outcome = await prisma.outcome.create({
      data: {
        id: newId,
        focusAreaId,
        title,
        department: department || null,
        responsibleUserId: responsibleUserId ? Number(responsibleUserId) : null,
        riskLevel: riskLevel || null,
        targetDate: targetDate || null,
        benefit: benefit || null,
        startingPoint: startingPoint || null,
        desiredOutcome: desiredOutcome || null,
        actions: actions || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ id: outcome.id });
  } catch (error) {
    console.error("Error creating outcome:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

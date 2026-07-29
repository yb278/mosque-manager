import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating focus area:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

async function makeUniqueId(name: string): Promise<string> {
  const base = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const root = base || name.slice(0, 2).toUpperCase();
  let id = root;
  let n = 1;
  while (await prisma.focusArea.findUnique({ where: { id } })) {
    id = `${root}${n}`;
    n++;
  }
  return id;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const sltLead = typeof body.sltLead === "string" ? body.sltLead.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!sltLead) {
      return NextResponse.json({ error: "SLT lead is required" }, { status: 400 });
    }

    const id = await makeUniqueId(name);
    const focusArea = await prisma.focusArea.create({
      data: { id, name, sltLead },
    });

    await prisma.activityLog.create({
      data: {
        userId: Number(session.user.id),
        action: "focusArea.create",
        entityType: "focusArea",
        entityId: id,
        details: name,
      },
    });

    return NextResponse.json(focusArea);
  } catch (error) {
    console.error("Error creating focus area:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

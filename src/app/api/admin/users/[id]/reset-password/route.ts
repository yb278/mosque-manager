import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const defaultPassword = user.role === "admin" ? "admin123" : "changeme123";
    const passwordHash = await hash(defaultPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: true },
    });

    return NextResponse.json({ message: "Password reset", defaultPassword });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

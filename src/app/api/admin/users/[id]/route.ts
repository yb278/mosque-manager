import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { sendPasswordEmail } from "@/lib/email";

async function getSession() {
  return auth();
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);

    if (Number(session.user.id) === userId) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const userId = Number(id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.role && body.role !== "admin" && body.role !== "editor") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.role) data.role = body.role;
    if (body.name) data.name = body.name;

    let emailChanged = false;
    if (body.email && body.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      data.email = body.email;
      emailChanged = true;
    }

    if (emailChanged) {
      const rawPassword = randomBytes(6).toString("hex");
      data.passwordHash = await hash(rawPassword, 12);
      data.mustChangePassword = true;
      await prisma.user.update({ where: { id: userId }, data });
      await sendPasswordEmail(body.email, body.name || user.name, rawPassword);
      return NextResponse.json({ message: "Email updated and password reset. New credentials emailed." });
    }

    if (body.role || body.name) {
      const updated = await prisma.user.update({ where: { id: userId }, data });
      return NextResponse.json({ id: updated.id, name: updated.name, role: updated.role });
    }

    return NextResponse.json({ message: "No changes applied" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { sendPasswordEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity";

async function getSession() {
  return auth();
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
    const actorId = Number(session.user.id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.role && body.role !== "admin" && body.role !== "editor") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.name) data.name = body.name;
    if (body.role) data.role = body.role;

    if (body.isActive === false && user.isActive) {
      if (userId === actorId) {
        return NextResponse.json({ error: "Cannot deactivate yourself" }, { status: 400 });
      }
      if (user.role === "admin") {
        const activeAdmins = await prisma.user.count({
          where: { role: "admin", isActive: true },
        });
        if (activeAdmins <= 1) {
          return NextResponse.json(
            { error: "Cannot deactivate the last active admin" },
            { status: 400 }
          );
        }
      }
      data.isActive = false;
      data.archivedAt = new Date();
    } else if (body.isActive === true && !user.isActive) {
      data.isActive = true;
      data.archivedAt = null;
    }

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
      await logActivity(
        actorId,
        "user.update",
        "user",
        String(userId),
        `Email changed for "${user.name}"; new password emailed`
      );
      return NextResponse.json({ message: "Email updated and password reset. New credentials emailed." });
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "No changes applied" });
    }

    const updated = await prisma.user.update({ where: { id: userId }, data });

    const changes: string[] = [];
    if (data.role && data.role !== user.role) changes.push(`role → ${data.role}`);
    if (data.isActive === false) changes.push("deactivated");
    if (data.isActive === true) changes.push("activated");
    if (data.name && data.name !== user.name) changes.push("name updated");
    if (changes.length > 0) {
      await logActivity(
        actorId,
        "user.update",
        "user",
        String(userId),
        changes.join("; ")
      );
    }

    return NextResponse.json({ id: updated.id, name: updated.name, role: updated.role });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

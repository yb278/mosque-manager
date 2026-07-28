import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateOutcomeForm from "./create-outcome-form";

export default async function CreateOutcomePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/outcomes");

  const focusAreas = await prisma.focusArea.findMany();
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create Outcome</h1>
      <CreateOutcomeForm focusAreas={focusAreas.map(fa => ({ id: fa.id, name: fa.name }))} users={users.map(u => ({ id: u.id, name: u.name }))} />
    </div>
  );
}

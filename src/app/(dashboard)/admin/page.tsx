import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateUserForm from "./create-user-form";
import RoleToggle from "./role-toggle";
import ResetPasswordButton from "./reset-password-button";
import ToggleActiveButton from "./toggle-active-button";
import EditUserButton from "./edit-user-button";
import EditFocusArea from "./edit-focus-area";
import CreateFocusArea from "./create-focus-area";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const { status } = await searchParams;
  const showArchived = status === "archived";
  const currentUserId = Number(session.user.id);

  const [allUsers, focusAreas, outcomeGroups] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] }),
    prisma.focusArea.findMany({ orderBy: { id: "asc" } }),
    prisma.outcome.groupBy({ by: ["focusAreaId"], _count: { _all: true } }),
  ]);

  const outcomeCounts = new Map(outcomeGroups.map((g) => [g.focusAreaId, g._count._all]));

  const activeUsers = allUsers.filter((u) => u.isActive);
  const archivedUsers = allUsers.filter((u) => !u.isActive);
  const users = showArchived ? archivedUsers : activeUsers;

  const stats = {
    users: activeUsers.length,
    archived: archivedUsers.length,
    outcomes: await prisma.outcome.count(),
    milestones: await prisma.milestone.count(),
    reviews: await prisma.opexReview.count(),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-zinc-500">System overview and user management</p>
        </div>
        <Link
          href="/admin/activity"
          className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
        >
          Activity Log
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Active Users</p>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Archived Users</p>
          <p className="text-3xl font-bold">{stats.archived}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Outcomes</p>
          <p className="text-3xl font-bold">{stats.outcomes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Milestones</p>
          <p className="text-3xl font-bold">{stats.milestones}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">OPEX Reviews</p>
          <p className="text-3xl font-bold">{stats.reviews}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">Create User</h2>
        <CreateUserForm />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">
            {showArchived ? "Archived Users" : "Users"} ({users.length})
          </h2>
          <div className="flex gap-1 text-sm">
            <Link
              href="/admin"
              className={`px-3 py-1 rounded-lg border ${!showArchived ? "bg-primary text-white border-primary" : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"}`}
            >
              Active ({activeUsers.length})
            </Link>
            <Link
              href="/admin?status=archived"
              className={`px-3 py-1 rounded-lg border ${showArchived ? "bg-primary text-white border-primary" : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"}`}
            >
              Archived ({archivedUsers.length})
            </Link>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-2 font-medium text-zinc-500">Name</th>
                <th className="text-left py-2 font-medium text-zinc-500">Email</th>
                <th className="text-left py-2 font-medium text-zinc-500">Role</th>
                <th className="text-left py-2 font-medium text-zinc-500">Created</th>
                <th className="text-left py-2 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100">
                  <td className="py-2">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-1 text-xs text-zinc-400">(you)</span>
                    )}
                  </td>
                  <td className="py-2 text-zinc-500">{u.email}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 text-zinc-400 text-xs">
                    {u.createdAt.toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-2 flex gap-2 items-start">
                    <EditUserButton userId={u.id} userName={u.name} userEmail={u.email} />
                    <RoleToggle userId={u.id} currentRole={u.role} />
                    <ResetPasswordButton userId={u.id} userName={u.name} />
                    {u.id !== currentUserId ? (
                      <ToggleActiveButton userId={u.id} userName={u.name} isActive={u.isActive} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden space-y-3">
          {users.map((u) => (
            <div key={u.id} className="border border-zinc-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{u.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {u.role}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-1">{u.email}</p>
              <p className="text-xs text-zinc-400 mb-3">Created: {u.createdAt.toLocaleDateString("en-GB")}</p>
              <div className="flex gap-2 flex-wrap">
                <EditUserButton userId={u.id} userName={u.name} userEmail={u.email} />
                <RoleToggle userId={u.id} currentRole={u.role} />
                <ResetPasswordButton userId={u.id} userName={u.name} />
                {u.id !== currentUserId ? (
                  <ToggleActiveButton userId={u.id} userName={u.name} isActive={u.isActive} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">Focus Areas ({focusAreas.length})</h2>
        <p className="text-xs text-zinc-400 mb-3">Add a focus area and pick its SLT lead.</p>
        <CreateFocusArea users={allUsers.map((u) => ({ id: u.id, name: u.name }))} />
        <div>
          {focusAreas.map((fa) => (
            <EditFocusArea
              key={fa.id}
              focusArea={fa}
              users={allUsers.map((u) => ({ id: u.id, name: u.name }))}
              outcomeCount={outcomeCounts.get(fa.id) ?? 0}
            />
          ))}
        </div>
      </div>

      <div className="text-xs text-zinc-400">
        <Link href="/overview" className="hover:text-primary">
          ← Back to overview
        </Link>
      </div>
    </div>
  );
}

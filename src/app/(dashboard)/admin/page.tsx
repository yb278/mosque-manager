import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateUserForm from "./create-user-form";
import RoleToggle from "./role-toggle";
import ResetPasswordButton from "./reset-password-button";
import DeleteUserButton from "./delete-user-button";
import EditUserButton from "./edit-user-button";
import EditFocusArea from "./edit-focus-area";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  const focusAreas = await prisma.focusArea.findMany({ orderBy: { id: "asc" } });
  const stats = {
    users: users.length,
    outcomes: await prisma.outcome.count(),
    milestones: await prisma.milestone.count(),
    reviews: await prisma.opexReview.count(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-zinc-500">System overview and user management</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Users</p>
          <p className="text-3xl font-bold">{stats.users}</p>
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
        <h2 className="font-semibold mb-4">Users ({users.length})</h2>

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
                  <td className="py-2">{u.name}</td>
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
                    <RoleToggle userId={u.id} currentRole={u.role} userName={u.name} />
                    <ResetPasswordButton userId={u.id} userName={u.name} />
                    <DeleteUserButton userId={u.id} userName={u.name} />
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
              <p className="text-xs text-zinc-500 mb-2">{u.email}</p>
              <p className="text-xs text-zinc-400 mb-3">Created: {u.createdAt.toLocaleDateString("en-GB")}</p>
              <div className="flex gap-2 flex-wrap">
                <EditUserButton userId={u.id} userName={u.name} userEmail={u.email} />
                <RoleToggle userId={u.id} currentRole={u.role} userName={u.name} />
                <ResetPasswordButton userId={u.id} userName={u.name} />
                <DeleteUserButton userId={u.id} userName={u.name} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">Focus Areas ({focusAreas.length})</h2>
        <p className="text-xs text-zinc-400 mb-3">Edit focus area name and SLT lead.</p>
        <div>
          {focusAreas.map((fa) => (
            <EditFocusArea key={fa.id} focusArea={fa} />
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
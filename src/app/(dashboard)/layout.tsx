import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.mustChangePassword) redirect("/settings");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/overview" className="flex items-center gap-2 font-bold text-lg">
              <div className="bg-white rounded p-2"><Image src="/Al-Emaan-Centre-Logo.png" alt="Al-Emaan Centre" width={132} height={132} /></div>
              AEC Strategy
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/overview"
                className="hover:text-red-200 transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-red-200 transition-colors"
              >
                Strategy
              </Link>
              <Link
                href="/outcomes"
                className="hover:text-red-200 transition-colors"
              >
                Outcomes
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="hover:text-red-200 transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-red-200">{session.user.name}</span>
            <Link
              href="/settings"
              className="text-white hover:text-red-200 transition-colors text-xs"
            >
              Settings
            </Link>
            <Link
              href="/api/auth/signout"
              className="bg-white text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-lighter transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        {children}
      </main>
    </div>
  );
}

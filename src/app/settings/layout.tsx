import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/overview" className="flex items-center gap-2 font-bold text-lg">
            <div className="bg-white rounded p-2"><Image src="/Al-Emaan-Centre-Logo.png" alt="Al-Emaan Centre" width={132} height={132} /></div>
            AEC Strategy
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-red-200">{session.user.name}</span>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

export default function DashboardHeader({ userName, role }: { userName: string; role: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/overview" className="flex items-center gap-2 font-bold text-lg">
            <div className="bg-white rounded p-2">
              <Image src="/Al-Emaan-Centre-Logo.png" alt="Al-Emaan Centre" width={132} height={132} />
            </div>
            AEC Strategy
          </Link>
          <nav className="hidden md:flex gap-4 text-sm">
            <Link href="/overview" className="hover:text-red-200 transition-colors">Overview</Link>
            <Link href="/dashboard" className="hover:text-red-200 transition-colors">Strategy</Link>
            <Link href="/outcomes" className="hover:text-red-200 transition-colors">Outcomes</Link>
            <Link href="/help" className="hover:text-red-200 transition-colors">Help</Link>
            {role === "admin" && (
              <Link href="/admin" className="hover:text-red-200 transition-colors">Admin</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden md:inline text-red-200">{userName}</span>
          <Link href="/settings" className="hidden md:inline text-white hover:text-red-200 transition-colors text-xs">Settings</Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="hidden md:inline bg-white text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-lighter transition-colors cursor-pointer">Sign Out</button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-1" aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-red-700">
          <nav className="flex flex-col px-4 py-2 text-sm">
            <Link href="/overview" onClick={() => setMenuOpen(false)} className="py-2 text-white hover:text-red-200 transition-colors">Overview</Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 text-white hover:text-red-200 transition-colors">Strategy</Link>
            <Link href="/outcomes" onClick={() => setMenuOpen(false)} className="py-2 text-white hover:text-red-200 transition-colors">Outcomes</Link>
            <Link href="/help" onClick={() => setMenuOpen(false)} className="py-2 text-white hover:text-red-200 transition-colors">Help</Link>
            {role === "admin" && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="py-2 text-white hover:text-red-200 transition-colors">Admin</Link>
            )}
            <div className="border-t border-red-700 mt-2 pt-2">
              <span className="block py-1 text-red-200">{userName}</span>
              <Link href="/settings" onClick={() => setMenuOpen(false)} className="block py-1 text-white hover:text-red-200 transition-colors">Settings</Link>
              <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/login" }); }} className="block py-1 text-white hover:text-red-200 transition-colors cursor-pointer">Sign Out</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
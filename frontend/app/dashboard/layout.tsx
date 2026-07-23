"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context";

const NAV = [
  { href: "/dashboard/generate", label: "Generate" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/profile", label: "Profile" },
];

const MAX_CREDITS = 10;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !user) return null;

  const creditsPct = Math.min(100, Math.round((user.credits / MAX_CREDITS) * 100));

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-4 md:gap-0 gap-4 pb-24 md:pb-4">
      {/* Desktop sidebar: unchanged from before, only shown at md+ */}
      <aside className="hidden md:flex w-52 bg-surface-1 rounded-2xl p-4 flex-col shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center text-white text-sm">✨</div>
          <span className="font-medium text-sm">Formify</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm px-3 py-2 rounded-xl ${
                pathname === item.href ? "bg-brand-50 text-brand-800 font-medium" : "text-gray-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3 bg-surface-0 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Credits left</p>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-400 rounded-full" style={{ width: `${creditsPct}%` }} />
          </div>
          <p className="text-xs font-medium mt-2">{Math.round(user.credits * 10) / 10} of {MAX_CREDITS}</p>
        </div>
      </aside>

      {/* Mobile top bar: logo + credits, only shown below md */}
      <div className="flex md:hidden items-center justify-between bg-surface-1 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center text-white text-sm">✨</div>
          <span className="font-medium text-sm">Formify</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-400 rounded-full" style={{ width: `${creditsPct}%` }} />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round(user.credits * 10) / 10}/{MAX_CREDITS}</span>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-6">{children}</main>

      {/* Mobile bottom tab bar, only shown below md */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-1 border-t border-gray-200 flex items-center justify-around px-2 py-2 shadow-md z-10">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-xs px-3 py-2 rounded-xl flex-1 text-center ${
              pathname === item.href ? "bg-brand-50 text-brand-800 font-medium" : "text-gray-500"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
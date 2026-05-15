"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function InstrumentIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={active ? 2 : 1.5}
      stroke="currentColor"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
      />
    </svg>
  );
}

function CampaignIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={active ? 2 : 1.5}
      stroke="currentColor"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
      />
    </svg>
  );
}

export default function PollsterNav() {
  const pathname = usePathname();

  const isInstrumentActive =
    pathname === "/instrument" || pathname.startsWith("/instrument/");
  const isCampaignActive =
    pathname === "/campaign" || pathname.startsWith("/campaign/");

  const items: NavItem[] = [
    {
      label: "Instrumentos",
      href: "/instrument",
      icon: <InstrumentIcon active={isInstrumentActive} />,
    },
    {
      label: "Campañas",
      href: "/campaign",
      icon: <CampaignIcon active={isCampaignActive} />,
    },
  ];

  const isActive = (href: string) =>
    href === "/instrument" ? isInstrumentActive : isCampaignActive;

  return (
    <>
      {/* ── Desktop: top navbar ───────────────────────────────────────────── */}
      <header className="hidden sm:flex fixed top-0 left-0 right-0 z-40 h-14 items-center border-b border-neutral-200 bg-white px-6 shadow-sm">
        <span className="mr-8 text-base font-bold text-green-700 tracking-tight select-none">
          SOSAgro
        </span>
        <nav className="flex items-center gap-1">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-50 text-green-700"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ── Mobile: bottom navigation bar ────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-neutral-200 bg-white">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                active
                  ? "text-green-700"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {/* active indicator line at the top */}
              <span
                className={`absolute top-0 h-0.5 w-12 rounded-full transition-colors ${
                  active ? "bg-green-600" : "bg-transparent"
                }`}
              />
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

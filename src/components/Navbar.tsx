"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { label: "Form Tamu", href: "/form-tamu" },
    { label: "Jadwal Tamu", href: "/jadwal-tamu" },
    { label: "Semua Tamu", href: "/semua-tamu" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Bold logo text with accent dot */}
        <div className="flex-1 flex items-center">
          <Link
            href="/form-tamu"
            className="text-xl font-extrabold tracking-tight text-neutral-900 select-none hover:opacity-90 transition flex items-center gap-1.5"
          >
            <span>Buku Tamu</span>
            <span className="w-2 h-2 rounded-full bg-[#307cff]" />
          </Link>
        </div>

        {/* Center: Navigation Links with vibrant #307cff active pill */}
        <nav className="flex items-center gap-1.5 bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/60">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#307cff] text-white shadow-md shadow-[#307cff]/25"
                    : "text-neutral-600 hover:text-[#307cff] hover:bg-white/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Circle User icon with #307cff accent */}
        <div className="flex-1 flex justify-end relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Profil Resepsionis"
            className="w-10 h-10 rounded-full bg-[#307cff] hover:bg-[#2563eb] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-[#307cff]/20 focus:outline-none focus:ring-2 focus:ring-[#307cff] focus:ring-offset-2"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-60 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-neutral-100">
                <p className="text-xs text-neutral-400 font-medium">Masuk sebagai</p>
                <p className="text-sm font-bold text-neutral-900 truncate">
                  {session?.user?.name || "Resepsionis"}
                </p>
                <p className="text-xs text-[#307cff] font-medium truncate">
                  @{((session?.user as unknown as { username?: string })?.username) || "resepsionis"}
                </p>
              </div>

              <div className="pt-1.5">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

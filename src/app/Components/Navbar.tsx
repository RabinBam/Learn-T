"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Oxanium } from "next/font/google";

const oxanium = Oxanium({ subsets: ["latin"], weight: ["400", "600", "700"] });

const NAV_LINKS = [
  { href: "/aboutus", label: "About Us", icon: "/icons/info.svg" },
  { href: "/learning", label: "Learning", icon: "/icons/book.svg" },
  { href: "/options", label: "Playground", icon: "/icons/gamepad.svg" },
  { href: "/contactus", label: "Contact Us", icon: "/icons/envelope.svg" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render navigation links until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 shadow-lg bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition">
                <Image
                  src="/icons/LOGO.jpeg"
                  alt="TailSpark Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className={`${oxanium.className} text-cyan-400 text-xl font-bold tracking-wide`}
              >
                TailSpark
              </span>
            </Link>

            {/* Desktop Nav Skeleton */}
            <div className="hidden md:flex space-x-6 items-center">
              {NAV_LINKS.map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 animate-pulse"
                >
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <div className="w-16 h-4 bg-gray-600 rounded"></div>
                </div>
              ))}

              {/* Profile Skeleton */}
              <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={buttonRef}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900"
            >
              <Image
                src="/icons/bars-solid-full.svg"
                alt="menu icon"
                width={24}
                height={24}
                priority
              />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 shadow-lg bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition">
              <Image
                src="/icons/LOGO.jpeg"
                alt="TailSpark Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <span
              className={`${oxanium.className} text-cyan-400 text-xl font-bold tracking-wide`}
            >
              TailSpark
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6 items-center">
            {NAV_LINKS.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={idx}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
                  ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20 border border-cyan-500/30"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-cyan-400 hover:shadow-md"
                  }`}
                >
                  <Image
                    src={link.icon}
                    alt=""
                    width={18}
                    height={18}
                    className={`${
                      isActive ? "brightness-125" : "brightness-75"
                    } transition-all`}
                  />
                  {link.label}
                </Link>
              );
            })}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-700/50 transition-all duration-300 hover:shadow-lg"
              >
                <Image
                  src="/icons/user-circle.svg"
                  alt="Profile"
                  width={28}
                  height={28}
                  className="brightness-75 hover:brightness-100 transition-all"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 shadow-xl rounded-lg py-2 z-50 border border-gray-700 backdrop-blur-sm">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors"
                  >
                    Settings
                  </Link>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={buttonRef}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all duration-300"
          >
            <Image
              src={
                mobileMenuOpen
                  ? "/icons/close.svg"
                  : "/icons/bars-solid-full.svg"
              }
              alt="menu icon"
              width={24}
              height={24}
              priority
              className="brightness-75"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`md:hidden bg-gray-800 shadow-xl fixed top-16 left-0 w-64 h-screen p-5 transform transition-transform duration-500 ease-in-out border-r border-gray-700 backdrop-blur-sm
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="space-y-3">
          {NAV_LINKS.map((link, idx) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20 border border-cyan-500/30"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-cyan-400"
                }`}
              >
                <Image
                  src={link.icon}
                  alt=""
                  width={20}
                  height={20}
                  className={`${
                    isActive ? "brightness-125" : "brightness-75"
                  } transition-all`}
                />
                {link.label}
              </Link>
            );
          })}

          {/* Profile Dropdown inside mobile menu */}
          <div className="mt-6 border-t border-gray-600 pt-4">
            <p className="px-4 text-xs text-gray-500 mb-2 font-medium tracking-wide">
              PROFILE
            </p>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 rounded-lg transition-colors"
            >
              My Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 rounded-lg transition-colors"
            >
              Settings
            </Link>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

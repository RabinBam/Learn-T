"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Oxanium } from "next/font/google";

const oxanium = Oxanium({ subsets: ["latin"], weight: ["400", "600", "700"] });

const NAV_LINKS = [
  { href: "/aboutus", label: "About Us", icon: "/icons/info.svg" },
  { href: "/docs", label: "Learning", icon: "/icons/book.svg" },
  { href: "/options", label: "Playground", icon: "/icons/gamepad.svg" },
  { href: "/contactus", label: "Contact Us", icon: "/icons/envelope.svg" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeHover, setActiveHover] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle mouse movement for particle effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  // Loading skeleton
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-30 transition-all duration-500">
        <div className="backdrop-blur-lg bg-gray-900/70 border-b border-gray-700/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-14">
              {/* Logo Skeleton */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="w-24 h-5 bg-gray-700 rounded animate-pulse"></div>
              </div>

              {/* Desktop Nav Skeleton */}
              <div className="hidden md:flex space-x-3 items-center">
                {NAV_LINKS.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 animate-pulse"
                  >
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <div className="w-16 h-3 bg-gray-600 rounded"></div>
                  </div>
                ))}
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
              </div>

              {/* Mobile Menu Button Skeleton */}
              <div className="md:hidden w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-500${
        scrolled
          ? "backdrop-blur-xl bg-gradient-to-r from-gray-900/95 via-purple-900/90 to-gray-900/95 shadow-xl border-b border-purple-500/20"
          : "backdrop-blur-md bg-gradient-to-r from-gray-900/80 via-purple-900/75 to-gray-900/80 border-b border-gray-700/30"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveHover(-1);
      }}
    >
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full transition-all duration-1000 ${
              isHovered
                ? "bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse scale-150 opacity-60"
                : "bg-gray-500 opacity-20"
            }`}
            style={{
              left: `${15 + i * 12}%`,
              top: `${20 + (i % 2) * 60}%`,
              animationDelay: `${i * 0.2}s`,
              transform: isHovered
                ? `translateY(${Math.sin(i) * 10}px)`
                : "translateY(0)",
            }}
          />
        ))}
      </div>

      {/* Dynamic Wave Effect */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-all duration-700 ${
          isHovered ? "opacity-100 animate-pulse" : "opacity-0"
        }`}
        style={{
          background: `linear-gradient(90deg, transparent 0%, #06b6d4 20%, #8b5cf6 50%, #06b6d4 80%, transparent 100%)`,
          transform: isHovered ? "scaleX(1)" : "scaleX(0)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Compact Logo */}
          <Link href="/" className="flex items-center space-x-2 group relative">
            <div className="relative">
              {/* Logo with Magnetic Effect */}
              <div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg"
                style={{
                  transform: isHovered
                    ? `translate(${Math.cos(Date.now() * 0.001) * 2}px, ${
                        Math.sin(Date.now() * 0.001) * 2
                      }px)`
                    : "translate(0, 0)",
                }}
              >
                <Image
                  src="/icons/LOGO.jpeg"
                  alt="TailSpark Logo"
                  width={32}
                  height={32}
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                  priority
                />

                {/* Micro Particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping"
                      style={{
                        left: `${Math.cos((i * Math.PI) / 2) * 20 + 50}%`,
                        top: `${Math.sin((i * Math.PI) / 2) * 20 + 50}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Orbiting Ring */}
              <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-all duration-700">
                <div
                  className="w-10 h-10 border border-cyan-400/50 rounded-lg animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
            </div>

            <span
              className={`${oxanium.className} text-lg font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-pink-300 transition-all duration-500`}
            >
              TailSpark
            </span>

            {/* Trailing Effect */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-700" />
          </Link>

          {/* Compact Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={idx}
                  href={link.href}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 shadow-lg"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-cyan-300"
                  }`}
                  onMouseEnter={() => setActiveHover(idx)}
                  onMouseLeave={() => setActiveHover(-1)}
                >
                  {/* Morphing Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/15 to-pink-500/10 transition-all duration-500 ${
                      activeHover === idx
                        ? "opacity-100 scale-105"
                        : "opacity-0 scale-95"
                    }`}
                    style={{
                      borderRadius: activeHover === idx ? "12px" : "8px",
                    }}
                  />

                  {/* Icon with Bounce */}
                  <div className="relative">
                    <Image
                      src={link.icon}
                      alt=""
                      width={16}
                      height={16}
                      className={`transition-all duration-300 ${
                        isActive
                          ? "brightness-125"
                          : "brightness-75 group-hover:brightness-125"
                      } ${
                        activeHover === idx
                          ? "scale-125 rotate-12"
                          : "scale-100 rotate-0"
                      }`}
                    />

                    {/* Icon Glow */}
                    {activeHover === idx && (
                      <div className="absolute inset-0 blur-sm">
                        <Image
                          src={link.icon}
                          alt=""
                          width={16}
                          height={16}
                          className="brightness-200 opacity-50"
                        />
                      </div>
                    )}
                  </div>

                  <span className="relative z-10 transition-transform duration-200 group-hover:scale-105">
                    {link.label}
                  </span>

                  {/* Liquid Active Indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="w-4 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-cyan-400/30 rounded-full blur-sm absolute -top-1 left-1/2 transform -translate-x-1/2 animate-bounce" />
                    </div>
                  )}

                  {/* Energy Pulse */}
                  {activeHover === idx && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg animate-pulse" />
                  )}
                </Link>
              );
            })}

            {/* Compact Profile */}
            <div className="relative ml-2" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="group relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 hover:from-purple-500/50 hover:to-cyan-500/50 border border-purple-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110 overflow-hidden"
              >
                {/* Swirling Background */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 group-hover:animate-spin transition-all duration-700"
                  style={{ animationDuration: "2s" }}
                />

                <Image
                  src="/icons/user-circle.svg"
                  alt="Profile"
                  width={18}
                  height={18}
                  className="relative z-10 brightness-75 group-hover:brightness-125 transition-all duration-300"
                />

                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/50 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />
              </button>

              {/* Compact Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-xl py-2 border border-purple-500/30 overflow-hidden z-40">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/10" />

                  {[
                    { href: "/profile", label: "Profile" },
                    { href: "/settings", label: "Settings" },
                    { label: "Logout", isButton: true },
                  ].map((item, idx) => (
                    <div key={idx} className="relative group">
                      {item.isButton ? (
                        <button className="relative w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-800/30 hover:text-cyan-300 transition-all duration-200">
                          <span className="relative z-10">{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          href={item.href!}
                          className="relative block px-4 py-2 text-sm text-gray-300 hover:bg-purple-800/30 hover:text-cyan-300 transition-all duration-200"
                        >
                          <span className="relative z-10">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Compact Mobile Menu Button */}
          <button
            ref={buttonRef}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden group relative w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 hover:from-purple-500/50 hover:to-cyan-500/50 border border-purple-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110 overflow-hidden"
          >
            {/* Rotating Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 transition-all duration-500 ${
                mobileMenuOpen ? "animate-spin" : "group-hover:animate-pulse"
              }`}
            />

            <Image
              src={
                mobileMenuOpen
                  ? "/icons/close.svg"
                  : "/icons/bars-solid-full.svg"
              }
              alt="menu icon"
              width={16}
              height={16}
              priority
              className="relative z-10 brightness-75 group-hover:brightness-125 transition-all duration-300"
            />

            {/* Expanding Ring */}
            <div
              className={`absolute inset-0 rounded-lg border border-cyan-400/50 transition-all duration-300 ${
                mobileMenuOpen
                  ? "scale-150 opacity-100"
                  : "scale-100 opacity-0 group-hover:opacity-100"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Compact Mobile Menu */}
      <div
        ref={menuRef}
        className={`md:hidden fixed top-14 left-0 w-64 h-screen bg-gradient-to-br from-gray-900/98 via-purple-900/95 to-gray-900/98 backdrop-blur-xl shadow-2xl p-4 transform transition-all duration-500 border-r border-purple-500/30 z-35 overflow-hidden
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-1 h-full">
            {[...Array(64)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-cyan-500 to-purple-500 rounded-sm animate-pulse"
                style={{
                  animationDelay: `${(i % 16) * 0.1}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-2">
          {NAV_LINKS.map((link, idx) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden
                ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 shadow-lg"
                    : "text-gray-300 hover:bg-purple-800/30 hover:text-cyan-300"
                }`}
              >
                {/* Sliding Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/15 to-purple-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />

                <Image
                  src={link.icon}
                  alt=""
                  width={18}
                  height={18}
                  className={`relative z-10 transition-all duration-300 ${
                    isActive
                      ? "brightness-125"
                      : "brightness-75 group-hover:brightness-125"
                  } group-hover:scale-110 group-hover:rotate-6`}
                />

                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                  {link.label}
                </span>

                {/* Trailing Dots */}
                {isActive && (
                  <div className="absolute right-3 flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Mobile Profile Section */}
          <div className="mt-6 pt-4 border-t border-purple-500/20">
            <p className="px-4 text-xs text-gray-500 mb-3 font-medium tracking-wider uppercase">
              Profile
            </p>

            {[
              { href: "/profile", label: "My Profile" },
              { href: "/settings", label: "Settings" },
              { label: "Logout", isButton: true },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                {item.isButton ? (
                  <button className="relative w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-800/30 hover:text-cyan-300 rounded-lg transition-all duration-200">
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative block px-4 py-2 text-sm text-gray-300 hover:bg-purple-800/30 hover:text-cyan-300 rounded-lg transition-all duration-200"
                  >
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .z-35 {
          z-index: 35;
        }
      `}</style>
    </nav>
  );
}

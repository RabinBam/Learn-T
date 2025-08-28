"use client";

import React, { useState, useEffect } from "react";

const TailSparkFooter: React.FC = () => {
  const [particles, setParticles] = useState<
    {
      left: string;
      top: string;
      animationDelay: string;
      animationDuration: string;
    }[]
  >([]);

  useEffect(() => {
    // Generate fewer particles for compact footer
    const generated = [...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
    setParticles(generated);
  }, []);

  const socialIcons = [
    {
      name: "GitHub",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const quickLinks = ["Docs", "Support", "Blog"];

  return (
    <footer className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Vibrant Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((style, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full animate-pulse ${
              i % 3 === 0
                ? "bg-cyan-400"
                : i % 3 === 1
                ? "bg-pink-500"
                : "bg-purple-400"
            }`}
            style={{ ...style, opacity: 0.8 }}
          />
        ))}
      </div>

      {/* Vibrant Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-4 left-8 w-6 h-6 border border-cyan-400 rotate-45 animate-spin opacity-60"
          style={{ animationDuration: "10s" }}
        />
        <div className="absolute top-6 right-12 w-4 h-4 bg-pink-500 rounded-full animate-bounce opacity-70" />
        <div className="absolute bottom-4 left-16 w-3 h-3 bg-purple-400 rounded animate-ping opacity-50" />
        <div className="absolute bottom-6 right-8 w-5 h-5 border border-yellow-400 rounded-full animate-pulse opacity-60" />
      </div>

      {/* Compact Horizontal Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
          {/* Brand Section */}
          <div className="flex items-center space-x-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent animate-pulse">
              TailSpark
            </h2>
            <p className="text-cyan-200 text-sm font-medium hidden sm:block">
              Master Tailwind CSS • Interactive Learning
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-8">
            {quickLinks.map((link, index) => (
              <a
                key={link}
                href={
                  link === "Docs"
                    ? "./docs"
                    : link === "Blog"
                    ? "./aboutus"
                    : "#"
                }
                className="text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-cyan-300 hover:via-pink-300 hover:to-yellow-300 hover:bg-clip-text transition-all duration-300 transform hover:scale-110 font-medium text-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Social & Copyright */}
          <div className="flex items-center space-x-8">
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialIcons.map((social, index) => (
                <a
                  key={social.name}
                  href={
                    social.name === "GitHub"
                      ? "https://github.com/RabinBam/Learn-T.git"
                      : social.name === "Twitter"
                      ? "https://x.com/sachin_sigdel8"
                      : social.name === "LinkedIn"
                      ? "https://www.linkedin.com/in/rabin-bam-317ba5160/"
                      : "#"
                  }
                  className="text-gray-300 hover:text-cyan-300 transition-all duration-300 transform hover:scale-125 hover:rotate-12 p-2 rounded-full hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-cyan-500/30 relative group"
                >
                  <div className="group-hover:animate-pulse relative z-10">
                    {social.icon}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/40 group-hover:to-cyan-500/40 transition-all duration-300 blur-sm scale-150 opacity-0 group-hover:opacity-100"></div>
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-sm font-medium">
              © 2024{" "}
              <span className="text-cyan-300 font-semibold">TailSpark</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vibrant Animated Border Effects */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-pink-500 via-yellow-400 to-purple-500 opacity-80 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500 opacity-60"></div>

      {/* Corner Accent Elements */}
      <div className="absolute bottom-2 left-4">
        <div className="flex space-x-1.5">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
          <div
            className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
    </footer>
  );
};

export default TailSparkFooter;

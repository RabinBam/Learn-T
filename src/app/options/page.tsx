"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const InteractiveLandingPage: React.FC = () => {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-cyan-400 rotate-45 animate-bounce opacity-30" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse opacity-40" />
        <div
          className="absolute bottom-32 left-1/4 w-12 h-12 border-2 border-yellow-400 rotate-12 animate-spin opacity-25"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-green-400 rotate-45 animate-ping opacity-20" />
      </div>

      {/* Mouse Follower Effect */}
      <div
        className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Main Content */}
      <div
        className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-1000 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
            TailSpark
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 opacity-90">
            Master Tailwind CSS Through Interactive Learning
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full animate-pulse" />
        </div>

        {/* Options Container */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full perspective-1000">
          {/* Endless TailwindQuest Option */}
          <div
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-xl border border-purple-500/30 p-8 cursor-pointer transform transition-all duration-700 hover:scale-110 hover:rotate-3 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-4"
            onClick={() => handleNavigation("/endless-tailwind-quest")}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Epic Animated Border */}
            <div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-cyan-500 via-pink-500 via-yellow-500 to-purple-500 opacity-0 group-hover:opacity-30 transition-all duration-700 bg-[length:300%_300%] animate-pulse group-hover:animate-none"
              style={{
                backgroundSize: "300% 300%",
                animation: "gradient-shift 3s ease infinite",
              }}
            />

            {/* Explosive Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/0 via-pink-400/0 to-cyan-400/0 group-hover:from-purple-400/20 group-hover:via-pink-400/30 group-hover:to-cyan-400/20 transition-all duration-700 blur-xl scale-110" />

            {/* Floating Particles on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"
                  style={{
                    left: `${10 + i * 6}%`,
                    top: `${15 + i * 5}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${1 + (i % 3)}s`,
                  }}
                />
              ))}
            </div>

            {/* Content with 3D Transform */}
            <div
              className="relative z-10 group-hover:transform group-hover:rotateY-5 transition-transform duration-700"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Epic Icon with Multiple Animations */}
              <div className="w-24 h-24 mb-8 mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl flex items-center justify-center group-hover:rotate-[360deg] group-hover:scale-125 transition-all duration-1000 shadow-lg group-hover:shadow-purple-500/50 group-hover:shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <svg
                  className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h3 className="text-4xl font-bold text-white mb-6 text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-200 group-hover:via-pink-200 group-hover:to-cyan-200 group-hover:bg-clip-text transition-all duration-500 transform group-hover:scale-105">
                Endless TailwindQuest
              </h3>

              <p className="text-gray-300 text-center mb-8 leading-relaxed group-hover:text-gray-100 transition-all duration-500 transform group-hover:scale-105">
                Embark on an infinite journey of Tailwind CSS challenges. From
                beginner-friendly layouts to expert-level animations, test your
                skills and level up continuously.
              </p>

              <div className="flex justify-center space-x-3 mb-8">
                {["Beginner", "Intermediate", "Expert"].map((level, i) => (
                  <span
                    key={level}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-2 ${
                      i === 0
                        ? "bg-green-500/30 text-green-200 group-hover:bg-green-400/50 group-hover:shadow-lg group-hover:shadow-green-400/30"
                        : i === 1
                        ? "bg-yellow-500/30 text-yellow-200 group-hover:bg-yellow-400/50 group-hover:shadow-lg group-hover:shadow-yellow-400/30"
                        : "bg-red-500/30 text-red-200 group-hover:bg-red-400/50 group-hover:shadow-lg group-hover:shadow-red-400/30"
                    }`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {level}
                  </span>
                ))}
              </div>

              <div className="text-center">
                <span className="inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold text-lg group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-cyan-400 transition-all duration-500 transform group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-purple-500/50 relative overflow-hidden">
                  <span className="relative z-10">Start Epic Quest →</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </span>
              </div>
            </div>

            {/* Mega Floating Elements */}
            <div
              className="absolute top-6 right-6 w-12 h-12 border-2 border-purple-400 rounded-lg rotate-45 animate-spin opacity-40 group-hover:animate-bounce group-hover:scale-150 group-hover:opacity-80 transition-all duration-700"
              style={{ animationDuration: "3s" }}
            />
            <div className="absolute bottom-6 left-6 w-10 h-10 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full animate-bounce opacity-50 group-hover:animate-ping group-hover:scale-125 transition-all duration-500" />
            <div className="absolute top-1/2 left-6 w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-400 rounded rotate-12 animate-pulse opacity-30 group-hover:animate-spin group-hover:scale-150 transition-all duration-700" />
            <div className="absolute bottom-1/3 right-8 w-6 h-6 border-2 border-cyan-400 rounded-full animate-ping opacity-40 group-hover:animate-bounce group-hover:scale-200 transition-all duration-500" />
          </div>

          {/* Open Playground Option */}
          <div
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800/20 to-blue-800/20 backdrop-blur-xl border border-cyan-500/30 p-8 cursor-pointer transform transition-all duration-700 hover:scale-110 hover:-rotate-3 hover:shadow-2xl hover:shadow-cyan-500/40 hover:-translate-y-4"
            onClick={() => handleNavigation("/open-playground")}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Epic Animated Border */}
            <div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 via-purple-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-30 transition-all duration-700"
              style={{
                backgroundSize: "300% 300%",
                animation: "gradient-shift 4s ease infinite reverse",
              }}
            />

            {/* Explosive Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/0 via-blue-400/0 to-purple-400/0 group-hover:from-cyan-400/20 group-hover:via-blue-400/30 group-hover:to-purple-400/20 transition-all duration-700 blur-xl scale-110" />

            {/* Floating Particles on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-ping"
                  style={{
                    right: `${10 + i * 6}%`,
                    top: `${20 + i * 4}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: `${1.5 + (i % 2)}s`,
                  }}
                />
              ))}
            </div>

            {/* Content with 3D Transform */}
            <div
              className="relative z-10 group-hover:transform group-hover:rotateY-5 transition-transform duration-700"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Epic Icon with Multiple Animations */}
              <div className="w-24 h-24 mb-8 mx-auto bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl flex items-center justify-center group-hover:rotate-[360deg] group-hover:scale-125 transition-all duration-1000 shadow-lg group-hover:shadow-cyan-500/50 group-hover:shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <svg
                  className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>

              <h3 className="text-4xl font-bold text-white mb-6 text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-200 group-hover:via-blue-200 group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-500 transform group-hover:scale-105">
                Open Playground
              </h3>

              <p className="text-gray-300 text-center mb-8 leading-relaxed group-hover:text-gray-100 transition-all duration-500 transform group-hover:scale-105">
                Dive into our curated collection of pre-built templates and
                components. Experiment, customize, and bring your creative
                visions to life instantly.
              </p>

              <div className="flex justify-center space-x-3 mb-8">
                {["Components", "Templates", "Layouts"].map((type, i) => (
                  <span
                    key={type}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-2 ${
                      i === 0
                        ? "bg-blue-500/30 text-blue-200 group-hover:bg-blue-400/50 group-hover:shadow-lg group-hover:shadow-blue-400/30"
                        : i === 1
                        ? "bg-purple-500/30 text-purple-200 group-hover:bg-purple-400/50 group-hover:shadow-lg group-hover:shadow-purple-400/30"
                        : "bg-cyan-500/30 text-cyan-200 group-hover:bg-cyan-400/50 group-hover:shadow-lg group-hover:shadow-cyan-400/30"
                    }`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="text-center">
                <span className="inline-block bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold text-lg group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-400 transition-all duration-500 transform group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-cyan-500/50 relative overflow-hidden">
                  <span className="relative z-10">Enter Playground →</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </span>
              </div>
            </div>

            {/* Mega Floating Elements */}
            <div className="absolute top-6 right-6 w-12 h-12 border-2 border-cyan-400 rounded-full animate-ping opacity-40 group-hover:animate-spin group-hover:scale-150 group-hover:opacity-80 transition-all duration-700" />
            <div
              className="absolute bottom-6 left-6 w-10 h-10 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg rotate-45 animate-spin opacity-50 group-hover:animate-bounce group-hover:scale-125 transition-all duration-500"
              style={{ animationDuration: "4s" }}
            />
            <div className="absolute top-1/2 right-6 w-8 h-8 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full animate-bounce opacity-30 group-hover:animate-ping group-hover:scale-150 transition-all duration-700" />
            <div className="absolute bottom-1/3 left-8 w-6 h-6 border-2 border-purple-400 rounded rotate-45 animate-spin opacity-40 group-hover:animate-pulse group-hover:scale-200 transition-all duration-500" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center opacity-60">
          <p className="text-gray-400">
            Choose your path and start building amazing interfaces
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default InteractiveLandingPage;

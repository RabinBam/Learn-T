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
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* Endless TailwindQuest Option */}
          <div
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-lg border border-purple-500/30 p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-purple-500/25"
            onClick={() => handleNavigation("/endless-tailwind-quest")}
          >
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 mb-6 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg
                  className="w-10 h-10 text-white"
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

              <h3 className="text-3xl font-bold text-white mb-4 text-center group-hover:text-purple-200 transition-colors duration-300">
                Endless TailwindQuest
              </h3>

              <p className="text-gray-300 text-center mb-6 leading-relaxed">
                Embark on an infinite journey of Tailwind CSS challenges. From
                beginner-friendly layouts to expert-level animations, test your
                skills and level up continuously.
              </p>

              <div className="flex justify-center space-x-2 mb-6">
                {["Beginner", "Intermediate", "Expert"].map((level, i) => (
                  <span
                    key={level}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      i === 0
                        ? "bg-green-500/20 text-green-300"
                        : i === 1
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {level}
                  </span>
                ))}
              </div>

              <div className="text-center">
                <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                  Start Quest →
                </span>
              </div>
            </div>

            {/* Floating Elements */}
            <div
              className="absolute top-4 right-4 w-8 h-8 border border-purple-400 rounded rotate-45 animate-spin opacity-30 group-hover:animate-pulse"
              style={{ animationDuration: "4s" }}
            />
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-cyan-400 rounded-full animate-bounce opacity-40" />
          </div>

          {/* Open Playground Option */}
          <div
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800/30 to-blue-800/30 backdrop-blur-lg border border-cyan-500/30 p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-2xl hover:shadow-cyan-500/25"
            onClick={() => handleNavigation("/open-playground")}
          >
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 mb-6 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>

              <h3 className="text-3xl font-bold text-white mb-4 text-center group-hover:text-cyan-200 transition-colors duration-300">
                Open Playground
              </h3>

              <p className="text-gray-300 text-center mb-6 leading-relaxed">
                Dive into our curated collection of pre-built templates and
                components. Experiment, customize, and bring your creative
                visions to life instantly.
              </p>

              <div className="flex justify-center space-x-2 mb-6">
                {["Components", "Templates", "Layouts"].map((type, i) => (
                  <span
                    key={type}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      i === 0
                        ? "bg-blue-500/20 text-blue-300"
                        : i === 1
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-cyan-500/20 text-cyan-300"
                    }`}
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="text-center">
                <span className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-full font-semibold group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300">
                  Open Playground →
                </span>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 w-8 h-8 border border-cyan-400 rounded-full animate-ping opacity-30" />
            <div
              className="absolute bottom-4 left-4 w-6 h-6 bg-purple-400 rounded rotate-45 animate-spin opacity-40"
              style={{ animationDuration: "6s" }}
            />
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

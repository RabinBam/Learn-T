"use client";

import { motion } from "framer-motion";

export default function Welcome() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-4">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-800 via-blue-800 to-indigo-900 opacity-30"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Main content */}
      <motion.h1
        className="relative text-5xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to the Docs 🚀
      </motion.h1>

      <motion.p
        className="relative mt-6 max-w-2xl text-lg text-gray-200 sm:text-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Use the <span className="font-semibold text-sky-400">sidebar</span> on
        the left to explore the documentation and guides.
      </motion.p>

      {/* Floating callout */}
      <motion.div
        className="relative mt-12 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-gray-200 shadow-lg backdrop-blur"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <p className="text-sm sm:text-base">
          👉 Choose a topic from the sidebar to get started
        </p>
      </motion.div>
    </div>
  );
}

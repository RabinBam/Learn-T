"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { auth, signInWithGoogle, signOutUser } from "@/lib/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false); // keep modal for fallback
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  // Simulate navigation
  const navigate = (path: string) => {
    router.push(path);
  };

  const handleAction = (path: string) => {
    if (!user) {
      // either show modal or directly call Google Sign In
      setIsOpen(true);
      return;
    }
    navigate(path);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if you want email/password auth, hook it here
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-900 text-white flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold mb-6 text-center bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        TailSpark
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl mb-8 max-w-2xl text-center text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        Master Tailwind CSS the fun way! Complete challenges, unlock levels, and
        sharpen your frontend skills while playing.
      </motion.p>

      {/* Cards Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Card 1 */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:shadow-2xl transition cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => handleAction("/options")}
        >
          <h2 className="text-2xl font-bold text-pink-400 mb-3">
            Play by Learning
          </h2>
          <p className="text-gray-300 mb-4">
            Practice Tailwind by solving quests, earn points, and level up while
            enjoying the game-like experience.
          </p>
          <button
            onClick={() => handleAction("/options")}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl font-semibold shadow hover:scale-105 transition"
          >
            Start Playing
          </button>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:shadow-2xl transition cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => handleAction("/tutorial")}
        >
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">Tutorial</h2>
          <p className="text-gray-300 mb-4">
            New to Tailwind CSS? Learn the basics step by step before jumping
            into quests with our guided tutorials.
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-xl font-semibold shadow hover:scale-105 transition">
            View Tutorials
          </button>
        </motion.div>
      </div>

      {/* Auth Section */}
      <div className="mt-10 flex flex-col items-center">
        {!user ? (
          <>
            <button
              onClick={signInWithGoogle}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-xl font-semibold shadow hover:scale-105 transition"
            >
              Sign in with Google
            </button>
            <p className="text-sm text-gray-400 mt-3">
              Or{" "}
              <button
                onClick={() => setIsOpen(true)}
                className="text-pink-400 hover:underline"
              >
                Login with Email
              </button>
            </p>
          </>
        ) : (
          <>
            <p className="text-lg mb-2">Welcome, {user.displayName}</p>
            <button
              onClick={signOutUser}
              className="px-6 py-2 bg-red-500 rounded-xl font-semibold shadow hover:scale-105 transition"
            >
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Auth Modal (only if using email/password) */}
      {isOpen && !user && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              {isLogin ? "Login" : "Signup"}
            </h2>

            <form className="flex flex-col gap-4" onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Username"
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring focus:ring-pink-500 outline-none"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring focus:ring-pink-500 outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                className="px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring focus:ring-pink-500 outline-none"
              />
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-xl font-semibold shadow hover:scale-105 transition"
              >
                {isLogin ? "Login" : "Signup"}
              </button>
            </form>

            <p className="text-sm text-gray-400 mt-4 text-center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-pink-400 hover:underline"
              >
                {isLogin ? "Signup" : "Login"}
              </button>
            </p>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 text-sm text-gray-400 hover:text-white block mx-auto"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

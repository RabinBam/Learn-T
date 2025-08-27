"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { auth } from "@/lib/firebase/firebase";
import {
  addXpAndUpdateLevel,
  getOrCreateProfile,
  advanceStage,
  recordGameResult,
} from "@/services/profile";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
// Types
type LevelType =
  | "utilities"
  | "layout"
  | "flex"
  | "grid"
  | "spacing"
  | "typography"
  | "effects"
  | "responsive"
  | "colors"
  | "borders";
type ChallengeMode = "palette" | "typing" | "mixed";

interface LevelDef {
  id: number;
  type: LevelType;
  required: string[];
  palette: string[];
  timeLimit: number;
  difficulty: number;
  mode: ChallengeMode;
  description: string;
  targetElement: string;
  challengeText?: string;
}

interface RunStats {
  levelId: number;
  startedAt: number;
  endedAt?: number;
  attempts: number;
  success?: boolean;
  errors: number;
}

interface SaveData {
  currentLevel: number; // stage progression
  xp: number;
  achievements: string[];
  history: RunStats[];
  bestStreak: number;
  totalErrors: number;
  // 🔥 Add this line
  profileLevel?: number; // XP-based level from Firestore
}

// Enhanced pools with more variety
const POOLS: Record<LevelType, string[]> = {
  utilities: [
    "rounded-xl",
    "rounded-2xl",
    "shadow-lg",
    "shadow-xl",
    "border",
    "border-2",
    "ring-2",
    "ring-purple-500",
    "ring-offset-2",
    "transition",
    "duration-300",
    "ease-out",
    "transform",
    "scale-105",
  ],
  layout: [
    "w-64",
    "h-40",
    "w-80",
    "h-48",
    "aspect-video",
    "overflow-hidden",
    "relative",
    "absolute",
    "inset-0",
    "z-10",
    "container",
    "mx-auto",
  ],
  flex: [
    "flex",
    "items-center",
    "justify-center",
    "gap-2",
    "gap-4",
    "flex-col",
    "flex-row",
    "justify-between",
    "items-start",
    "items-end",
    "justify-around",
    "flex-wrap",
  ],
  grid: [
    "grid",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "gap-2",
    "gap-4",
    "gap-6",
    "place-items-center",
    "grid-rows-2",
    "col-span-2",
  ],
  spacing: [
    "p-4",
    "p-6",
    "p-8",
    "px-6",
    "py-4",
    "m-4",
    "mx-auto",
    "my-8",
    "space-y-2",
    "space-x-3",
    "ml-auto",
    "mr-4",
  ],
  typography: [
    "text-white",
    "text-gray-100",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "font-semibold",
    "font-bold",
    "tracking-wide",
    "uppercase",
    "lowercase",
    "italic",
    "text-center",
  ],
  effects: [
    "bg-gradient-to-r",
    "from-purple-500",
    "to-cyan-500",
    "backdrop-blur",
    "backdrop-blur-xl",
    "opacity-90",
    "hover:scale-105",
    "hover:opacity-80",
    "animate-pulse",
    "animate-bounce",
  ],
  responsive: [
    "sm:w-full",
    "md:w-1/2",
    "lg:w-1/3",
    "xl:w-1/4",
    "sm:text-sm",
    "md:text-base",
    "lg:text-lg",
    "hidden",
    "sm:block",
    "md:hidden",
    "lg:flex",
  ],
  colors: [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "text-red-400",
    "text-blue-400",
    "text-green-400",
  ],
  borders: [
    "border-t",
    "border-b",
    "border-l",
    "border-r",
    "border-red-500",
    "border-blue-500",
    "rounded-t-lg",
    "rounded-b-lg",
    "border-dashed",
    "border-dotted",
  ],
};

const CHALLENGES = [
  { element: "button", text: "Create a stylish button" },
  { element: "card", text: "Design a modern card component" },
  { element: "navbar", text: "Build a responsive navigation bar" },
  { element: "hero", text: "Craft an eye-catching hero section" },
  { element: "form", text: "Style an elegant form" },
  { element: "gallery", text: "Create an image gallery" },
  { element: "sidebar", text: "Design a sleek sidebar" },
  { element: "modal", text: "Build a modal dialog" },
  { element: "dashboard", text: "Create a dashboard widget" },
  { element: "profile", text: "Design a user profile card" },
];

const DISTRACTORS = [
  "bg-orange-500",
  "text-lime-500",
  "italic",
  "underline",
  "line-through",
  "ring-8",
  "rounded-none",
  "rotate-6",
  "-rotate-6",
  "skew-x-6",
  "opacity-50",
  "blur-sm",
  "grayscale",
  "sepia",
  "contrast-150",
];

// Achievements
const ACHIEVEMENTS = [
  {
    id: "first-blood",
    name: "First Craft",
    test: (s: SaveData) => s.history.some((h) => h.success),
  },
  {
    id: "speedster",
    name: "Speedster (sub-10s)",
    test: (_: SaveData, r?: RunStats) =>
      !!r?.success && r.endedAt! - r.startedAt < 10000,
  },
  {
    id: "streak-5",
    name: "Hot Streak ×5",
    test: (s: SaveData) => currentStreak(s) >= 5,
  },
  {
    id: "streak-10",
    name: "Unstoppable ×10",
    test: (s: SaveData) => currentStreak(s) >= 10,
  },
  {
    id: "lvl-25",
    name: "Explorer 25",
    test: (s: SaveData) => s.currentLevel > 25,
  },
  {
    id: "lvl-50",
    name: "Veteran 50",
    test: (s: SaveData) => s.currentLevel > 50,
  },
  {
    id: "perfectionist",
    name: "Perfectionist (0 errors)",
    test: (_: SaveData, r?: RunStats) => !!r?.success && r.errors === 0,
  },
  {
    id: "typing-master",
    name: "Typing Master",
    test: (_: SaveData, r?: RunStats, l?: LevelDef) =>
      !!r?.success && l?.mode === "typing",
  },
];

function currentStreak(save: SaveData) {
  let streak = 0;
  for (let i = save.history.length - 1; i >= 0; i--) {
    if (save.history[i].success) streak++;
    else break;
  }
  return streak;
}

// Utility functions
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const sample = <T,>(arr: T[], n: number) =>
  arr.sort(() => Math.random() - 0.5).slice(0, n);

// Enhanced level generator with dynamic challenges
function generateLevel(id: number): LevelDef {
  const difficulty = 1 + Math.floor((id - 1) / 5);
  const typeOrder: LevelType[] = [
    "utilities",
    "spacing",
    "typography",
    "layout",
    "flex",
    "grid",
    "effects",
    "responsive",
    "colors",
    "borders",
  ];
  const type = typeOrder[id % typeOrder.length];

  // Determine challenge mode based on level
  let mode: ChallengeMode = "palette";
  if (id > 10 && id % 7 === 0) mode = "typing";
  else if (id > 15 && id % 5 === 0) mode = "mixed";

  const reqCount = Math.min(2 + difficulty, 8);
  const basePool = POOLS[type];
  const required = sample(basePool, Math.min(reqCount, basePool.length));

  // Enhanced palette with cross-category mixing
  const otherTypes = typeOrder.filter((t) => t !== type);
  const crossPool = sample(otherTypes, 2).flatMap((t) => sample(POOLS[t], 2));
  const palette = [
    ...new Set([
      ...required,
      ...crossPool,
      ...sample(DISTRACTORS, difficulty + 2),
    ]),
  ].slice(0, 20);

  // Shuffle palette to randomize option order
  for (let i = palette.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [palette[i], palette[j]] = [palette[j], palette[i]];
  }

  const timeLimit = Math.max(45 - difficulty * 3, 15);
  const challenge = CHALLENGES[id % CHALLENGES.length];

  return {
    id,
    type,
    required,
    palette,
    timeLimit,
    difficulty,
    mode,
    description: `${challenge.text} using ${type} utilities`,
    targetElement: challenge.element,
    challengeText:
      mode === "typing"
        ? `Create a ${challenge.element} with: ${required.join(", ")}`
        : undefined,
  };
}

// Local storage
const DEFAULT_SAVE: SaveData = {
  currentLevel: 1,
  xp: 0,
  bestStreak: 0,
  achievements: [],
  history: [],
  totalErrors: 0,
};

function loadSave(): SaveData {
  if (typeof window === "undefined") return DEFAULT_SAVE;
  const raw = localStorage.getItem("twq_save");
  try {
    return raw ? { ...DEFAULT_SAVE, ...JSON.parse(raw) } : DEFAULT_SAVE;
  } catch {
    return DEFAULT_SAVE;
  }
}

function storeSave(s: SaveData) {
  if (typeof window === "undefined") return;
  localStorage.setItem("twq_save", JSON.stringify(s));
}

// Main component
export default function EnhancedTailwindQuest() {
  // initialize save from localStorage so user progress persists across reloads
  const [save, setSave] = useState<SaveData>(() => {
    try {
      return loadSave();
    } catch {
      return DEFAULT_SAVE;
    }
  });
  const [mode, setMode] = useState<"landing" | "map" | "play" | "events">(
    "landing"
  );
  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [typedClasses, setTypedClasses] = useState("");
  const [run, setRun] = useState<RunStats | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [levelUp, setLevelUp] = useState(false);

  // Persist local save to localStorage whenever it changes
  useEffect(() => {
    try {
      storeSave(save);
    } catch (e) {
      console.warn("Failed to persist save:", e);
    }
  }, [save]);

  // Sync Firestore profile into local save on auth change (merge authoritative values)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // User signed out — reset local progress to DEFAULT_SAVE (start from zero/session fresh)
        try {
          setSave(DEFAULT_SAVE);
          storeSave(DEFAULT_SAVE);
        } catch (err) {
          console.warn("Failed to reset save on sign-out:", err);
        }
        return;
      }

      // User signed in — merge authoritative Firestore profile
      try {
        const profile = await getOrCreateProfile(u.uid);
        setSave((s) => {
          const merged = {
            ...s,
            // prefer the higher unlocked stage so we don't regress local progress
            currentLevel: Math.max(
              s.currentLevel || 1,
              profile.currentLevel || 1
            ),
            // sync XP/profileLevel from Firestore (authoritative)
            xp: typeof profile.xp === "number" ? profile.xp : s.xp,
            profileLevel:
              typeof profile.profileLevel === "number"
                ? profile.profileLevel
                : s.profileLevel,
          };
          try {
            storeSave(merged);
          } catch {}
          return merged;
        });
      } catch (err) {
        console.error("Failed to load profile on auth:", err);
      }
    });
    return () => unsub();
  }, []);

  // Hydration/client detection and nextLevel fix
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  const nextLevel = useMemo(
    () => generateLevel(save.currentLevel),
    [save.currentLevel]
  );

  // Global Hearts State
  const [hearts, setHearts] = useState(3); // 3 full hearts
  const [heartTimer, setHeartTimer] = useState<number>(0); // single countdown timer in seconds
  const [notifications, setNotifications] = useState<string[]>([]);

  // Heart restore intervals
  const restoreTimeFull = 120; // seconds for full heart
  const restoreTimeHalf = 60; // seconds for half heart

  // Function to show notification
  function showNotification(msg: string) {
    setNotifications((prev) => [...prev, msg]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((m) => m !== msg));
    }, 3000);
  }

  // Start a heart restore timer (only if timer is not running and hearts < 3)
  function startHeartRestoreTimer() {
    // Only set timer if not already running and hearts < 3
    if (heartTimer === 0 && hearts < 3) {
      if (hearts % 1 !== 0) {
        setHeartTimer(restoreTimeHalf); // 60s for half-heart restore
      } else {
        setHeartTimer(restoreTimeFull); // 120s for full-heart restore
      }
    }
  }

  // Heart timer countdown: increment by 0.5 or 1 heart every restoreTimeHalf or restoreTimeFull
  useEffect(() => {
    if (heartTimer <= 0) return;
    if (hearts >= 3) {
      setHeartTimer(0);
      return;
    }
    const interval = setInterval(() => {
      setHeartTimer((t) => {
        if (t <= 1) {
          let newHearts;
          if (hearts % 1 !== 0) {
            // If currently at half, restore to next full
            newHearts = Math.min(3, Math.floor(hearts) + 1);
            setHearts(newHearts);
            return newHearts >= 3 ? 0 : restoreTimeFull;
          } else {
            // If currently at full integer, restore a half
            newHearts = Math.min(3, hearts + 0.5);
            setHearts(newHearts);
            return newHearts >= 3 ? 0 : restoreTimeHalf;
          }
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [heartTimer, hearts]);

  useEffect(() => {
    if (hearts < 3 && heartTimer === 0) startHeartRestoreTimer();
  }, [hearts]);

  // Override startLevel to prevent starting with 0 hearts
  function startLevel(level: LevelDef) {
    if (hearts <= 0) {
      setToast(
        "No hearts! Go to Learning Page, Tutorial, Events or Playground."
      );
      return;
    }
    if (level.id > save.currentLevel) {
      setToast("Complete previous levels first!");
      return;
    }
    setActiveLevel(level);
    setSelection([]);
    setTypedClasses("");
    setErrors([]);
    setRun({
      levelId: level.id,
      startedAt: Date.now(),
      attempts: 0,
      errors: 0,
    });
    setMode("play");
  }

  function detectErrors(classes: string[]): string[] {
    const errors: string[] = [];
    const classStr = classes.join(" ");

    // Common error patterns
    if (classStr.includes("flex") && classStr.includes("grid")) {
      errors.push("Cannot use both flex and grid on same element");
    }
    if (
      classStr.includes("absolute") &&
      !classStr.includes("relative") &&
      !classStr.includes("inset")
    ) {
      errors.push(
        "Absolute positioning needs relative parent or inset classes"
      );
    }
    const textColorMatch = classStr.match(/text-(\w+)-\d+/);
    const bgColorMatch = classStr.match(/bg-(\w+)-\d+/);
    if (
      textColorMatch &&
      bgColorMatch &&
      textColorMatch[1] === bgColorMatch[1]
    ) {
      errors.push("Consider contrast between text and background colors");
    }

    return errors;
  }

  // Replace existing finishLevel with this async version
  async function finishLevel(success: boolean) {
    if (!activeLevel || !run) return;
    const ended = Date.now();
    const ms = ended - run.startedAt;

    const updatedRun: RunStats = {
      ...run,
      success,
      endedAt: ended,
      errors: errors.length,
    };
    const newHistory = [...save.history, updatedRun];

    const streakNow = success
      ? currentStreak({ ...save, history: newHistory })
      : 0;
    const baseXp = success ? 15 + activeLevel.difficulty * 8 : 5;
    const speedBonus = success
      ? Math.max(0, Math.floor((activeLevel.timeLimit * 1000 - ms) / 1500))
      : 0;
    const errorPenalty = errors.length * 2;
    const gained = Math.max(0, baseXp + speedBonus - errorPenalty);

    // Calculate next level if success
    const nextLevelNum =
      success && activeLevel.id === save.currentLevel
        ? save.currentLevel + 1
        : save.currentLevel;

    let nextSave: SaveData = {
      ...save,
      xp: save.xp + gained,
      bestStreak: Math.max(save.bestStreak, streakNow),
      history: newHistory,
      totalErrors: save.totalErrors + errors.length,
      currentLevel: nextLevelNum,
    };

    const user = auth.currentUser;
    if (user) {
      try {
        // write XP and stage, then read authoritative profile
        await addXpAndUpdateLevel(user.uid, gained);
        await advanceStage(user.uid, nextLevelNum);

        // record gamesPlayed / wins / losses atomically in Firestore
        try {
          await recordGameResult(user.uid, success);
        } catch (e) {
          console.warn("Failed to record game result:", e);
        }

        const refreshed = await getOrCreateProfile(user.uid);
        nextSave = {
          ...nextSave,
          xp: refreshed.xp,
          profileLevel: refreshed.profileLevel,
          currentLevel: refreshed.currentLevel,
        };
        setSave(nextSave);
      } catch (err) {
        console.error("Error updating XP/level in Firestore:", err);
        // fallback: use optimistic local save
        setSave(nextSave);
      }
    } else {
      setSave(nextSave); // unauthenticated fallback
    }

    // Achievements
    const newlyEarned = ACHIEVEMENTS.filter(
      (a) =>
        !nextSave.achievements.includes(a.id) &&
        a.test(nextSave, updatedRun, activeLevel)
    ).map((a) => a.id);

    if (newlyEarned.length) {
      nextSave.achievements = [...nextSave.achievements, ...newlyEarned];
      setToast(
        `Achievement unlocked: ${newlyEarned
          .map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.name)
          .join(", ")}`
      );
      setSave((s) => ({
        ...s,
        achievements: [...s.achievements, ...newlyEarned],
      }));
    }

    if (success) {
      setLevelUp(true);
      setTimeout(() => setLevelUp(false), 2500);
    }

    setMode("map");
    setActiveLevel(null);
    setSelection([]);
    setTypedClasses("");
    setRun(null);
    setErrors([]);
  }

  // Hydration guard
  if (!isClient) return null;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 text-white overflow-hidden">
      <EnhancedBackground />

      {/* Notifications */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        {notifications.map((n, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-lg text-white shadow-lg"
          >
            {n}
          </div>
        ))}
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <Header save={save} onNav={(m) => setMode(m)} />

        <div className="flex-1 overflow-hidden">
          {mode === "landing" && (
            <Landing
              onStart={() => setMode("map")}
              onEvents={() => setMode("events")}
            />
          )}
          {mode === "events" && <Events onBack={() => setMode("landing")} />}
          {mode === "map" && (
            <LevelMap
              current={save.currentLevel}
              onPlay={(id) => {
                // ensure we don't attempt to start a level beyond the authoritative unlocked stage
                if (id > save.currentLevel) {
                  setToast("Complete previous levels first!");
                  return;
                }
                startLevel(generateLevel(id));
              }}
              hearts={hearts}
              setHearts={setHearts}
              startHeartRestoreTimer={startHeartRestoreTimer}
              showNotification={showNotification}
              heartTimer={heartTimer}
            />
          )}
          {mode === "play" && activeLevel && (
            <Game
              level={activeLevel}
              selection={selection}
              setSelection={setSelection}
              typedClasses={typedClasses}
              setTypedClasses={setTypedClasses}
              onGiveUp={() => finishLevel(false)}
              onWin={() => finishLevel(true)}
              run={run}
              errors={errors}
              setErrors={setErrors}
              onError={detectErrors}
              hearts={hearts}
              setHearts={setHearts}
              startHeartRestoreTimer={startHeartRestoreTimer}
              showNotification={showNotification}
              setMode={setMode}
              heartTimer={heartTimer}
            />
          )}
        </div>

        <Footer save={save} next={nextLevel} />
      </div>

      <AnimatePresence>
        {levelUp && (
          <motion.div
            key="levelup"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 flex items-center justify-center z-[60] bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1.1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="px-12 py-8 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 shadow-2xl border-4 border-white/20 text-center"
            >
              <Confetti numberOfPieces={300} recycle={false} />
              <h2 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">
                🎉 Level Up! 🎉
              </h2>
              <p className="text-lg text-white/90">
                Great job — keep going to unlock new challenges!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-xl z-50"
            onAnimationComplete={() => setTimeout(() => setToast(null), 3000)}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Header({
  save,
  onNav,
}: {
  save: SaveData;
  onNav: (m: "landing" | "map" | "play" | "events") => void;
}) {
  const percent = Math.min(100, Math.floor(save.xp % 100));
  const currentStreak =
    save.history.length > 0
      ? (() => {
          let streak = 0;
          for (let i = save.history.length - 1; i >= 0; i--) {
            if (save.history[i].success) streak++;
            else break;
          }
          return streak;
        })()
      : 0;

  return (
    <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 shadow-lg flex items-center justify-center"
        >
          <span className="text-xs font-bold">T</span>
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          TailSpark Quest
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="opacity-80">
            Streak:{" "}
            <span className="font-semibold text-cyan-400">{currentStreak}</span>
          </div>
          <div className="opacity-80">
            Errors:{" "}
            <span className="font-semibold text-red-400">
              {save.totalErrors}
            </span>
          </div>
        </div>

        <div className="w-40">
          <div className="text-xs opacity-70 mb-1">XP {save.xp}</div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all duration-200"
            onClick={() => onNav("map")}
          >
            Map
          </button>
         <Link href="/events" passHref>
  <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all duration-200">
    Events
  </button>
</Link>
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all duration-200"
            onClick={() => onNav("landing")}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer({ save, next }: { save: SaveData; next: LevelDef }) {
  return (
    <div className="p-4 bg-black/20 backdrop-blur-xl border-t border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="opacity-75">
          Next: <span className="font-semibold text-cyan-400">#{next.id}</span>{" "}
          •
          <span className="uppercase font-semibold text-purple-400 ml-1">
            {next.type}
          </span>{" "}
          •
          <span className="font-semibold text-yellow-400 ml-1">
            ★{next.difficulty}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {save.achievements.slice(-3).map((a, i) => (
            <span
              key={`${a}-${i}`}
              className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/15 text-xs"
            >
              {ACHIEVEMENTS.find((ach) => ach.id === a)?.name}
            </span>
          ))}
          {save.achievements.length === 0 && (
            <span className="text-white/60">No achievements yet</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Landing({
  onStart,
  onEvents,
}: {
  onStart: () => void;
  onEvents: () => void;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-16"
      >
        <h2 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Master Tailwind
        </h2>
        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
          Build, craft, and perfect your CSS skills through endless challenges
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Endless Quest */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-xl border border-purple-500/30 p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
          onClick={onStart}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          <div className="relative z-10">
            <div className="w-16 h-16 mb-6 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Endless Quest
            </h3>
            <p className="text-gray-300 text-center mb-6">
              Infinite levels of increasing difficulty
            </p>
            <div className="text-center">
              <span className="bg-purple-500 text-white px-6 py-2 rounded-full font-semibold">
                Start Journey
              </span>
            </div>
          </div>
        </motion.div>

        {/* Events */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800/30 to-blue-800/30 backdrop-blur-xl border border-cyan-500/30 p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
          onClick={onEvents}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-600/20 to-cyan-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          <div className="relative z-10">
            <div className="w-16 h-16 mb-6 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Events
            </h3>
            <p className="text-gray-300 text-center mb-6">
              Special challenges and competitions
            </p>
            <div className="text-center">
              <span className="bg-cyan-500 text-white px-6 py-2 rounded-full font-semibold">
                View Events
              </span>
            </div>
          </div>
        </motion.div>

        {/* Open Playground */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800/30 to-teal-800/30 backdrop-blur-xl border border-emerald-500/30 p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-emerald-600/20 to-emerald-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

          <div className="relative z-10">
            <div className="w-16 h-16 mb-6 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Free Playground
            </h3>
            <p className="text-gray-300 text-center mb-6">
              Experiment with components and templates
            </p>
            <div className="text-center">
              <span className="bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold">
                Create Freely
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Events({ onBack }: { onBack: () => void }) {
  const events = [
    {
      title: "Speed Coding Challenge",
      description: "Complete 10 levels in under 5 minutes",
      reward: "500 XP + Speed Demon badge",
      timeLeft: "2 days",
      difficulty: "Hard",
    },
    {
      title: "Perfect Streak",
      description: "Win 15 levels without any errors",
      reward: "1000 XP + Perfectionist badge",
      timeLeft: "5 days",
      difficulty: "Expert",
    },
    {
      title: "Typography Master",
      description: "Complete all typography challenges",
      reward: "300 XP + Typography Expert badge",
      timeLeft: "1 week",
      difficulty: "Medium",
    },
  ];

  return (
            <div className="h-screen flex items-center justify-center text-white">
      Redirecting to Events...
      <meta httpEquiv="refresh" content="0; URL='/events'" />
    </div>
  );
}

function LevelMap({
  current,
  onPlay,
  hearts,
  setHearts,
  startHeartRestoreTimer,
  showNotification,
  heartTimer,
}: {
  current: number;
  onPlay: (id: number) => void;
  hearts?: number;
  setHearts?: React.Dispatch<React.SetStateAction<number>>;
  startHeartRestoreTimer?: () => void;
  showNotification?: (msg: string) => void;
  heartTimer?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [windowEnd, setWindowEnd] = useState(current + 30);

  useEffect(() => {
    const el = containerRef.current?.querySelector(`#node-${current}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current]);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const t = e.currentTarget;
    if (t.scrollTop + t.clientHeight >= t.scrollHeight - 200) {
      setWindowEnd((w) => w + 20);
    }
  }

  const nodes = Array.from({ length: windowEnd }, (_, i) => i + 1);

  return (
    <div
      className="h-full rounded-3xl relative overflow-auto bg-white/5 border border-white/10 m-4"
      onScroll={onScroll}
      ref={containerRef}
    >
      {/* Bottom-left Hearts/Lives display */}
      {typeof hearts === "number" && (
        <div className="fixed left-6 bottom-6 z-30 flex items-center gap-2 bg-black/40 border border-white/10 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl">
          {Array.from({ length: 3 }).map((_, i) => {
            const fullHearts = Math.floor(hearts);
            const hasHalf = hearts % 1 >= 0.5;
            const showHalfOn = fullHearts; // the next heart slot that may be half
            const timerTarget = Math.floor(Math.floor(hearts * 2) / 2); // which heart the next half will fill
            const showTimer =
              (heartTimer ?? 0) > 0 && hearts < 3 && i === timerTarget;
            return (
              <div
                key={i}
                className="relative flex items-center justify-center w-6 h-10"
              >
                {showTimer && (
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white">
                    {Math.ceil(heartTimer ?? 0)}s
                  </span>
                )}
                {/* base outline / full fill */}
                <svg
                  viewBox="0 0 24 24"
                  className={`w-6 h-6 ${
                    i < fullHearts ? "text-red-400" : "text-gray-700 opacity-30"
                  }`}
                  fill={i < fullHearts ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    d="M12 21s-6.712-5.385-9.364-9.037C-1.206 7.006 2.75 2.25 7.143 4.444A5.07 5.07 0 0112 8.232a5.07 5.07 0 014.857-3.788C21.25 2.25 25.206 7.006 21.364 11.963 18.712 15.615 12 21 12 21z"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                {/* half fill overlay */}
                {i === showHalfOn && hasHalf && (
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute inset-0 w-6 h-6 text-red-400"
                    fill="currentColor"
                    style={{ clipPath: "inset(0 50% 0 0)" }}
                    aria-hidden
                  >
                    <path d="M12 21s-6.712-5.385-9.364-9.037C-1.206 7.006 2.75 2.25 7.143 4.444A5.07 5.07 0 0112 8.232a5.07 5.07 0 014.857-3.788C21.25 2.25 25.206 7.006 21.364 11.963 18.712 15.615 12 21 12 21z" />
                  </svg>
                )}
              </div>
            );
          })}
          <span className="ml-2 text-sm text-white/70">Lives</span>
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,.08),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(34,211,238,.08),transparent_38%)]" />

      <div className="relative z-10 p-8">
        {/* Animated gradient border keyframes for current level */}
        <style>
          {`
            @keyframes gradientMove {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .animate-gradient {
              animation: gradientMove 4s linear infinite;
              background-clip: border-box;
            }
          `}
        </style>
        <div className="grid grid-cols-1 gap-8">
          {nodes.map((n) => {
            const locked = n > current;
            const level = generateLevel(n);
            const xOffset =
              n % 2 === 0 ? "md:translate-x-40" : "md:-translate-x-20";
            // Determine card className based on completion and locked status
            let cardClass =
              "relative rounded-3xl p-6 bg-white/8 border border-white/15 backdrop-blur-xl shadow-2xl";
            if (n < current) {
              cardClass =
                "relative rounded-3xl p-6 bg-white/8 border border-white/15 backdrop-blur-xl shadow-2xl transition-transform duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-pink-500/30 hover:to-purple-500/30";
            } else if (locked && n !== current) {
              cardClass =
                "relative rounded-3xl p-6 bg-white/8 border border-white/15 backdrop-blur-xl shadow-2xl transition-transform duration-300 hover:scale-105 hover:bg-white/10";
            }
            // Card content for easy wrapping
            const cardContent = (
              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl grid place-items-center font-bold text-lg ${
                        locked
                          ? "bg-white/5"
                          : "bg-gradient-to-br from-purple-500 to-cyan-500"
                      }`}
                    >
                      {n}
                    </div>
                    <div>
                      <div className="text-xl font-semibold mb-1">
                        Level {n} •{" "}
                        <span className="text-sm opacity-70 uppercase">
                          {level.type}
                        </span>
                      </div>
                      <div className="text-sm opacity-70 mb-2">
                        {level.description}
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            level.mode === "palette"
                              ? "bg-green-500/20 text-green-300"
                              : level.mode === "typing"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {level.mode}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">
                          ★{level.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm opacity-70">
                      <div>⏱ {level.timeLimit}s</div>
                      <div>{level.required.length} classes</div>
                    </div>
                    <button
                      onClick={() => onPlay(n)}
                      disabled={locked && n !== current}
                      className={`px-6 py-3 rounded-xl border font-semibold transition-all duration-200 ${
                        locked && n !== current
                          ? "opacity-40 cursor-not-allowed border-white/10"
                          : "border-white/20 hover:bg-white/10 hover:scale-105"
                      }`}
                    >
                      {n < current
                        ? "Replay"
                        : n === current
                        ? "Play"
                        : "Locked"}
                    </button>
                  </div>
                </div>
              </div>
            );
            return (
              <motion.div
                id={`node-${n}`}
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`relative mx-auto w-full md:w-2/3 ${xOffset}`}
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/0 via-white/5 to-cyan-500/0 blur-2xl rounded-3xl" />
                {n === current ? (
                  <div className="relative rounded-3xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-[length:200%_200%] animate-gradient">
                    <div className={cardClass}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-2xl grid place-items-center font-bold text-lg ${
                              locked
                                ? "bg-white/5"
                                : "bg-gradient-to-br from-purple-500 to-cyan-500"
                            }`}
                          >
                            {n}
                          </div>
                          <div>
                            <div className="text-xl font-semibold mb-1">
                              Level {n} •{" "}
                              <span className="text-sm opacity-70 uppercase">
                                {level.type}
                              </span>
                            </div>
                            <div className="text-sm opacity-70 mb-2">
                              {level.description}
                            </div>
                            <div className="flex gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  level.mode === "palette"
                                    ? "bg-green-500/20 text-green-300"
                                    : level.mode === "typing"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-purple-500/20 text-purple-300"
                                }`}
                              >
                                {level.mode}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">
                                ★{level.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm opacity-70">
                            <div>⏱ {level.timeLimit}s</div>
                            <div>{level.required.length} classes</div>
                          </div>
                          <button
                            onClick={() => onPlay(n)}
                            disabled={locked && n !== current}
                            className={`px-6 py-3 rounded-xl border font-semibold transition-all duration-200 ${
                              locked && n !== current
                                ? "opacity-40 cursor-not-allowed border-white/10"
                                : "border-white/20 hover:bg-white/10 hover:scale-105"
                            }`}
                          >
                            {n < current
                              ? "Replay"
                              : n === current
                              ? "Play"
                              : "Locked"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  cardContent
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Animated path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pathGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        {Array.from({ length: 20 }, (_, i) => (
          <motion.path
            key={i}
            d={`M ${i % 2 ? 20 : 80} ${i * 80} Q 50 ${i * 80 + 40} ${
              i % 2 ? 80 : 20
            } ${i * 80 + 80}`}
            stroke="url(#pathGrad)"
            strokeOpacity="0.1"
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.05 }}
          />
        ))}
      </svg>
    </div>
  );
}

function Game({
  level,
  selection,
  setSelection,
  typedClasses,
  setTypedClasses,
  onGiveUp,
  onWin,
  run,
  errors,
  setErrors,
  onError,
  hearts,
  setHearts,
  startHeartRestoreTimer,
  showNotification,
  setMode,
  heartTimer,
}: {
  level: LevelDef;
  selection: string[];
  setSelection: (v: string[]) => void;
  typedClasses: string;
  setTypedClasses: (v: string) => void;
  onGiveUp: () => void;
  onWin: () => void;
  run: RunStats | null;
  errors: string[];
  setErrors: (v: string[]) => void;
  onError: (classes: string[]) => string[];
  hearts?: number;
  setHearts?: React.Dispatch<React.SetStateAction<number>>;
  startHeartRestoreTimer?: () => void;
  showNotification?: (msg: string) => void;
  setMode?: React.Dispatch<
    React.SetStateAction<"landing" | "map" | "play" | "events">
  >;
  heartTimer?: number;
}) {
  const [wrongSelections, setWrongSelections] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [hinted, setHinted] = useState(false);
  const [failedPopup, setFailedPopup] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Dedicated state to track the number of correct options selected
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(level.timeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000) as any;
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [level.id]);

  useEffect(() => {
    if (timeLeft === 0) onGiveUp();
  }, [timeLeft]);

  const currentClasses =
    level.mode === "typing"
      ? typedClasses.split(" ").filter(Boolean)
      : selection;
  const newErrors = onError(currentClasses);

  useEffect(() => {
    setErrors(newErrors);
  }, [currentClasses]);

  useEffect(() => {
    const totalCorrectSelected = [
      ...new Set([
        ...selection.filter((c) => level.required.includes(c)),
        ...revealedHints.filter((c) => level.required.includes(c)),
      ]),
    ].length;

    setCorrectCount(totalCorrectSelected);

    if (totalCorrectSelected === level.required.length && (hearts ?? 1) > 0) {
      onWin();
    }
  }, [selection, revealedHints, hearts]);

  // Refactored toggleChip function to avoid setCorrectCount inside setSelection updater
  function toggleChip(c: string): void {
    const isCorrect = level.required.includes(c);
    const alreadySelected = selection.includes(c);

    if (alreadySelected) return;

    // If correct and not already revealed, update revealedHints first
    if (isCorrect && !revealedHints.includes(c)) {
      setRevealedHints((oldHints: string[]) =>
        oldHints.includes(c) ? oldHints : [...oldHints, c]
      );
    }

    if (isCorrect) {
      if (!selection.includes(c)) {
        setSelection([...selection, c]);
      }
    } else {
      // If this wrong option was never clicked before
      if (!wrongSelections.includes(c)) {
        setWrongSelections((prev) => [...prev, c]);

        if (
          typeof hearts === "number" &&
          setHearts &&
          startHeartRestoreTimer &&
          showNotification
        ) {
          setHearts((h) => Math.max(0, Math.round((h - 1) * 2) / 2));
          showNotification("You lost a heart!");
          startHeartRestoreTimer();
        }

        setPopupMessage(
          typeof hearts === "number" && hearts <= 1
            ? "You lost your last heart! Play other modes or wait for hearts to restore."
            : "Wrong selection! You lost a heart."
        );
        setFailedPopup(true);
      }
    }

    setTimeout(() => {
      const newErrors = onError([...selection, ...revealedHints]);
      setErrors(newErrors);
    }, 50);
  }

  const previewClasses = currentClasses.join(" ") || "text-white p-4";

  // Popup modal JSX
  const failedModal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-3xl p-8 bg-gradient-to-br from-purple-800/90 via-indigo-900/90 to-cyan-800/90 border-2 border-white/10 shadow-2xl max-w-xs w-full text-center">
        <div className="text-3xl font-extrabold text-white mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Level Failed!
        </div>
        <div className="mb-4 text-white/90 text-lg">
          {popupMessage && <p>{popupMessage}</p>}
        </div>
        <div className="flex gap-4 mt-6 justify-center">
          <button
            className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 text-white shadow-md"
            onClick={() => {
              setSelection([]);
              setTypedClasses("");
              setFailedPopup(false);
            }}
          >
            Try Again
          </button>
          <button
            className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400 transition-all duration-200 text-white shadow-md"
            onClick={() => {
              setFailedPopup(false);
              onGiveUp();
            }}
          >
            Go to Map
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Timer Bar */}
      <div className="w-full h-2 bg-black/20">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"
          animate={{ width: `${(timeLeft / level.timeLimit) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-6 p-6 overflow-hidden">
        {/* Left: Challenge & Preview */}
        <div className="space-y-4 overflow-y-auto">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Level {level.id}
                </h3>
                <p className="text-gray-300">{level.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-cyan-400">
                  {timeLeft}
                </div>
                <div className="text-xs opacity-70">seconds</div>
              </div>
            </div>

            {level.mode === "typing" && (
              <div className="mb-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-sm font-semibold text-blue-300 mb-2">
                  Type Challenge
                </div>
                <p className="text-sm text-gray-300">{level.challengeText}</p>
              </div>
            )}

            {/* Live Preview */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white/80">
                Live Preview
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-4 border border-white/10 min-h-[200px]">
                <motion.div
                  key={currentClasses.join(" ")}
                  className={previewClasses}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {level.targetElement === "button" && (
                    <button type="button">Click me!</button>
                  )}
                  {level.targetElement === "card" && (
                    <div>
                      <h4>Card Title</h4>
                      <p>This is card content that showcases your styling.</p>
                    </div>
                  )}
                  {level.targetElement === "navbar" && (
                    <nav>
                      <div>Logo</div>
                      <div>Home | About | Contact</div>
                    </nav>
                  )}
                  {level.targetElement === "hero" && (
                    <section>
                      <h1>Hero Title</h1>
                      <p>Amazing hero description goes here</p>
                    </section>
                  )}
                  {!["button", "card", "navbar", "hero"].includes(
                    level.targetElement
                  ) && (
                    <div>
                      <h4>Preview Element</h4>
                      <p>Your {level.targetElement} styling applied here</p>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="text-xs opacity-70 break-all bg-black/20 p-2 rounded-lg">
                Current: {currentClasses.join(" ") || "none"}
              </div>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="text-sm font-semibold text-red-300 mb-2">
                  Errors Detected:
                </div>
                {errors.map((error, i) => (
                  <div key={i} className="text-sm text-red-200">
                    • {error}
                  </div>
                ))}
              </div>
            )}

            {/* Required Classes Indicator */}
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm font-semibold text-white/80 mb-2">
                Required Classes ({level.required.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {level.required.map((req) => (
                  <span
                    key={req}
                    className={`px-2 py-1 rounded-lg text-xs border ${
                      currentClasses.includes(req)
                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                        : "bg-white/5 border-white/20 text-white/60"
                    }`}
                  >
                    {req} {currentClasses.includes(req) ? "✓" : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Input Method */}
        <div className="space-y-4 overflow-y-auto">
          {level.mode === "typing" || level.mode === "mixed" ? (
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="text-sm font-semibold text-white/80 mb-4">
                Type Classes
              </div>
              <textarea
                value={typedClasses}
                onChange={(e) => setTypedClasses(e.target.value)}
                placeholder="Type Tailwind classes separated by spaces..."
                className="w-full h-32 p-4 rounded-2xl bg-black/20 border border-white/20 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="mt-2 text-xs opacity-70">
                Tip: Separate classes with spaces, e.g., "flex items-center
                gap-4"
              </div>
            </div>
          ) : null}

          {level.mode === "palette" || level.mode === "mixed" ? (
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="text-sm font-semibold text-white/80 mb-4">
                Class Palette
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {level.palette.map((c) => {
                  const isRequired = level.required.includes(c);
                  const isCorrect =
                    selection.includes(c) || revealedHints.includes(c);
                  const isWrong = wrongSelections.includes(c);

                  return (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleChip(c)}
                      className={`relative text-xs px-3 py-2 rounded-xl border transition-all duration-200 ${
                        isCorrect
                          ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-white/30 shadow-lg"
                          : isWrong
                          ? "border-red-500 bg-red-500/10"
                          : "hover:bg-white/10 border-white/15 bg-white/5"
                      } ${isRequired ? "ring-1 ring-green-500/30" : ""}`}
                    >
                      {isCorrect ? "✓ " : ""}
                      <span
                        className={isWrong ? "line-through text-red-400" : ""}
                      >
                        {c}
                      </span>
                      {isWrong && (
                        <span className="absolute inset-x-2 top-1/2 border-t border-red-500 transform -translate-y-1/2"></span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Controls */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex gap-3 mb-4">
              <button
                onClick={onGiveUp}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
              >
                Give Up
              </button>
              <button
                onClick={() => {
                  // Deduct half a heart for hint usage
                  if (
                    typeof hearts === "number" &&
                    setHearts &&
                    startHeartRestoreTimer &&
                    showNotification
                  ) {
                    if (hearts > 0) {
                      setHearts((h) => {
                        const newHearts = h - 0.5;
                        if (newHearts < h) {
                          showNotification("Hint used! You lost half a heart.");
                          startHeartRestoreTimer();
                        }
                        return Math.max(0, Math.round(newHearts * 2) / 2);
                      });
                    }
                  }

                  // Reveal one unrevealed correct option as a hint
                  const remaining = level.required.filter(
                    (r) => !revealedHints.includes(r)
                  );
                  if (remaining.length > 0) {
                    const newHint = remaining[0];
                    setRevealedHints((prev) => [...prev, newHint]);
                    setHint(newHint); // only reveal the hint visually
                  }

                  setHinted(true);
                }}
                disabled={hinted}
                className="px-4 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 disabled:opacity-50 transition-all duration-200"
              >
                Hint
              </button>
              <button
                onClick={() => {
                  setSelection([]);
                  setTypedClasses("");
                  setWrongSelections([]);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all duration-200"
              >
                Clear
              </button>
            </div>

            {hinted && hint && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-sm text-yellow-300">
                  Hint: One required class is{" "}
                  <code className="bg-black/20 px-1 rounded">{hint}</code>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {correctCount}/{level.required.length}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                  animate={{}}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom-left Hearts/Lives display */}
      {typeof hearts === "number" && (
        <div className="fixed left-6 bottom-6 z-30 flex items-center gap-2 bg-black/40 border border-white/10 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl">
          {Array.from({ length: 3 }).map((_, i) => {
            const fullHearts = Math.floor(hearts);
            const hasHalf = hearts % 1 >= 0.5;
            const showHalfOn = fullHearts; // the next heart slot that may be half
            const timerTarget = Math.floor(Math.floor(hearts * 2) / 2); // which heart the next half will fill
            const showTimer =
              (heartTimer ?? 0) > 0 && hearts < 3 && i === timerTarget;
            return (
              <div
                key={i}
                className="relative flex items-center justify-center w-6 h-10"
              >
                {showTimer && (
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white">
                    {Math.ceil(heartTimer ?? 0)}s
                  </span>
                )}
                {/* base outline / full fill */}
                <svg
                  viewBox="0 0 24 24"
                  className={`w-6 h-6 ${
                    i < fullHearts ? "text-red-400" : "text-gray-700 opacity-30"
                  }`}
                  fill={i < fullHearts ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    d="M12 21s-6.712-5.385-9.364-9.037C-1.206 7.006 2.75 2.25 7.143 4.444A5.07 5.07 0 0112 8.232a5.07 5.07 0 014.857-3.788C21.25 2.25 25.206 7.006 21.364 11.963 18.712 15.615 12 21 12 21z"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                {/* half fill overlay */}
                {i === showHalfOn && hasHalf && (
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute inset-0 w-6 h-6 text-red-400"
                    fill="currentColor"
                    style={{ clipPath: "inset(0 50% 0 0)" }}
                    aria-hidden
                  >
                    <path d="M12 21s-6.712-5.385-9.364-9.037C-1.206 7.006 2.75 2.25 7.143 4.444A5.07 5.07 0 0112 8.232a5.07 5.07 0 014.857-3.788C21.25 2.25 25.206 7.006 21.364 11.963 18.712 15.615 12 21 12 21z" />
                  </svg>
                )}
              </div>
            );
          })}
          <span className="ml-2 text-sm text-white/70">Lives</span>
        </div>
      )}
      {/* Unified popup for heart loss or out-of-hearts */}
      {(failedPopup ||
        (typeof hearts === "number" && hearts <= 0 && setMode)) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-3xl p-8 bg-gradient-to-br from-purple-800/90 via-indigo-900/90 to-cyan-800/90 border-2 border-white/10 shadow-2xl max-w-xs w-full text-center">
            <div className="text-3xl font-extrabold text-red-400 mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {typeof hearts === "number" && hearts <= 0
                ? "Out of Hearts!"
                : "Oops!"}
            </div>
            <div className="mb-4 text-white/90 text-lg">
              {typeof hearts === "number" && hearts <= 0 ? (
                <>
                  You ran out of hearts.
                  <br />
                  Play other modes or wait for hearts to restore.
                </>
              ) : (
                popupMessage && <p>{popupMessage}</p>
              )}
            </div>
            <div className="flex gap-4 mt-6 justify-center">
              {typeof hearts === "number" && hearts <= 0 && setMode ? (
                <button
                  className="px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 text-white shadow-md"
                  onClick={() => setMode("map")}
                >
                  Go to Level Map
                </button>
              ) : (
                <>
                  <button
                    className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 text-white shadow-md"
                    onClick={() => {
                      setSelection([]);
                      setTypedClasses("");
                      setFailedPopup(false);
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400 transition-all duration-200 text-white shadow-md"
                    onClick={() => {
                      setFailedPopup(false);
                      setWrongSelections([]);
                      onGiveUp();
                    }}
                  >
                    Go to Map
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EnhancedBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Hydration-safe: particles are generated only on client in useEffect
  const [particles, setParticles] = useState<
    { left: string; top: string; duration: number; delay: number }[]
  >([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 100 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 3,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Mouse follower */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: mousePos.x - 192,
          y: mousePos.y - 192,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{ left: p.left, top: p.top }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Geometric shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-purple-500/20 rounded-2xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Gradient blobs */}
      <div className="absolute -top-24 -left-24 w-[40rem] h-[40rem] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-24 -right-24 w-[40rem] h-[40rem] bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-pink-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}

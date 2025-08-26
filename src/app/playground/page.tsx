"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  currentLevel: number;
  xp: number;
  bestStreak: number;
  achievements: string[];
  longestLevelId?: number;
  longestLevelMs?: number;
  history: RunStats[];
  totalErrors: number;
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
  const [save, setSave] = useState<SaveData>(DEFAULT_SAVE);
  const [mode, setMode] = useState<"landing" | "map" | "play" | "events">(
    "landing"
  );
  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [typedClasses, setTypedClasses] = useState("");
  const [run, setRun] = useState<RunStats | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => setSave(loadSave()), []);
  useEffect(() => storeSave(save), [save]);

  const nextLevel = useMemo(
    () => generateLevel(save.currentLevel),
    [save.currentLevel]
  );

  function startLevel(level: LevelDef) {
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
    if (
      classStr.match(/text-\w+-\d+/) &&
      classStr.match(/bg-\w+-\d+/) &&
      classStr.includes(classStr.match(/text-(\w+)-\d+/)?.[1] || "") ===
        classStr.includes(classStr.match(/bg-(\w+)-\d+/)?.[1] || "")
    ) {
      errors.push("Consider contrast between text and background colors");
    }

    return errors;
  }

  function finishLevel(success: boolean) {
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

    let nextSave: SaveData = {
      ...save,
      xp: save.xp + gained,
      bestStreak: Math.max(save.bestStreak, streakNow),
      history: newHistory,
      totalErrors: save.totalErrors + errors.length,
      currentLevel:
        success && activeLevel.id === save.currentLevel
          ? save.currentLevel + 1
          : save.currentLevel,
    };

    // Check achievements
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
    }

    setSave(nextSave);
    setMode("map");
    setActiveLevel(null);
    setSelection([]);
    setTypedClasses("");
    setRun(null);
    setErrors([]);
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 text-white overflow-hidden">
      <EnhancedBackground />

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
              onPlay={(id) => startLevel(generateLevel(id))}
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
            />
          )}
        </div>

        <Footer save={save} next={nextLevel} />
      </div>

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
          <button
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all duration-200"
            onClick={() => onNav("events")}
          >
            Events
          </button>
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
          {save.achievements.slice(-3).map((a) => (
            <span
              key={a}
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
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Special Events
          </h2>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15"
          >
            ← Back
          </button>
        </div>

        <div className="grid gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-300">{event.description}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                      event.difficulty === "Hard"
                        ? "bg-red-500/20 text-red-300"
                        : event.difficulty === "Expert"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {event.difficulty}
                  </div>
                  <div className="text-sm text-cyan-400 font-semibold">
                    {event.timeLeft}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-green-400 font-semibold">
                  {event.reward}
                </div>
                <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-300">
                  Join Event
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LevelMap({
  current,
  onPlay,
}: {
  current: number;
  onPlay: (id: number) => void;
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
}) {
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [hinted, setHinted] = useState(false);
  const [failedPopup, setFailedPopup] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current && clearInterval(timerRef.current as any);
    setTimeLeft(level.timeLimit);
    timerRef.current = setInterval(
      () => setTimeLeft((t) => (t > 0 ? t - 1 : 0)),
      1000
    ) as any;
    return () => timerRef.current && clearInterval(timerRef.current as any);
  }, [level.id]);

  useEffect(() => {
    if (timeLeft === 0) onGiveUp();
  }, [timeLeft]);

  const currentClasses =
    level.mode === "typing"
      ? typedClasses.split(" ").filter(Boolean)
      : selection;
  const hasAll = level.required.every((r) => currentClasses.includes(r));
  const newErrors = onError(currentClasses);

  useEffect(() => {
    setErrors(newErrors);
  }, [currentClasses]);

  useEffect(() => {
    if (hasAll && newErrors.length === 0) onWin();
  }, [hasAll, newErrors]);

  function toggleChip(c: string) {
    const isCorrect = level.required.includes(c);
    const alreadySelected = selection.includes(c);

    if (alreadySelected) {
      setSelection((sel) => sel.filter((x) => x !== c));
      return;
    }

    if (!isCorrect) {
      // Wrong selection → show failed popup modal
      const remaining = level.required.filter(
        (r) => !revealedHints.includes(r) && !selection.includes(r)
      );

      if (remaining.length === 1) {
        // Only one correct option left unchosen
        setPopupMessage(
          "Give it one more try!\nJust 1 correct option left to choose."
        );
      } else if (remaining.length > 1) {
        const newHint = remaining[0];
        setRevealedHints([...revealedHints, newHint]);
        setPopupMessage(`Hint: Try using "${newHint}"`);
      } else {
        setPopupMessage("Incorrect choice, try again");
      }

      setFailedPopup(true);
      return;
    }

    if (selection.length >= level.required.length) return; // Limit by required classes

    const newSelection = [...selection, c];
    setSelection(newSelection);

    // If user has selected all required correct options, win immediately
    if (
      newSelection.length === level.required.length &&
      level.required.every((r) => newSelection.includes(r))
    ) {
      onWin();
    }
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
                  const active = selection.includes(c);
                  const isRequired = level.required.includes(c);
                  return (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleChip(c)}
                      className={`text-xs px-3 py-2 rounded-xl border transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-white/30 shadow-lg"
                          : "hover:bg-white/10 border-white/15 bg-white/5"
                      } ${isRequired ? "ring-1 ring-green-500/30" : ""}`}
                    >
                      {active ? "✓ " : ""}
                      {c}
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
                  // Reveal one unrevealed correct option as a hint
                  const remaining = level.required.filter(r => !revealedHints.includes(r));
                  if (remaining.length > 0) {
                    const newHint = remaining[0];
                    setRevealedHints([...revealedHints, newHint]);
                    setHint(newHint); // store current hint
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
                  <code className="bg-black/20 px-1 rounded">
                    {hint}
                  </code>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {
                    currentClasses.filter((c) => level.required.includes(c))
                      .length
                  }
                  /{level.required.length}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                  animate={{
                    width: `${
                      (currentClasses.filter((c) => level.required.includes(c))
                        .length /
                        level.required.length) *
                      100
                    }%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Failed popup modal */}
      {failedPopup && failedModal}
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

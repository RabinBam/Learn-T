"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
  useRef,
} from "react";
import {
  Star,
  Zap,
  Heart,
  Trophy,
  Lightbulb,
  Flame,
  Target,
  Award,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Map as MapIcon,
  Mountain,
  Trees,
  Waves,
  Snowflake,
  Skull,
  BookOpen,
  Code,
  ChevronRight,
  ChevronLeft,
  Shield,
} from "lucide-react";

/* ----------------------------------------------------------------
   TYPES
----------------------------------------------------------------- */

type GameStatus = "playing" | "passed" | "failed";

interface Particle {
  id: number;
  x: number; // 0..100 viewport %
  y: number; // 0..100 viewport %
  vx: number;
  vy: number;
  life: number; // ms remaining
  color: string; // tailwind text color class
}

interface LevelRegion {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; // gradient class like "from-green-600 to-green-800"
  bgColor: string; // bg class like "bg-green-900"
}

interface LevelData {
  task: string;
  solution: string;
  hint: string;
  tutorial?: string;
  component: "text" | "div" | "button" | "card";
  baseClasses: string;
  parentClasses?: string;
  content: string;
  description: string;
  level: number;
  maxTime: number;
  points: number;
  region: LevelRegion;
  tier: number;
}

interface MapPoint {
  level: number;
  x: number; // 0..100 %
  y: number; // 0..100 %
  region: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  completed: boolean;
  current: boolean;
  available: boolean;
  angle: number; // degrees for a roadway node
}

/* ----------------------------------------------------------------
   REGION + LEVEL GENERATION
----------------------------------------------------------------- */

const getRegionForLevel = (level: number): LevelRegion => {
  if (level <= 10)
    return {
      name: "Beginner Woods",
      icon: Trees,
      color: "from-green-600 to-green-800",
      bgColor: "bg-green-900",
    };
  if (level <= 25)
    return {
      name: "Styling Plains",
      icon: Mountain,
      color: "from-yellow-600 to-orange-800",
      bgColor: "bg-orange-900",
    };
  if (level <= 50)
    return {
      name: "Responsive Desert",
      icon: Target,
      color: "from-orange-600 to-red-800",
      bgColor: "bg-red-900",
    };
  if (level <= 75)
    return {
      name: "Animation Valley",
      icon: Zap,
      color: "from-purple-600 to-purple-800",
      bgColor: "bg-purple-900",
    };
  if (level <= 100)
    return {
      name: "Grid Mountains",
      icon: Mountain,
      color: "from-blue-600 to-blue-800",
      bgColor: "bg-blue-900",
    };
  if (level <= 150)
    return {
      name: "Flexbox Ocean",
      icon: Waves,
      color: "from-cyan-600 to-blue-800",
      bgColor: "bg-cyan-900",
    };
  if (level <= 200)
    return {
      name: "Transform Peaks",
      icon: Snowflake,
      color: "from-indigo-600 to-indigo-800",
      bgColor: "bg-indigo-900",
    };
  return {
    name: "Master Nightmare",
    icon: Skull,
    color: "from-gray-600 to-black",
    bgColor: "bg-gray-900",
  };
};

const BASE_TEMPLATES: Omit<
  LevelData,
  "level" | "maxTime" | "points" | "region" | "tier"
>[] = [
  {
    task: "Make this text blue",
    solution: "text-blue-500",
    hint: "Use text-[color]-[intensity]. Try text-blue-500",
    tutorial:
      "In Tailwind CSS, you style text color with text-[color]-[intensity].",
    component: "text",
    baseClasses: "text-2xl font-bold",
    content: "Hello World",
    description: "Change the text color to blue.",
  },
  {
    task: "Center this content with flexbox",
    solution: "flex items-center justify-center",
    hint: "Use flex items-center justify-center to center both ways.",
    component: "div",
    baseClasses: "h-32 bg-gray-100 border-2 border-dashed border-gray-400",
    content: "I'm centered!",
    description: "Use flexbox to center content both ways.",
  },
  {
    task: "Create a card with rounded corners, padding and shadow",
    solution: "p-6 rounded-xl shadow-lg",
    hint: "Combine padding (p-), rounded- and shadow utilities.",
    component: "card",
    baseClasses: "bg-white/90 max-w-sm text-gray-900",
    content: "Beautiful Card Component",
    description: "Modern card styling.",
  },
  {
    task: "Make the text responsive",
    solution: "text-base md:text-xl lg:text-2xl",
    hint: "Use breakpoint prefixes like md: and lg: to change sizes.",
    component: "text",
    baseClasses: "font-semibold",
    content: "Resize the window to see changes",
    description: "Responsive font sizing.",
  },
  {
    task: "Add a subtle hover effect",
    solution: "transition hover:scale-105",
    hint: "Use transition and hover:scale-105 for a pleasant effect.",
    component: "button",
    baseClasses:
      "px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600",
    content: "Hover Me",
    description: "Add scale transform on hover.",
  },
  {
    task: "Build a simple 2-column grid",
    solution: "grid grid-cols-2 gap-4",
    hint: "Use grid + grid-cols-2 + gap utilities.",
    component: "div",
    baseClasses: "bg-white/10 p-4 rounded-xl",
    content: "A B C D",
    description: "Basic grid layout.",
  },
  {
    task: "Create a glassmorphism effect",
    solution: "backdrop-blur-md bg-white/10 border border-white/20",
    hint: "Combine backdrop-blur, translucent bg, and a light border.",
    component: "card",
    baseClasses: "p-6 rounded-2xl text-white",
    content: "Frosted Glass Card",
    description: "Glass UI effect.",
  },
  {
    task: "Add focus ring for accessibility",
    solution: "focus:ring-4 focus:ring-purple-300",
    hint: "Use focus:ring-* utilities for keyboard focus.",
    component: "button",
    baseClasses: "px-5 py-2 rounded-lg bg-purple-600 outline-none transition",
    content: "Focusable",
    description: "Accessible button with visible focus.",
  },
];

const generateLevel = (level: number): LevelData => {
  const idx = (level - 1) % BASE_TEMPLATES.length;
  const tier = Math.floor((level - 1) / BASE_TEMPLATES.length) + 1;
  const base = BASE_TEMPLATES[idx];

  let solution = base.solution;
  let task = base.task;

  // Add difficulty modifiers for higher tiers (kept modest to avoid confusion)
  if (tier > 1) {
    const mods = [
      "motion-safe:animate-pulse",
      "dark:text-white",
      "hover:shadow-2xl",
    ];
    solution = `${solution} ${mods.slice(0, Math.min(2, tier - 1)).join(" ")}`;
    task = `${task} (Tier ${tier})`;
  }

  return {
    ...base,
    solution,
    task,
    level,
    maxTime: Math.max(45, 180 - level * 2),
    points: 120 + (tier - 1) * 150,
    region: getRegionForLevel(level),
    tier,
  };
};

/* ----------------------------------------------------------------
   UTILS
----------------------------------------------------------------- */

const tw = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/* ----------------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------------- */

const TailwindQuestPage: React.FC = () => {
  // Core game state
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentLevelData, setCurrentLevelData] = useState<LevelData>(() =>
    generateLevel(1)
  );
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [experience, setExperience] = useState<number>(0);
  const [hints, setHints] = useState<number>(3);

  const [playerCode, setPlayerCode] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [timeLeft, setTimeLeft] = useState<number>(currentLevelData.maxTime);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);

  const [showMap, setShowMap] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(
    () => new Set()
  );
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  // Visuals
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Map scrolling / roadway feeling (infinite-like)
  const [mapOffset, setMapOffset] = useState<number>(0); // 0..100 scroll %
  const containerRef = useRef<HTMLDivElement | null>(null);

  /* --------------------------------------------------------------
     MAP POINTS (procedural, roadway-like path)
  ---------------------------------------------------------------- */
  const mapPoints: MapPoint[] = useMemo(() => {
    const points: MapPoint[] = [];
    const totalVisible = 24; // Show a chunk; more levels exist virtually
    const baseLevel = Math.max(1, currentLevel - 6);

    let x = 10 + (mapOffset % 20); // small drift
    let y = 10;

    for (let i = 0; i < totalVisible; i++) {
      const lvl = baseLevel + i;
      const region = getRegionForLevel(lvl);

      // serpentine roadway path
      const angle = (i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 5);
      x += (i % 2 === 0 ? 12 : -12) + Math.sin(i / 2) * 2;
      y += 8 + Math.cos(i / 3) * 2;

      x = clamp(x, 8, 92);
      y = clamp(y, 6, 92);

      points.push({
        level: lvl,
        x,
        y,
        region: region.name,
        icon: region.icon,
        color: region.color,
        bgColor: region.bgColor,
        completed: completedLevels.has(lvl),
        current: lvl === currentLevel,
        available: lvl <= currentLevel + 1, // only navigate ahead by one
        angle,
      });
    }
    return points;
  }, [currentLevel, completedLevels, mapOffset]);

  /* --------------------------------------------------------------
     PARTICLES / CONFETTI
  ---------------------------------------------------------------- */
  const spawnParticles = useCallback((count = 24) => {
    const palette = [
      "text-yellow-400",
      "text-purple-400",
      "text-pink-400",
      "text-blue-400",
      "text-green-400",
      "text-red-400",
    ];
    const now = Date.now();
    const fresh: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 0.6;
      return {
        id: now + i,
        x: 50,
        y: 40 + Math.random() * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1200 + Math.random() * 1000,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    });
    setParticles((prev) => [...prev, ...fresh]);
  }, []);

  // Particle decay
  useEffect(() => {
    if (!particles.length) return;
    const start = performance.now();
    let raf = 0;

    const step = (t: number) => {
      const dt = t - start; // ms since starting the frame series
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 1.6,
            y: p.y + p.vy * 1.6,
            vy: p.vy + 0.015, // gravity
            life: p.life - 16,
          }))
          .filter((p) => p.life > 0 && p.x >= -5 && p.x <= 105 && p.y <= 110)
      );
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [particles.length]);

  /* --------------------------------------------------------------
     TIMER
  ---------------------------------------------------------------- */
  useEffect(() => {
    if (showMap || gameStatus !== "playing") return;
    if (timeLeft <= 0) {
      setGameStatus("failed");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameStatus, showMap]);

  /* --------------------------------------------------------------
     CORE GAME ACTIONS
  ---------------------------------------------------------------- */
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*/g, ";");

  const checkSolution = () => {
    const a = normalize(playerCode);
    const b = normalize(currentLevelData.solution);
    if (a === b) {
      onSuccess();
    } else {
      onWrong();
    }
  };

  const onSuccess = () => {
    setIsAnimating(true);
    spawnParticles(36);
    setGameStatus("passed");
    setScore((p) => p + currentLevelData.points + Math.max(0, streak) * 100);
    setStreak((p) => p + 1);
    setExperience((p) => p + 20 + currentLevelData.tier * 10);
    setWrongAttempts(0);
    setCompletedLevels((prev) => new Set([...prev, currentLevel]));

    const earned: string[] = [];
    if (streak + 1 === 3) earned.push("🔥 Trifecta Streak!");
    if (streak + 1 === 5) earned.push("⚡ Lightning Learner!");
    if (timeLeft > Math.floor(currentLevelData.maxTime * 0.8))
      earned.push("⏱️ Speed Runner!");
    if (currentLevel % 10 === 0) earned.push("🏅 Milestone Master!");
    if (earned.length) setAchievements((p) => [...p, ...earned]);

    // proceed after small celebration
    window.setTimeout(() => {
      setIsAnimating(false);
      goToNextLevel();
    }, 1500);
  };

  const onWrong = () => {
    setWrongAttempts((p) => p + 1);
    setStreak(0);
    if (wrongAttempts + 1 >= 2) {
      setLives((p) => p - 1);
      if (lives - 1 <= 0) {
        setGameStatus("failed");
        return;
      }
    }
    setIsAnimating(true);
    window.setTimeout(() => setIsAnimating(false), 400);
  };

  const goToNextLevel = () => {
    const lvl = currentLevel + 1;
    setCurrentLevel(lvl);
    const data = generateLevel(lvl);
    setCurrentLevelData(data);
    setTimeLeft(data.maxTime);
    setPlayerCode("");
    setGameStatus("playing");
    setShowHint(false);
    setShowMap(true); // switch back to map after winning
  };

  const restartGame = () => {
    const data = generateLevel(1);
    setCurrentLevel(1);
    setCurrentLevelData(data);
    setScore(0);
    setLives(3);
    setStreak(0);
    setExperience(0);
    setHints(3);
    setPlayerCode("");
    setGameStatus("playing");
    setWrongAttempts(0);
    setAchievements([]);
    setCompletedLevels(new Set());
    setTimeLeft(data.maxTime);
    setShowMap(true);
  };

  const selectLevelFromMap = (lvl: number) => {
    // Only allow selecting current or next level
    if (lvl > currentLevel + 1) return;
    setCurrentLevel(lvl);
    const data = generateLevel(lvl);
    setCurrentLevelData(data);
    setTimeLeft(data.maxTime);
    setPlayerCode("");
    setGameStatus("playing");
    setShowHint(false);
    setShowMap(false);
  };

  const useAHint = () => {
    if (hints <= 0) return;
    setHints((p) => p - 1);
    setShowHint(true);
  };

  /* --------------------------------------------------------------
     UI SUBCOMPONENTS
  ---------------------------------------------------------------- */

  const StatPill: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number | string;
    title?: string;
  }> = ({ icon: Icon, label, value, title }) => (
    <div
      className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 backdrop-blur"
      title={title}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs text-white/70">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );

  const TopBar = () => (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowMap((s) => !s)}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-semibold shadow-lg shadow-blue-500/20 ring-1 ring-white/10 hover:opacity-90"
        >
          {showMap ? "Start Quest" : "View Map"}
        </button>
        <button
          onClick={restartGame}
          className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 hover:bg-white/15"
          title="Restart"
        >
          Restart
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatPill icon={Star} label="Score" value={score} />
        <StatPill icon={Heart} label="Lives" value={lives} />
        <StatPill icon={Flame} label="Streak" value={streak} />
        <StatPill icon={Trophy} label="XP" value={experience} />
        <StatPill icon={Lightbulb} label="Hints" value={hints} />
        {!showMap && gameStatus === "playing" && (
          <StatPill icon={Clock} label="Time" value={`${timeLeft}s`} />
        )}
      </div>
    </div>
  );

  const RegionBadge: React.FC<{ region: LevelRegion }> = ({ region }) => {
    const Icon = region.icon;
    return (
      <div
        className={tw(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white",
          "bg-gradient-to-r",
          region.color,
          "ring-1 ring-white/10 shadow"
        )}
      >
        <Icon className="h-4 w-4" />
        {region.name}
      </div>
    );
  };

  const PreviewBox: React.FC<{ level: LevelData }> = ({ level }) => {
    const cls = tw(level.baseClasses, playerCode || "");
    const parent = tw(
      "rounded-xl p-4 bg-white/5 ring-1 ring-white/10 min-h-[140px] flex items-center justify-center",
      level.parentClasses
    );

    const ContentSwitch = () => {
      switch (level.component) {
        case "text":
          return <div className={cls}>{level.content}</div>;
        case "button":
          return <button className={cls}>{level.content}</button>;
        case "card":
          return (
            <div className={tw("rounded-2xl", cls)}>
              <div className="text-lg font-semibold">Card</div>
              <div className="text-sm text-gray-700/90 dark:text-white/80">
                {level.content}
              </div>
            </div>
          );
        default:
          return <div className={cls}>{level.content}</div>;
      }
    };

    return (
      <div className={parent}>
        <ContentSwitch />
      </div>
    );
  };

  const AchievementToasts: React.FC = () => {
    if (!achievements.length) return null;
    return (
      <div className="pointer-events-none fixed right-4 top-20 z-40 flex w-72 flex-col gap-2">
        {[...achievements.slice(-3)].map((a, idx) => (
          <div
            key={`${a}-${idx}`}
            className="animate-in slide-in-from-right fade-in rounded-xl border border-white/10 bg-white/10 p-3 text-sm backdrop-blur"
          >
            <div className="flex items-center gap-2 font-semibold">
              <Award className="h-4 w-4" />
              Achievement unlocked!
            </div>
            <div className="text-white/90">{a}</div>
          </div>
        ))}
      </div>
    );
  };

  const ParticlesLayer: React.FC = () => {
    if (!particles.length) return null;
    return (
      <div className="pointer-events-none fixed inset-0 z-30">
        {particles.map((p) => (
          <div
            key={p.id}
            className={tw("absolute select-none", p.color)}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: Math.max(0, Math.min(1, p.life / 1200)),
            }}
          >
            <Sparkles className="h-4 w-4 drop-shadow" />
          </div>
        ))}
      </div>
    );
  };

  const RoadwaySVG: React.FC<{ points: MapPoint[] }> = ({ points }) => {
    if (points.length < 2) return null;

    // Build a smooth curve through the points using cubic Bézier
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      d += ` Q ${midX},${midY} ${curr.x},${curr.y}`;
    }

    return (
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="candyPath" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" /> {/* blue */}
            <stop offset="50%" stopColor="#a855f7" /> {/* purple */}
            <stop offset="100%" stopColor="#f472b6" />
            {/* pink */}
          </linearGradient>
        </defs>

        {/* Glowing background stroke */}
        <path
          d={d}
          fill="none"
          stroke="white"
          strokeOpacity="0.15"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Main colorful path */}
        <path
          d={d}
          fill="none"
          stroke="url(#candyPath)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-lg"
        />
      </svg>
    );
  };

  const MapGrid: React.FC = () => {
    return (
      <div className="relative mx-auto my-4 h-[520px] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-950/70 to-gray-900/60 p-3 backdrop-blur">
        <div className="relative h-full w-full rounded-xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent">
          <RoadwaySVG points={mapPoints} />
          {mapPoints.map((pt) => {
            const Icon = pt.icon;
            return (
              <button
                key={pt.level}
                onMouseEnter={() => setHoveredLevel(pt.level)}
                onMouseLeave={() => setHoveredLevel(null)}
                onClick={() => selectLevelFromMap(pt.level)}
                disabled={!pt.available}
                className={tw(
                  "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold transition",
                  pt.available
                    ? "hover:scale-105 hover:bg-white/10"
                    : "opacity-50 cursor-not-allowed"
                )}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                title={
                  pt.current
                    ? `Level ${pt.level} (current)`
                    : pt.completed
                    ? `Level ${pt.level} (completed)`
                    : `Level ${pt.level}`
                }
              >
                <div
                  className={tw(
                    "rounded-lg border px-2 py-1 ring-1",
                    pt.completed
                      ? "bg-emerald-500/25 border-emerald-400/30 ring-emerald-300/20"
                      : pt.current
                      ? "bg-yellow-500/25 border-yellow-400/30 ring-yellow-300/20"
                      : "bg-white/10 border-white/10 ring-white/10"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5" />
                    <span>Lv {pt.level}</span>
                  </div>
                </div>
                {hoveredLevel === pt.level && (
                  <div className="rounded-md bg-black/70 px-2 py-1 text-[10px]">
                    {pt.region}
                  </div>
                )}
              </button>
            );
          })}

          {/* Map Controls */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <button
              onClick={() => setMapOffset((o) => o - 5)}
              className="rounded-md bg-white/10 p-2 ring-1 ring-white/15 hover:bg-white/15"
              title="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMapOffset((o) => o + 5)}
              className="rounded-md bg-white/10 p-2 ring-1 ring-white/15 hover:bg-white/15"
              title="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Region banner for current */}
          <div className="absolute right-3 top-3">
            <RegionBadge region={currentLevelData.region} />
          </div>
        </div>
      </div>
    );
  };

  const LevelPanel: React.FC = () => {
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 p-4 lg:grid-cols-2">
        {/* Left: Brief + Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/10">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                Level {currentLevel}: {currentLevelData.task}
              </h2>
            </div>
            <p className="text-sm text-white/80">
              {currentLevelData.description}
            </p>
            <div className="mt-2">
              <RegionBadge region={currentLevelData.region} />
            </div>
          </div>

          <PreviewBox level={currentLevelData} />
        </div>

        {/* Right: Editor + Actions */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/10">
            <div className="mb-3 flex items-center gap-2">
              <Code className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Your Classes</h3>
            </div>
            <input
              type="text"
              value={playerCode}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPlayerCode(e.target.value)
              }
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") checkSolution();
              }}
              placeholder="Enter Tailwind classes here… (e.g., text-blue-500)"
              className={tw(
                "w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none ring-1 ring-inset ring-white/10",
                "focus:ring-2 focus:ring-purple-400/50"
              )}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={checkSolution}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-semibold shadow-lg shadow-purple-500/20 ring-1 ring-white/10 hover:opacity-90"
              >
                Submit
              </button>
              <button
                onClick={useAHint}
                className="rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/15 hover:bg-white/15"
                disabled={hints <= 0}
                title="Use a hint"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Hint ({hints})
                </div>
              </button>
              <button
                onClick={() => setShowMap(true)}
                className="rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/15 hover:bg-white/15"
                title="Back to map"
              >
                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4" />
                  Map
                </div>
              </button>
            </div>

            {showHint && (
              <div className="mt-3 rounded-xl border border-yellow-300/20 bg-yellow-400/10 p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <Lightbulb className="h-4 w-4" />
                  Hint
                </div>
                <div className="text-white/90">{currentLevelData.hint}</div>
              </div>
            )}

            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="mb-1 font-semibold">Target Solution</div>
              <div className="select-none text-white/70">
                {currentLevelData.solution}
              </div>
              {currentLevelData.tutorial && (
                <div className="mt-2 text-white/80">
                  <span className="font-semibold">Tutorial:</span>{" "}
                  {currentLevelData.tutorial}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div
            className={tw(
              "flex items-center justify-between rounded-2xl border border-white/10 p-4 ring-1 ring-white/10",
              gameStatus === "passed"
                ? "bg-emerald-500/10"
                : gameStatus === "failed"
                ? "bg-rose-500/10"
                : "bg-white/5"
            )}
          >
            <div className="flex items-center gap-2">
              {gameStatus === "passed" && (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="font-semibold text-emerald-200">
                    Passed!
                  </span>
                </>
              )}
              {gameStatus === "failed" && (
                <>
                  <XCircle className="h-5 w-5 text-rose-400" />
                  <span className="font-semibold text-rose-200">Failed</span>
                </>
              )}
              {gameStatus === "playing" && (
                <>
                  <Shield className="h-5 w-5 text-white/80" />
                  <span className="font-semibold text-white/80">Playing</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {gameStatus !== "failed" ? (
                <button
                  onClick={goToNextLevel}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 hover:bg-white/15"
                >
                  Skip to Next
                </button>
              ) : (
                <button
                  onClick={restartGame}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 hover:bg-white/15"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* --------------------------------------------------------------
     RENDER
  ---------------------------------------------------------------- */
  return (
    <div
      ref={containerRef}
      className={tw(
        "min-h-screen text-white",
        "bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(124,58,237,0.25),transparent),radial-gradient(1200px_600px_at_90%_20%,rgba(37,99,235,0.25),transparent),linear-gradient(135deg,#0b0b12,#0f0820_45%,#0a1223_100%)]"
      )}
    >
      <TopBar />
      <AchievementToasts />
      <ParticlesLayer />

      {/* Header */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Tailwind Quest
          </h1>
          <p className="text-sm text-white/70">
            Learn Tailwind CSS with tiny levels. Navigate the map and conquer
            challenges!
          </p>
        </div>
        <div className="hidden gap-2 md:flex">
          <RegionBadge region={currentLevelData.region} />
        </div>
      </div>

      {/* Map or Level */}
      <div className="mt-4">
        {showMap ? (
          <>
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
              <div className="flex items-center gap-2 text-white/80">
                <MapIcon className="h-5 w-5" />
                <span className="font-semibold">World Map</span>
              </div>
              <div className="text-sm text-white/70">
                Levels completed: {completedLevels.size}
              </div>
            </div>
            <MapGrid />
          </>
        ) : (
          <LevelPanel />
        )}
      </div>

      {/* Footer */}
      <div className="mx-auto mt-8 max-w-5xl px-4 pb-10 text-center text-xs text-white/60">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>
            Tip: you can type classes like <code>text-blue-500</code>,{" "}
            <code>grid grid-cols-2 gap-4</code>, or{" "}
            <code>focus:ring-4 focus:ring-purple-300</code>.
          </span>
        </div>
      </div>

      {/* Win pulse */}
      {isAnimating && gameStatus === "passed" && (
        <div className="pointer-events-none fixed inset-0 z-20 animate-pulse bg-gradient-to-br from-emerald-400/10 via-transparent to-purple-400/10" />
      )}

      {/* Fail tint */}
      {isAnimating && gameStatus === "failed" && (
        <div className="pointer-events-none fixed inset-0 z-20 animate-fade bg-rose-500/10" />
      )}
    </div>
  );
};

export default TailwindQuestPage;

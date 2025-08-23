"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Map,
  Mountain,
  Trees,
  Waves,
  Snowflake,
  Skull,
  BookOpen,
  Code,
} from "lucide-react";
import { Map as MapIcon } from "lucide-react";

type MapPoint = {
  level: number;
  x: number;
  y: number;
  region: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  completed: boolean;
  current: boolean;
  available: boolean;
};

// Types
type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
};

type Region = {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
};

type LevelData = {
  task: string;
  solution: string;
  hint: string;
  tutorial?: string;
  component: string;
  baseClasses: string;
  parentClasses?: string;
  content: string;
  description: string;
  level: number;
  maxTime: number;
  points: number;
  region: Region;
  tier: number;
};

const TailwindQuest = () => {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [hints, setHints] = useState<number>(3);
  const [experience, setExperience] = useState<number>(0);
  const [playerCode, setPlayerCode] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<"playing" | "passed" | "failed">(
    "playing"
  );
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [combo, setCombo] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(
    new Set()
  );
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  // Infinite level system with progressive difficulty
  const getRegionForLevel = (level: number): Region => {
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

  // Generate infinite levels with increasing complexity
  const generateLevel = useCallback((level: number): LevelData => {
    const baseTemplates = [
      {
        task: "Make this text blue",
        solution: "text-blue-500",
        hint: "Use text-[color]-[intensity]. Try text-blue-500",
        tutorial:
          "In Tailwind CSS, you style text color with the pattern: text-[color]-[intensity]\n\n• text-blue-500 = Medium blue text\n• text-red-600 = Darker red text\n• text-gray-400 = Light gray text\n\nCommon colors: red, blue, green, yellow, purple, gray, black, white\nCommon intensities: 100 (lightest) to 900 (darkest)",
        component: "text",
        baseClasses: "text-2xl font-bold",
        content: "Hello World",
        description: "Change the text color to blue",
      },
      {
        task: "Center this content with flexbox",
        solution: "flex items-center justify-center",
        hint: "Use flex items-center justify-center to center both ways",
        tutorial:
          "Flexbox is Tailwind's most powerful layout tool!\n\n• flex = Turn element into flexbox container\n• items-center = Center items vertically\n• justify-center = Center items horizontally\n\nOther options:\n• justify-start, justify-end, justify-between\n• items-start, items-end, items-stretch",
        component: "div",
        baseClasses: "h-32 bg-gray-100 border-2 border-dashed border-gray-400",
        content: "I'm Centered!",
        description: "Use flexbox to center content both ways",
      },
      {
        task: "Create a card with shadow, rounded corners and padding",
        solution: "p-6 rounded-xl shadow-lg",
        hint: "Combine padding (p-), border radius (rounded-), and shadow utilities",
        tutorial:
          "Card styling combines multiple utilities:\n\n• p-6 = Padding of 1.5rem on all sides\n• rounded-xl = Extra large border radius\n• shadow-lg = Large drop shadow\n\nPadding scale: p-1, p-2, p-4, p-6, p-8, p-12\nRounded scale: rounded, rounded-md, rounded-lg, rounded-xl, rounded-full\nShadow scale: shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl",
        component: "div",
        baseClasses: "bg-white max-w-sm",
        content: "Beautiful Card Component",
        description: "Style a card with modern design",
      },
      {
        task: "Make responsive text: small on mobile, large on tablet, extra large on desktop",
        solution: "text-sm md:text-lg xl:text-2xl",
        hint: "Stack responsive prefixes: base, md:, xl:",
        tutorial:
          "Responsive design uses breakpoint prefixes:\n\n• No prefix = applies to all sizes (mobile first)\n• sm: = small screens (640px+)\n• md: = medium screens (768px+) \n• lg: = large screens (1024px+)\n• xl: = extra large (1280px+)\n• 2xl: = 2x large (1536px+)\n\nExample: text-sm md:text-lg xl:text-2xl\n• Mobile: small text\n• Tablet: large text  \n• Desktop: extra large text",
        component: "p",
        baseClasses: "font-bold",
        content: "Responsive Typography",
        description: "Master responsive text sizing",
      },
      {
        task: "Create hover effect: scale up, rotate slightly, change colors with smooth transition",
        solution:
          "hover:scale-110 hover:rotate-3 hover:bg-purple-600 hover:text-white transition-all duration-300",
        hint: "Combine hover:scale, hover:rotate, hover:bg, hover:text with transition-all",
        tutorial:
          "Advanced hover effects combine transforms and transitions:\n\n• hover:scale-110 = Scale to 110% on hover\n• hover:rotate-3 = Rotate 3 degrees\n• hover:bg-purple-600 = Change background color\n• hover:text-white = Change text color\n• transition-all = Animate all properties\n• duration-300 = Animation takes 300ms\n\nTransform utilities: scale-75 to scale-150, rotate-1 to rotate-180\nDuration options: duration-75, duration-100, duration-300, duration-500, duration-1000",
        component: "div",
        baseClasses:
          "p-6 bg-blue-500 text-blue-100 cursor-pointer rounded-lg font-bold text-center",
        content: "Hover Me!",
        description: "Create complex hover animations",
      },
      {
        task: "Create complex grid: 4 columns on desktop, 2 on tablet, 1 on mobile with different gaps",
        solution:
          "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-4 xl:gap-6",
        hint: "Combine grid-cols with breakpoints and responsive gaps",
        tutorial:
          "Advanced grid systems with responsive breakpoints:\n\n• grid = Enable CSS Grid\n• grid-cols-1 = 1 column (mobile)\n• md:grid-cols-2 = 2 columns on tablet\n• xl:grid-cols-4 = 4 columns on desktop\n• gap-2 = Small gap on mobile\n• md:gap-4 = Medium gap on tablet\n• xl:gap-6 = Large gap on desktop\n\nGrid options: grid-cols-1 through grid-cols-12\nGap options: gap-0, gap-1, gap-2, gap-4, gap-6, gap-8, gap-12",
        component: "div",
        baseClasses: "p-4",
        content:
          "<div class='bg-red-200 p-4 rounded'>1</div><div class='bg-blue-200 p-4 rounded'>2</div><div class='bg-green-200 p-4 rounded'>3</div><div class='bg-yellow-200 p-4 rounded'>4</div><div class='bg-purple-200 p-4 rounded'>5</div><div class='bg-pink-200 p-4 rounded'>6</div>",
        description: "Master responsive grid systems",
      },
      {
        task: "Create a glassmorphism card with backdrop blur, gradient border, and complex shadows",
        solution:
          "backdrop-blur-md bg-white/10 border border-white/20 shadow-xl shadow-purple-500/25 rounded-2xl",
        hint: "Combine backdrop-blur, bg-white/opacity, border-white/opacity, and colored shadows",
        tutorial:
          "Glassmorphism combines modern effects:\n\n• backdrop-blur-md = Blur background behind element\n• bg-white/10 = White background at 10% opacity\n• border-white/20 = White border at 20% opacity\n• shadow-xl = Extra large shadow\n• shadow-purple-500/25 = Purple shadow at 25% opacity\n• rounded-2xl = Very rounded corners\n\nOpacity syntax: color/[0-100] (e.g., bg-blue-500/50 = 50% opacity)\nBlur options: backdrop-blur-none, backdrop-blur-sm, backdrop-blur, backdrop-blur-md, backdrop-blur-lg, backdrop-blur-xl",
        component: "div",
        baseClasses: "p-8 text-white font-bold",
        parentClasses:
          "bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-xl",
        content: "Glassmorphism Effect",
        description: "Master advanced glassmorphism design",
      },
    ];

    const cycleIndex = (level - 1) % baseTemplates.length;
    const difficultyTier = Math.floor((level - 1) / baseTemplates.length);
    const baseLevel = baseTemplates[cycleIndex];

    let solution = baseLevel.solution;
    let task = baseLevel.task;

    if (difficultyTier > 0) {
      const complexityModifiers = [
        "hover:shadow-2xl",
        "active:scale-95",
        "focus:ring-4 focus:ring-purple-300",
        "group-hover:opacity-75",
        "motion-safe:animate-pulse",
        "dark:bg-gray-800 dark:text-white",
      ];

      const additionalModifiers = complexityModifiers.slice(
        0,
        Math.min(difficultyTier, 3)
      );
      solution = `${solution} ${additionalModifiers.join(" ")}`;
      task = `${task} (Advanced: Tier ${difficultyTier + 1})`;
    }

    return {
      ...baseLevel,
      solution,
      task,
      level,
      maxTime: Math.max(45, 180 - level * 2),
      points: 100 + difficultyTier * 150,
      region: getRegionForLevel(level),
      tier: difficultyTier + 1,
    };
  }, []);

  const [currentLevelData, setCurrentLevelData] = useState<LevelData>(() =>
    generateLevel(1)
  );

  // Generate infinite map points with chain-like connections
  const generateMapPoints = () => {
    const points = [];
    const visibleLevels = Math.min(currentLevel + 20, 200);

    const spacingY = 12; // vertical spacing per level
    const zigzagX = [30, 70]; // zigzag left-right positions

    for (let i = 1; i <= visibleLevels; i++) {
      const x = zigzagX[i % 2]; // alternate left/right
      const y = i * spacingY;

      const region = getRegionForLevel(i);

      points.push({
        level: i,
        x,
        y,
        region: region.name,
        icon: region.icon,
        color: region.color,
        bgColor: region.bgColor,
        completed: completedLevels.has(i),
        current: i === currentLevel,
        available: i <= currentLevel,
      });
    }

    return points;
  };

  // Timer and effects
  useEffect(() => {
    if (gameStatus === "playing" && timeLeft > 0 && !showMap) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStatus === "playing") {
      handleFailure();
    }
  }, [timeLeft, gameStatus, showMap]);

  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles(particles.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const createParticles = (count = 15) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: [
        "text-yellow-400",
        "text-purple-400",
        "text-pink-400",
        "text-blue-400",
        "text-green-400",
      ][Math.floor(Math.random() * 5)],
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  const checkSolution = () => {
    const normalizedPlayerCode = playerCode
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    const normalizedSolution = currentLevelData.solution
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (normalizedPlayerCode === normalizedSolution) {
      handleSuccess();
    } else {
      handleWrongAnswer();
    }
  };

  const handleSuccess = () => {
    setIsAnimating(true);
    createParticles(20);
    setGameStatus("passed");
    setScore((prev) => prev + currentLevelData.points + streak * 100);
    setStreak((prev) => prev + 1);
    setCombo((prev) => prev + 1);
    setExperience((prev) => prev + 25 + currentLevelData.tier * 10);
    setWrongAttempts(0);
    setCompletedLevels((prev) => new Set([...prev, currentLevel]));

    const newAchievements: string[] = [];
    if (streak === 5) newAchievements.push("🔥 Fire Streak Master!");
    if (currentLevel === 10) newAchievements.push("🌲 Woods Conqueror!");
    if (currentLevel === 25) newAchievements.push("🏔️ Plains Champion!");
    if (currentLevel === 50) newAchievements.push("🏜️ Desert Warrior!");
    if (currentLevel === 100) newAchievements.push("👑 Century Club!");
    if (combo >= 10) newAchievements.push("⚡ Combo God!");
    if (timeLeft > currentLevelData.maxTime * 0.9)
      newAchievements.push("⚡ Lightning Speed!");

    setAchievements((prev) => [...prev, ...newAchievements]);

    setTimeout(() => {
      setIsAnimating(false);
      nextLevel();
    }, 2500);
  };

  const handleWrongAnswer = () => {
    setWrongAttempts((prev) => prev + 1);
    setStreak(0);
    setCombo(0);

    if (wrongAttempts >= 2) {
      setLives((prev) => prev - 1);
      if (lives <= 1) {
        handleFailure();
        return;
      }
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleFailure = () => {
    setGameStatus("failed");
    setStreak(0);
    setCombo(0);
  };

  const nextLevel = () => {
    setCurrentLevel((prev) => prev + 1);
    const nextLevelData = generateLevel(currentLevel + 1);
    setCurrentLevelData(nextLevelData);
    setTimeLeft(nextLevelData.maxTime);
    setPlayerCode("");
    setGameStatus("playing");
    setShowHint(false);
    setShowMap(true);
  };

  const selectLevel = (levelNum: number) => {
    if (levelNum <= currentLevel) {
      setCurrentLevel(levelNum);
      const levelData = generateLevel(levelNum);
      setCurrentLevelData(levelData);
      setTimeLeft(levelData.maxTime);
      setPlayerCode("");
      setGameStatus("playing");
      setShowHint(false);
      setShowMap(false);
    }
  };

  const restartGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setLives(3);
    setStreak(0);
    setHints(3);
    setExperience(0);
    setPlayerCode("");
    setShowHint(false);
    setGameStatus("playing");
    setWrongAttempts(0);
    setCombo(0);
    setAchievements([]);
    setCompletedLevels(new Set());
    const firstLevel = generateLevel(1);
    setCurrentLevelData(firstLevel);
    setTimeLeft(firstLevel.maxTime);
    setShowMap(true);
  };

  const useHint = () => {
    if (hints > 0) {
      setHints((prev) => prev - 1);
      setShowHint(true);
    }
  };

  const renderPreview = () => {
    const { component, baseClasses, content, parentClasses } = currentLevelData;
    const classes = `${baseClasses} ${playerCode}`.trim();

    const renderElement = () => {
      // ✅ force safe preview colors
      const safeClasses = "bg-gray-900 text-white";
      const props: any = { className: `${classes} ${safeClasses}` };

      if (content.includes("<")) {
        props.dangerouslySetInnerHTML = { __html: content };
      }

      const textContent = !content.includes("<") ? content : undefined;

      switch (component) {
        case "div":
          return <div {...props}>{textContent}</div>;
        case "button":
          return <button {...props}>{textContent}</button>;
        case "h1":
          return <h1 {...props}>{textContent}</h1>;
        case "p":
          return <p {...props}>{textContent}</p>;
        case "header":
          return <header {...props}>{textContent}</header>;
        case "text":
          return <span {...props}>{textContent}</span>;
        default:
          return <div {...props}>{textContent}</div>;
      }
    };

    return (
      <div className="bg-gray-900 rounded-lg p-6 min-h-40 border border-gray-700 overflow-hidden">
        🎨 Live Preview:
        <div className="bg-gray-800/70 backdrop-blur-md rounded-lg p-6 min-h-40 border border-gray-600 shadow-2xl">
          {parentClasses ? (
            <div className={`${parentClasses} bg-gray-900 text-white`}>
              {renderElement()}
            </div>
          ) : (
            <div className="bg-gray-900 text-white">{renderElement()}</div>
          )}
        </div>
      </div>
    );
  };

  const mapPoints: MapPoint[] = generateMapPoints();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Enhanced particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${particle.color} pointer-events-none z-50`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `float 1.5s ease-out forwards`,
          }}
        >
          <Sparkles className="w-6 h-6" />
        </div>
      ))}

      {/* Enhanced Header */}
      <div className="p-4 bg-black/30 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMap(!showMap)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <MapIcon className="w-5 h-5" />
              {showMap ? "🎮 Start Quest" : "🗺️ View Map"}
            </button>
            <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {currentLevelData.region.name}
            </div>
            {currentLevelData.tier > 1 && (
              <div className="bg-red-500/20 border border-red-500 px-3 py-1 rounded-full text-sm font-bold text-red-400">
                Tier {currentLevelData.tier}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-yellow-500/30">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-lg">Lv.{currentLevel}</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-500/30">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="font-bold">{score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-600/20 to-red-800/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-500/30">
              <Heart
                className={`w-5 h-5 ${
                  lives > 0 ? "text-red-400" : "text-gray-600"
                }`}
              />
              <span className="font-bold">{lives}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-600/20 to-orange-800/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-orange-500/30 animate-pulse">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="font-bold">{streak}</span>
              </div>
            )}
            {!showMap && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-500/30">
                <Clock
                  className={`w-5 h-5 ${
                    timeLeft <= 30
                      ? "text-red-400 animate-pulse"
                      : "text-green-400"
                  }`}
                />
                <span className="font-bold">{timeLeft}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Map View with Chain Animations */}
        {showMap && (
          <div className="relative">
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              🗺️ TailwindQuest: Infinite Adventure
            </h1>

            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-8 min-h-[500px] overflow-hidden border border-purple-500/30 shadow-2xl">
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-20">
                <div
                  className="absolute top-8 left-12 text-6xl animate-bounce"
                  style={{ animationDelay: "0s" }}
                >
                  🌲
                </div>
                <div
                  className="absolute top-20 right-16 text-6xl animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  ⛰️
                </div>
                <div
                  className="absolute bottom-20 left-16 text-6xl animate-bounce"
                  style={{ animationDelay: "1s" }}
                >
                  🏜️
                </div>
                <div
                  className="absolute bottom-12 right-12 text-6xl animate-bounce"
                  style={{ animationDelay: "1.5s" }}
                >
                  🌊
                </div>
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl animate-spin"
                  style={{ animationDuration: "20s" }}
                >
                  ✨
                </div>
              </div>

              {/* Chain-like connections with animations */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {mapPoints.slice(0, -1).map((point, index) => {
                  const nextPoint = mapPoints[index + 1];
                  const isCompleted = point.completed;
                  return (
                    <g key={index}>
                      <line
                        x1={`${point.x}%`}
                        y1={`${point.y}%`}
                        x2={`${nextPoint.x}%`}
                        y2={`${nextPoint.y}%`}
                        stroke={isCompleted ? "#10b981" : "#6b7280"}
                        strokeWidth="4"
                        strokeDasharray={isCompleted ? "0" : "8,4"}
                        className={`transition-all duration-500 ${
                          isCompleted ? "opacity-80" : "opacity-40"
                        }`}
                        style={{
                          filter: isCompleted
                            ? "drop-shadow(0 0 8px #10b981)"
                            : "none",
                        }}
                      />
                      {/* Chain links effect */}
                      {[0.25, 0.5, 0.75].map((ratio, i) => {
                        const linkX = point.x + (nextPoint.x - point.x) * ratio;
                        const linkY = point.y + (nextPoint.y - point.y) * ratio;
                        return (
                          <circle
                            key={i}
                            cx={`${linkX}%`}
                            cy={`${linkY}%`}
                            r="2"
                            fill={isCompleted ? "#10b981" : "#6b7280"}
                            className={`${isCompleted ? "animate-pulse" : ""}`}
                            style={{
                              filter: isCompleted
                                ? "drop-shadow(0 0 4px #10b981)"
                                : "none",
                            }}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>

              {/* Level points with enhanced animations */}
              {mapPoints.map((point) => {
                const Icon = point.icon;
                const isHovered = hoveredLevel === point.level;
                return (
                  <div
                    key={point.level}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                      point.current
                        ? "animate-pulse scale-125 z-20"
                        : isHovered
                        ? "scale-150 z-10"
                        : "hover:scale-125"
                    } ${
                      !point.available
                        ? "cursor-not-allowed opacity-80 grayscale"
                        : ""
                    }`}
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                    }}
                    onClick={() => point.available && selectLevel(point.level)}
                    onMouseEnter={() => setHoveredLevel(point.level)}
                    onMouseLeave={() => setHoveredLevel(null)}
                  >
                    <div
                      className={`relative ${
                        point.completed
                          ? "bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/50"
                          : point.current
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50"
                          : point.available
                          ? "bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50"
                          : "bg-gray-500"
                      } rounded-full p-4 border-4 border-white transition-all duration-300 ${
                        isHovered ? "animate-bounce" : ""
                      }`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                      {point.completed && (
                        <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-green-600 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-xs font-bold bg-black/80 px-3 py-1 rounded-full whitespace-nowrap border border-white/30">
                      Level {point.level}
                      {point.level > 100 && (
                        <span className="text-red-400 ml-1">💀</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Region Legend with enhanced styling */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  name: "Beginner Woods",
                  icon: Trees,
                  levels: "1-10",
                  color: "from-green-600 to-green-800",
                  description: "Learn the basics",
                },
                {
                  name: "Styling Plains",
                  icon: Mountain,
                  levels: "11-25",
                  color: "from-yellow-600 to-orange-800",
                  description: "Master styling",
                },
                {
                  name: "Responsive Desert",
                  icon: Target,
                  levels: "26-50",
                  color: "from-orange-600 to-red-800",
                  description: "Responsive design",
                },
                {
                  name: "Master Nightmare",
                  icon: Skull,
                  levels: "51+",
                  color: "from-gray-600 to-black",
                  description: "Extreme challenges",
                },
              ].map((region, index) => {
                const Icon = region.icon;
                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${region.color} rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg mb-1">{region.name}</h3>
                    <p className="text-sm opacity-90 mb-2">
                      Levels {region.levels}
                    </p>
                    <p className="text-xs opacity-75">{region.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Play View with enhanced tutorial system */}
        {!showMap && gameStatus === "playing" && (
          <div
            className={`transition-all duration-500 ${
              isAnimating ? "animate-pulse scale-105" : ""
            }`}
          >
            {/* Level Info */}
            <div className="mb-8 text-center">
              <div
                className={`inline-block bg-gradient-to-r ${currentLevelData.region.color} rounded-full px-8 py-3 mb-4 shadow-lg`}
              >
                <span className="text-lg font-bold">
                  Level {currentLevel} - {currentLevelData.region.name}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {currentLevelData.task}
              </h1>
              <p className="text-xl text-gray-400">
                {currentLevelData.description}
              </p>
            </div>

            {/* Game Status Indicators */}
            <div className="flex justify-center gap-6 mb-8">
              {combo > 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full text-lg font-bold animate-bounce shadow-lg">
                  🔥 {combo}x COMBO STREAK!
                </div>
              )}
              {wrongAttempts > 0 && (
                <div className="bg-red-500/20 border-2 border-red-500 text-red-400 px-6 py-3 rounded-full text-lg font-bold animate-pulse">
                  ❌ Wrong attempts: {wrongAttempts}/3
                </div>
              )}
            </div>

            {/* Main Game Area */}
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Code Input */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Code className="w-7 h-7 text-green-400" />
                    Your Tailwind Classes
                  </h3>
                  <input
                    type="text"
                    value={playerCode}
                    onChange={(e) => setPlayerCode(e.target.value)}
                    placeholder="Enter Tailwind classes here..."
                    className="w-full bg-gray-700/50 border-2 border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    onKeyPress={(e) => e.key === "Enter" && checkSolution()}
                  />
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={checkSolution}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center gap-3 text-lg shadow-lg"
                    >
                      <CheckCircle className="w-6 h-6" />
                      Submit Solution
                    </button>
                    <button
                      onClick={useHint}
                      disabled={hints === 0}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center gap-3 text-lg shadow-lg"
                    >
                      <Lightbulb className="w-6 h-6" />
                      Hint ({hints})
                    </button>
                  </div>

                  {/* Enhanced hint system with tutorials for beginners */}
                  {showHint && (
                    <div className="mt-6 space-y-4">
                      <div className="p-6 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-2 border-yellow-400 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <Lightbulb className="w-6 h-6 text-yellow-400" />
                          <h4 className="text-lg font-bold text-yellow-400">
                            Quick Hint
                          </h4>
                        </div>
                        <p className="text-yellow-100 text-lg">
                          {currentLevelData.hint}
                        </p>
                      </div>

                      {/* Tutorial for beginners (levels 1-10) */}
                      {currentLevel <= 10 && currentLevelData.tutorial && (
                        <div className="p-6 bg-gradient-to-r from-blue-400/10 to-purple-400/10 border-2 border-blue-400 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <BookOpen className="w-6 h-6 text-blue-400" />
                            <h4 className="text-lg font-bold text-blue-400">
                              Tutorial Guide
                            </h4>
                          </div>
                          <pre className="text-blue-100 whitespace-pre-line text-sm leading-relaxed font-mono">
                            {currentLevelData.tutorial}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview and Stats */}
              <div className="space-y-6">
                {renderPreview()}

                {/* Progress and Experience */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex justify-between text-lg mb-3">
                    <span className="font-bold">Experience Progress</span>
                    <span className="text-purple-400 font-bold">
                      {experience} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-4 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${experience % 100}%` }}
                    ></div>
                  </div>

                  {/* Level stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-purple-500/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-400">
                        {currentLevel}
                      </div>
                      <div className="text-sm text-gray-400">Current Level</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-400">
                        {completedLevels.size}
                      </div>
                      <div className="text-sm text-gray-400">Completed</div>
                    </div>
                  </div>
                </div>

                {/* Recent Achievements */}
                {achievements.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                      <Award className="w-6 h-6 text-yellow-400" />
                      Recent Achievements
                    </h3>
                    <div className="space-y-2">
                      {achievements.slice(-4).map((achievement, index) => (
                        <div
                          key={index}
                          className="text-lg text-yellow-400 animate-pulse bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/30"
                        >
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {gameStatus === "passed" && (
          <div className="text-center space-y-8">
            <div className="animate-bounce">
              <CheckCircle className="w-32 h-32 text-green-400 mx-auto" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Level Complete! 🎉
            </h1>
            <div className="text-3xl text-yellow-400 font-bold">
              +{currentLevelData.points + streak * 100} points!
            </div>
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-2xl p-8 text-left border border-green-400/30 shadow-2xl">
                <div className="text-lg text-gray-400 mb-3 font-bold">
                  Perfect Solution:
                </div>
                <code className="text-2xl text-green-400 font-mono break-all">
                  {currentLevelData.solution}
                </code>
              </div>
            </div>
            {streak > 0 && (
              <div className="text-2xl font-bold text-orange-400 animate-pulse">
                🔥 {streak} Level Streak! Keep going!
              </div>
            )}
          </div>
        )}

        {/* Game Over Screen */}
        {gameStatus === "failed" && (
          <div className="text-center space-y-8">
            <div className="animate-pulse">
              <XCircle className="w-32 h-32 text-red-400 mx-auto" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Game Over
            </h1>
            <div className="space-y-4">
              <p className="text-3xl text-yellow-400">
                You conquered <span className="font-bold">{currentLevel}</span>{" "}
                levels!
              </p>
              <p className="text-2xl text-purple-400">
                Final Score:{" "}
                <span className="font-bold">{score.toLocaleString()}</span>
              </p>
              <p className="text-xl text-gray-400">
                You mastered the{" "}
                <span className="text-white font-bold">
                  {currentLevelData.region.name}
                </span>
                !
              </p>
            </div>
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-4 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 shadow-2xl"
            >
              🎮 Play Again
            </button>
          </div>
        )}
      </div>

      {/* Enhanced animations and effects */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-150px) scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes floatSpin {
          0% {
            transform: translateY(0px) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-150px) scale(0) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes wobble {
          0%,
          100% {
            transform: translateX(0%) rotate(0deg);
          }
          15% {
            transform: translateX(-30px) rotate(-5deg);
          }
          30% {
            transform: translateX(15px) rotate(3deg);
          }
          45% {
            transform: translateX(-15px) rotate(-3deg);
          }
          60% {
            transform: translateX(10px) rotate(2deg);
          }
          75% {
            transform: translateX(-5px) rotate(-1deg);
          }
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }

        @keyframes dashMove {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 24;
          }
        }
      `}</style>
    </div>
  );
};

export default TailwindQuest;

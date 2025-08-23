"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, Code, Palette, ArrowLeft, ArrowRight, Play, BookOpen } from "lucide-react";

export default function TailwindTutorial() {
  const levels: Array<"beginner" | "intermediate" | "expert"> = ["beginner", "intermediate", "expert"];
  const [level, setLevel] = useState<"beginner" | "intermediate" | "expert">("beginner");
  const [step, setStep] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [flipped, setFlipped] = useState<null | "beginner" | "intermediate" | "expert">(null);
  const [animateCard, setAnimateCard] = useState(false);
  const [particles, setParticles] = useState<{ top: string; left: string; duration: string; delay: string }[]>([]);

  const tutorials = {
    beginner: [
      { title: "Include Tailwind CSS", content: `Add Tailwind via CDN in your HTML <head>:\n\n<link href="https://cdn.tailwindcss.com" rel="stylesheet">` },
      { title: "Basic HTML Structure", content: `Create a basic HTML file:\n\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Tailwind Tutorial</title>\n  <link href="https://cdn.tailwindcss.com" rel="stylesheet">\n</head>\n<body>\n  <h1 class="text-3xl font-bold">Hello Tailwind!</h1>\n</body>\n</html>` },
      { title: "Utility Classes", content: `Use Tailwind utility classes for styling:\n\n<h2 class="text-blue-500 bg-gray-100 p-4 rounded">This is a styled heading</h2>` },
      { title: "Responsive Design", content: `Tailwind makes responsive design easy:\n\n<div class="text-base md:text-lg lg:text-xl">Resize the browser to see changes!</div>` },
      { title: "Testing Tailwind", content: `Open your HTML in a browser and edit classes like:\n\n<h1 class="text-red-500">Red Heading</h1>\n\nIf it changes, Tailwind is working!` },
    ],
    intermediate: [
      { title: "Custom Colors", content: `Tailwind CDN allows custom colors via <script>:\n\n<script>\n  tailwind.config = {\n    theme: {\n      extend: {\n        colors: { brandBlue: "#1e40af", brandPink: "#db2777" },\n      },\n    },\n  };\n</script>` },
      { title: "Custom Fonts", content: `Add Google Fonts in HTML:\n\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">\n<script>\n  tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } } };\n</script>\n<p class="font-sans">This uses Inter font</p>` },
      { title: "Plugins", content: `Some Tailwind plugins also work with CDN. Example: forms plugin:\n<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/forms"></script>\nUse class="form-input" on inputs.` },
      { title: "Dark Mode", content: `Enable dark mode via class:\n<body class="dark">\n<h1 class="text-white dark:text-black">Dark Mode Example</h1>\n</body>` },
    ],
    expert: [
      { title: "Arbitrary Values", content: `Tailwind CDN supports arbitrary values:\n\n<div class="bg-[#123456] text-[22px] p-[10px]">Custom colors & size</div>` },
      { title: "Advanced Responsiveness", content: `Combine responsive and pseudo-class utilities:\n\n<button class="bg-blue-500 hover:bg-blue-700 md:text-xl">Hover & responsive!</button>` },
      { title: "Theming", content: `You can use multiple themes with JavaScript + Tailwind:\n\n<script>\n  document.body.classList.add('dark');\n</script>` },
      { title: "Production Optimization", content: `When using CDN for small projects, Tailwind is already optimized.\nFor bigger projects, consider using CLI to purge unused CSS.` },
    ],
  };

  const currentStep = tutorials[level][step];

  // Generate particles once
  useEffect(() => {
    const generated = Array.from({ length: 25 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${5 + Math.random() * 5}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setParticles(generated);
  }, []);

  useEffect(() => {
    const savedLevel = localStorage.getItem("tailwindLevel") as "beginner" | "intermediate" | "expert" | null;
    if (savedLevel) {
      setLevel(savedLevel);
    } else {
      setShowPopup(true);
    }
  }, []);

  const handlePrev = () => {
    setAnimateCard(true);
    setTimeout(() => {
      setStep((prev) => Math.max(prev - 1, 0));
      setAnimateCard(false);
    }, 300);
  };

  const handleNext = () => {
    setAnimateCard(true);
    setTimeout(() => {
      const lastStepIndex = tutorials[level].length - 1;
      if (step < lastStepIndex) {
        setStep(step + 1);
      } else {
        const currentLevelIndex = levels.indexOf(level);
        if (currentLevelIndex < levels.length - 1) {
          const nextLevel = levels[currentLevelIndex + 1];
          setLevel(nextLevel);
          setStep(0);
          localStorage.setItem("tailwindLevel", nextLevel);
        }
      }
      setAnimateCard(false);
    }, 300);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value as "beginner" | "intermediate" | "expert";
    setLevel(newLevel);
    setStep(0);
    localStorage.setItem("tailwindLevel", newLevel);
  };

  const selectLevel = (chosenLevel: "beginner" | "intermediate" | "expert") => {
    setFlipped(chosenLevel);
    setTimeout(() => {
      setLevel(chosenLevel);
      setStep(0);
      localStorage.setItem("tailwindLevel", chosenLevel);
      setShowPopup(false);
      setFlipped(null);
    }, 600);
  };

  const isExpertCompleted = level === "expert" && step === tutorials.expert.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-pink-900 text-gray-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">

      {/* Particle background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-float"
            style={{
              top: p.top,
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0.6; }
          50% { transform: translateY(-15px) translateX(5px); opacity: 0.8; }
          100% { transform: translateY(0) translateX(0); opacity: 0.6; }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>

      {/* Popup */}
      {showPopup && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative w-96 h-64 perspective">
            <div className={`absolute w-full h-full transition-transform duration-500 ${flipped ? 'rotate-y-180' : ''}`}>
              <div className="bg-gradient-to-br from-purple-700 via-blue-700 to-pink-600 p-8 rounded-3xl shadow-2xl flex flex-col justify-center items-center h-full text-center backface-hidden">
                <h2 className="text-3xl font-extrabold mb-6 text-yellow-300 flex items-center gap-2">
                  <Sparkles className="animate-pulse" /> Choose Your Tailwind Level
                </h2>
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => selectLevel("beginner")} 
                    className="bg-blue-500 hover:bg-blue-400 py-2 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                  >
                    <Zap size={16} /> Beginner
                  </button>
                  <button 
                    onClick={() => selectLevel("intermediate")} 
                    className="bg-green-500 hover:bg-green-400 py-2 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                  >
                    <Code size={16} /> Intermediate
                  </button>
                  <button 
                    onClick={() => selectLevel("expert")} 
                    className="bg-purple-500 hover:bg-purple-400 py-2 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                  >
                    <Palette size={16} /> Expert
                  </button>
                </div>
              </div>
              <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl flex justify-center items-center text-xl text-white font-bold rotate-y-180 backface-hidden">
                <Sparkles className="mr-2 animate-pulse" /> Great! Let`s start 🎉
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-extrabold mb-8 z-10 flex items-center gap-2">
        <Sparkles className="text-yellow-300 animate-pulse" /> Tailwind CSS Learning Path (HTML)
      </h1>
      <a 
        href="https://tailwindcss.com/docs" 
        target="_blank" 
        className="text-blue-400 underline mb-6 z-10 flex items-center gap-1 hover:text-blue-300 transition-colors"
      >
        <BookOpen size={16} /> Visit Official Tailwind Docs
      </a>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg rounded-2xl p-8 w-full max-w-2xl relative z-10 border border-gray-700">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${level === 'beginner' ? 'bg-blue-500' : level === 'intermediate' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
            <span className="text-sm font-semibold uppercase tracking-wider bg-gray-700 px-3 py-1 rounded-full">
              {level}
            </span>
          </div>
          <select
            value={level}
            onChange={handleLevelChange}
            className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-2xl shadow-md mb-6 transition-all duration-300 ${animateCard ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'} border border-gray-700`}>
          <h2 className="text-2xl font-bold mb-4 text-white">{currentStep.title}</h2>
          <pre className="bg-gray-800 text-green-400 p-4 rounded whitespace-pre-wrap border border-gray-700">{currentStep.content}</pre>
        </div>

        <div className="flex justify-between">
          <button
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 flex items-center gap-1 transition-all hover:scale-105"
            onClick={handlePrev}
            disabled={step === 0 && level === "beginner"}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {isExpertCompleted ? (
            <a
              href="/playground"
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:from-yellow-400 hover:to-yellow-500 flex items-center gap-1 transition-all hover:scale-105"
            >
              <Play size={16} /> Go to Playground
            </a>
          ) : (
            <button
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-500 hover:to-green-600 flex items-center gap-1 transition-all hover:scale-105"
              onClick={handleNext}
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
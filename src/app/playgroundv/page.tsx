"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Play,
  Save,
  Eye,
  Code,
  Database,
  AlertCircle,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";

/**
 * TailwindPlaygroundNoNav (TailSpark themed)
 *
 * — Same functionality as your original component
 * — Visuals reworked to match the "TailSpark" screenshot theme:
 *   dark indigo/purple nebula background, glassy cards, soft glows,
 *   gradient accents, rounded-2xl corners, minimal borders.
 */

interface ErrorItem {
  type: "HTML" | "Tailwind";
  line: number;
  message: string;
  severity: "error" | "warning";
  word?: string;
}

interface SavedItem {
  id: string;
  name: string;
  code: string;
  timestamp: string;
  level?: string;
}

const TailwindPlaygroundNoNav: React.FC = () => {
  // Hydration guard
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Editor & UI state
  const [code, setCode] = useState<string>("");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Expert">(
    "Beginner"
  );
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [status, setStatus] = useState<"Ready" | "Updating..." | "Updated">(
    "Ready"
  );
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [saveName, setSaveName] = useState<string>("");

  // Character state
  const [characterMood, setCharacterMood] = useState<
    | "idle"
    | "happy"
    | "error"
    | "correctcode"
    | "motivating"
    | "hello"
    | "cat_eat_fish"
  >("idle");

  const [characterMessage, setCharacterMessage] = useState<string>("");

  // Tutorial state for Beginner, Intermediate, and Expert levels
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [tutorialStepIntermediate, setTutorialStepIntermediate] =
    useState<number>(0);
  const [tutorialStepExpert, setTutorialStepExpert] = useState<number>(0);
  // Reference to the playground coding/output section
  const playgroundRef = useRef<HTMLDivElement>(null);

  // For smooth scroll and state reset on initial mount
  useEffect(() => {
    // Reset all states to initial/default
    setCode(presets[level]);
    setTutorialStep(0);
    setTutorialStepIntermediate(0);
    setTutorialStepExpert(0);
    setCharacterMood("idle");

    // Ultra-smooth auto-scroll
    const scrollToBottom = () => {
      const start = window.scrollY;
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      // easeInOutCubic: slow start, fast middle, slow end
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const scroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        const end = document.body.scrollHeight - window.innerHeight;

        window.scrollTo(0, start + (end - start) * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(scroll);
        }
      };

      requestAnimationFrame(scroll);
    };

    // Small delay to ensure page layout is ready
    const timer = setTimeout(scrollToBottom, 500);
    return () => clearTimeout(timer);
  }, []);
  const tutorialHints: {
    step: number;
    message: string;
    expectedRegex: RegExp;
  }[] = [
    {
      step: 1,
      message: "Change bg-white to bg-blue-500 to see the magic!",
      expectedRegex: /bg-blue-\d{3}/,
    },
    {
      step: 2,
      message: "Now try changing text-gray-900 to text-gray-700",
      expectedRegex: /text-gray-700/,
    },
    {
      step: 3,
      message: "Great! Add hover:bg-indigo-700 to the button",
      expectedRegex: /hover:bg-indigo-700/,
    },
  ];
  // Intermediate tutorial hints
  const intermediateHints: {
    step: number;
    message: string;
    expectedRegex: RegExp;
  }[] = [
    {
      step: 1,
      message: "Change grid-cols-3 to grid-cols-2 to see layout adapt!",
      expectedRegex: /grid-cols-2/,
    },
    {
      step: 2,
      message: "Add md:grid-cols-4 for responsive grids",
      expectedRegex: /md:grid-cols-4/,
    },
    {
      step: 3,
      message:
        "Change the gradient button colors (from-blue-500 to from-pink-500)",
      expectedRegex: /from-pink-500/,
    },
  ];
  // Expert tutorial hints
  const expertHints: {
    step: number;
    message: string;
    expectedRegex: RegExp;
  }[] = [
    {
      step: 1,
      message:
        "Make the heading text a gradient using bg-clip-text and text-transparent",
      expectedRegex: /bg-clip-text/,
    },
    {
      step: 2,
      message: "Add hover:-translate-y-1 to card divs for animation",
      expectedRegex: /hover:-translate-y-1/,
    },
    {
      step: 3,
      message:
        "Update button hover gradient to hover:from-blue-700 hover:to-purple-700",
      expectedRegex: /hover:from-blue-700/,
    },
  ];
  // Refs
  const previewRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  /* ----------------------------- Preset templates ---------------------------- */
  const presets = useMemo(
    () => ({
      Beginner:
        '<div class="p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg max-w-md mx-auto">\n  <h1 class="text-2xl font-bold text-gray-900">Hello Tailwind!</h1>\n  <p class="text-gray-600 mt-2">This is a simple beginner layout. Edit this code to see live changes.</p>\n  <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Click Me</button>\n</div>',
      Intermediate:
        '<div class="max-w-md mx-auto p-8 bg-white/90 backdrop-blur rounded-2xl shadow-xl">\n  <h2 class="text-xl font-semibold text-gray-900 mb-2">Intermediate Layout</h2>\n  <p class="text-gray-600 mb-4">This example includes grid layout and more advanced styling.</p>\n  <div class="grid grid-cols-3 gap-4 mb-4">\n    <div class="bg-blue-100 p-4 rounded-lg text-center">1</div>\n    <div class="bg-blue-200 p-4 rounded-lg text-center">2</div>\n    <div class="bg-blue-300 p-4 rounded-lg text-center">3</div>\n  </div>\n  <button class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity">Continue</button>\n</div>',
      Expert:
        '<div class="min-h-[60vh] bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center p-8">\n  <div class="bg-white/95 p-8 rounded-3xl shadow-2xl max-w-lg w-full">\n    <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600 mb-4">Expert Level UI</h1>\n    <p class="text-gray-600 mb-6">This example uses gradients, custom animations, and complex responsive layouts.</p>\n    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">\n      <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-xl transform hover:-translate-y-1 transition-transform">\n        <h3 class="font-semibold text-yellow-800">Feature One</h3>\n        <p class="text-yellow-600 text-sm mt-2">With hover effects</p>\n      </div>\n      <div class="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl transform hover:-translate-y-1 transition-transform">\n        <h3 class="font-semibold text-green-800">Feature Two</h3>\n        <p class="text-green-600 text-sm mt-2">And smooth transitions</p>\n      </div>\n    </div>\n    <button class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">Launch Project 🚀</button>\n  </div>\n</div>',
    }),
    []
  );

  /* ----------------------------- Error detection ----------------------------- */
  const detectErrors = useCallback((codeContent: string): ErrorItem[] => {
    const found: ErrorItem[] = [];
    const lines = codeContent.split("\n");

    const tagStack: Array<{ tag: string; line: number }> = [];

    const tailwindClassRegex = /^[a-z0-9@_\-:\/\[\]\.%()#]+$/i;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      const tagRegex = /<\/?([a-z][a-z0-9-]*)\b([^>]*)>/gi;
      let match: RegExpExecArray | null;
      while ((match = tagRegex.exec(line)) !== null) {
        const full = match[0];
        const tag = match[1].toLowerCase();
        const attrs = match[2] || "";

        if (full.startsWith("</")) {
          if (
            tagStack.length === 0 ||
            tagStack[tagStack.length - 1].tag !== tag
          ) {
            found.push({
              type: "HTML",
              line: lineNumber,
              message: `Mismatched closing tag: ${full}`,
              severity: "error",
              word: tag,
            });
          } else {
            tagStack.pop();
          }
        } else {
          if (
            !full.endsWith("/>") &&
            !["img", "br", "hr", "input", "meta", "link"].includes(tag)
          ) {
            tagStack.push({ tag, line: lineNumber });
          }
        }

        if (attrs && /(\w+=[^\s"'>]+)/.test(attrs)) {
          found.push({
            type: "HTML",
            line: lineNumber,
            message: `Attribute values should be quoted in ${full}`,
            severity: "warning",
            word: attrs.trim().split(/\s+/)[0],
          });
        }
      }

      if (line.includes("class=") && !line.match(/class\s*=\s*"(.*?)"/)) {
        const tokenMatch = line.match(/class\s*=\s*([^\s>]+)/);
        found.push({
          type: "HTML",
          line: lineNumber,
          message:
            'Malformed class attribute — ensure class="..." (use double quotes).',
          severity: "warning",
          word: tokenMatch ? tokenMatch[1] : "class=",
        });
      }

      const classAttrRegex = /(?:class|className)\s*=\s*"([^"]*)"/g;
      let classMatch: RegExpExecArray | null;
      while ((classMatch = classAttrRegex.exec(line)) !== null) {
        const classList = classMatch[1].trim();
        if (!classList) continue;
        const classes = classList.split(/\s+/);
        classes.forEach((cls) => {
          if (!tailwindClassRegex.test(cls)) {
            found.push({
              type: "Tailwind",
              line: lineNumber,
              message: `Possibly invalid Tailwind class: "${cls}"`,
              severity: "warning",
              word: cls,
            });
          } else {
            if (/--/.test(cls) || /:$/.test(cls) || /^-/.test(cls)) {
              found.push({
                type: "Tailwind",
                line: lineNumber,
                message: `Suspicious Tailwind pattern: "${cls}"`,
                severity: "warning",
                word: cls,
              });
            }
          }
        });
      }

      if (line.includes("<") && !line.includes(">") && /\<\w+/.test(line)) {
        found.push({
          type: "HTML",
          line: lineNumber,
          message: 'Possibly missing closing ">" in tag on this line.',
          severity: "error",
          word: line.trim(),
        });
      }
    });

    if (tagStack.length > 0) {
      tagStack.forEach((t) =>
        found.push({
          type: "HTML",
          line: t.line,
          message: `Unclosed tag: <${t.tag}> (opened on line ${t.line})`,
          severity: "error",
          word: t.tag,
        })
      );
    }

    return found;
  }, []);

  /* -------------------------- Local storage helpers ------------------------- */
  const readSavedSnippets = useCallback((): SavedItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("tailwindPlaygroundSaves") || "[]";
      return JSON.parse(raw) as SavedItem[];
    } catch {
      return [];
    }
  }, []);

  const writeSavedSnippets = useCallback((items: SavedItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("tailwindPlaygroundSaves", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to write saves", e);
    }
  }, []);

  /* ---------------------- Firebase placeholder helpers ---------------------- */
  const saveSnippetToFirebase = useCallback(async (item: SavedItem) => {
    console.info("[Firebase Stub] saveSnippetToFirebase", item);
    return { ...item };
  }, []);

  const loadSnippetsFromFirebase = useCallback(async (): Promise<
    SavedItem[]
  > => {
    console.info("[Firebase Stub] loadSnippetsFromFirebase");
    return [];
  }, []);

  const deleteSnippetFromFirebase = useCallback(async (id: string) => {
    console.info("[Firebase Stub] deleteSnippetFromFirebase", id);
  }, []);

  /* ------------------------------ Save / Load ------------------------------- */

  const saveLocally = useCallback(
    async (name: string, codeContent: string) => {
      const item: SavedItem = {
        id: Date.now().toString(),
        name,
        code: codeContent,
        timestamp: new Date().toISOString(),
        level,
      };
      const existing = readSavedSnippets();
      const updated = [item, ...existing];
      writeSavedSnippets(updated);
      setSavedItems(updated);
      return item;
    },
    [level, readSavedSnippets, writeSavedSnippets]
  );

  const handleSaveSubmit = useCallback(
    async (alsoSaveToFirebase = false) => {
      const nameToUse =
        saveName.trim() || `Code ${new Date().toLocaleTimeString()}`;
      try {
        const saved = await saveLocally(nameToUse, code);
        if (alsoSaveToFirebase) await saveSnippetToFirebase(saved);
        setSaveName("");
      } catch (e) {
        console.error("Failed to save snippet", e);
      }
    },
    [code, saveLocally, saveName, saveSnippetToFirebase]
  );

  const handleLoadCode = useCallback((itemCode: string) => {
    setCode(itemCode);
  }, []);

  const handleDeleteItem = useCallback(
    async (id: string) => {
      try {
        const existing = readSavedSnippets();
        const filtered = existing.filter((s) => s.id !== id);
        writeSavedSnippets(filtered);
        setSavedItems(filtered);
      } catch (e) {
        console.error("Failed to delete snippet", e);
      }
    },
    [readSavedSnippets, writeSavedSnippets, deleteSnippetFromFirebase]
  );

  const handleClearAllSaves = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("tailwindPlaygroundSaves");
    setSavedItems([]);
  }, []);

  /* ------------------------------ Preview / Run ----------------------------- */

  const updatePreview = useCallback(() => {
    setStatus("Updating...");
    const detected = detectErrors(code);
    setErrors(detected);
    setShowErrors(detected.length > 0);

    if (previewRef.current) {
      previewRef.current.innerHTML = code;
    }

    setTimeout(() => {
      setStatus("Updated");
      setTimeout(() => setStatus("Ready"), 1200);
    }, 250);
  }, [code, detectErrors]);

  /* ------------------------- Download to disk ----------------------------- */
  const downloadToDisk = useCallback(
    (as: "html" | "txt") => {
      const filenameBase =
        (saveName && saveName.trim()) ||
        `tailwind-playground-${new Date().toISOString()}`;
      const ext = as === "html" ? "html" : "txt";
      const content =
        as === "html" ? `<!-- Tailwind HTML preview -->\n${code}` : code;
      const blob = new Blob([content], {
        type: as === "html" ? "text/html" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filenameBase}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    [code, saveName]
  );

  /* ------------------------- Jump to line helper --------------------------- */
  const editorRefLocal = editorRef; // tiny alias to keep JSX tidy
  const jumpToLine = useCallback(
    (lineNumber: number) => {
      const ta = editorRefLocal.current;
      if (!ta) return;
      const lines = ta.value.split("\n");
      let start = 0;
      for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
        start += lines[i].length + 1;
      }
      const lineText = lines[lineNumber - 1] ?? "";
      const end = start + lineText.length;
      ta.focus();
      ta.selectionStart = start;
      ta.selectionEnd = end;
      try {
        const style = window.getComputedStyle(ta);
        const lh =
          style.lineHeight && style.lineHeight.includes("px")
            ? parseFloat(style.lineHeight)
            : 18;
        ta.scrollTop = Math.max(0, (lineNumber - 1) * lh - 40);
      } catch {
        ta.scrollTop = Math.max(0, (lineNumber - 1) * 18 - 40);
      }
    },
    [editorRefLocal]
  );

  /* -------------------------- Component lifecycle --------------------------- */
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== "undefined")
      return !localStorage.getItem("welcomeShown");
    return true;
  });

  useEffect(() => {
    // Tutorial logic takes precedence if Beginner and not done
    if (level === "Beginner" && tutorialStep < tutorialHints.length) {
      // On first mount of Beginner mode, show hello mood/message
      if (tutorialStep === 0 && !showWelcome) {
        setCharacterMood("hello");
        setCharacterMessage("Let's learn Tailwind step by step!");
        return;
      }
    }
    // Expert tutorial start: Show cat_eat_fish and custom message
    if (level === "Expert" && tutorialStepExpert === 0 && !showWelcome) {
      setCharacterMood("cat_eat_fish");
      setCharacterMessage("All stage is yours, try new things out here");
      return;
    }

    if (showWelcome) {
      setCharacterMood("happy");
      setCharacterMessage("Welcome to playground. Let's start learning");
      return;
    }

    // If tutorial not active, fallback to error/correct/idle
    if (!(level === "Beginner" && tutorialStep < tutorialHints.length)) {
      if (errors.length > 0) {
        setCharacterMood("error");
        setCharacterMessage(`Oops! ${errors.length} error(s) detected!`);
      } else if (code.trim() !== "") {
        setCharacterMood("correctcode");
        setCharacterMessage("All good! 🎉");
      } else {
        setCharacterMood("idle");
        setCharacterMessage("Keep coding! 😎");
      }
      const timer = setTimeout(() => setCharacterMessage(""), 3000);
      return () => clearTimeout(timer);
    }
    // Otherwise, don't override mood/message (handled in tutorial logic)
    // No timer here to keep tutorial message visible
  }, [
    errors,
    code,
    showWelcome,
    tutorialStep,
    level,
    tutorialHints.length,
    tutorialStepExpert,
  ]);

  useEffect(() => {
    if (!isMounted) return;
    setCode(presets[level]);
    const local = readSavedSnippets();
    setSavedItems(local);
    // Reset tutorial step if level changes
    setTutorialStep(0);
    // Optionally merge Firebase-sourced snippets
    // loadSnippetsFromFirebase().then(remote => setSavedItems(prev => [...remote, ...prev]));
  }, [isMounted, level, presets, readSavedSnippets]);

  useEffect(() => {
    if (!isMounted) return;
    updatePreview();
  }, [code, updatePreview, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        updatePreview();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [updatePreview, isMounted]);

  /* ------------------------------- Status UI -------------------------------- */
  const StatusBadge: React.FC<{
    status: "Ready" | "Updating..." | "Updated";
  }> = ({ status }) => {
    const cls =
      status === "Updating..."
        ? "bg-yellow-400/10 text-yellow-300 ring-1 ring-yellow-500/30"
        : status === "Updated"
        ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-500/30"
        : "bg-indigo-400/10 text-indigo-200 ring-1 ring-indigo-500/30";
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{status}</span>
    );
  };

  /* ------------------------------- Rendering -------------------------------- */
  if (!isMounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Nebula background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2e026d] via-[#15162c] to-[#0f172a]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-300 to-sky-300">
            TailSpark Playground
          </h1>
          <p className="mt-2 text-indigo-200/80 text-sm">
            Master Tailwind CSS through interactive learning
          </p>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          ref={playgroundRef}
        >
          {/* Editor Column */}
          <section className="relative flex flex-col space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-700/60 to-fuchsia-700/60">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-white" />
                  <h2 className="text-white font-semibold">
                    Edit Tailwind HTML
                  </h2>
                  <span className="text-sm text-indigo-200 ml-2">Preset:</span>
                  <select
                    value={level}
                    onChange={(e) => {
                      const v = e.target.value as
                        | "Beginner"
                        | "Intermediate"
                        | "Expert";
                      setLevel(v);
                      setCode(presets[v]);
                    }}
                    className="ml-2 bg-white/10 text-white px-2 py-1 rounded text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
                  >
                    <option className="bg-slate-800" value="Beginner">
                      Beginner
                    </option>
                    <option className="bg-slate-800" value="Intermediate">
                      Intermediate
                    </option>
                    <option className="bg-slate-800" value="Expert">
                      Expert
                    </option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={updatePreview}
                    title="Run (Ctrl + Enter)"
                    className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm shadow hover:shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Run
                  </button>

                  <button
                    onClick={() =>
                      setSaveName(`Code ${new Date().toLocaleTimeString()}`)
                    }
                    title="Prepare save name"
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-3 py-1.5 rounded-lg text-sm shadow hover:shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="bg-slate-950/90 p-4">
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setCode(newCode);
                    // Tutorial logic: check progress for each level
                    if (
                      level === "Beginner" &&
                      tutorialStep < tutorialHints.length
                    ) {
                      const currentHint = tutorialHints[tutorialStep];
                      if (
                        currentHint &&
                        currentHint.expectedRegex.test(newCode)
                      ) {
                        setTutorialStep(tutorialStep + 1);
                        setCharacterMood("motivating");
                        setCharacterMessage("Awesome! Next step unlocked!");
                        if (tutorialStep + 1 < tutorialHints.length) {
                          setTimeout(() => {
                            setCharacterMood("hello");
                            setCharacterMessage(
                              tutorialHints[tutorialStep + 1].message
                            );
                          }, 2000);
                        }
                        return;
                      }
                    }
                    if (
                      level === "Intermediate" &&
                      tutorialStepIntermediate < intermediateHints.length
                    ) {
                      const currentHint =
                        intermediateHints[tutorialStepIntermediate];
                      if (
                        currentHint &&
                        currentHint.expectedRegex.test(newCode)
                      ) {
                        setTutorialStepIntermediate(
                          tutorialStepIntermediate + 1
                        );
                        setCharacterMood("motivating");
                        setCharacterMessage(
                          "Great job! Next intermediate step!"
                        );
                        if (
                          tutorialStepIntermediate + 1 <
                          intermediateHints.length
                        ) {
                          setTimeout(() => {
                            setCharacterMood("hello");
                            setCharacterMessage(
                              intermediateHints[tutorialStepIntermediate + 1]
                                .message
                            );
                          }, 2000);
                        }
                        return;
                      }
                    }
                    if (
                      level === "Expert" &&
                      tutorialStepExpert < expertHints.length
                    ) {
                      const currentHint = expertHints[tutorialStepExpert];
                      if (
                        currentHint &&
                        currentHint.expectedRegex.test(newCode)
                      ) {
                        setTutorialStepExpert(tutorialStepExpert + 1);
                        setCharacterMood("motivating");
                        setCharacterMessage("Excellent! Next expert step!");
                        if (tutorialStepExpert + 1 < expertHints.length) {
                          setTimeout(() => {
                            setCharacterMood("hello");
                            setCharacterMessage(
                              expertHints[tutorialStepExpert + 1].message
                            );
                          }, 2000);
                        }
                        return;
                      }
                    }
                  }}
                  spellCheck={false}
                  className="w-full h-96 resize-none bg-transparent text-emerald-300/95 placeholder-indigo-300 font-mono text-sm leading-5 focus:outline-none caret-fuchsia-300"
                />
              </div>
            </div>

            {/* Tutorial Hint under editor */}
            {(level === "Beginner" && tutorialStep < tutorialHints.length) ||
            (level === "Intermediate" &&
              tutorialStepIntermediate < intermediateHints.length) ||
            (level === "Expert" && tutorialStepExpert < expertHints.length)
              ? (() => {
                  // Mood images
                  const moodImages: Record<string, string> = {
                    happy: "/characters/happy_face.png",
                    error: "/characters/error_face.png",
                    motivating: "/characters/cat_motivating.png",
                    hello: "/characters/cat_hello.png",
                    idle: "/characters/idle_face.png",
                    correctcode: "/characters/correctcode_face.png",
                    cat_eat_fish: "/characters/cat_eat_fish.png",
                  };
                  if (level === "Expert") {
                    // Show cat_eat_fish image and fixed message for Expert
                    return (
                      <div className="mt-2 flex items-center gap-4 rounded-2xl bg-indigo-500/10 ring-2 ring-indigo-400/30 shadow-lg px-6 py-4 text-indigo-100 transition-all">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-indigo-700/20 flex items-center justify-center">
                          <img
                            src="/characters/cat_eat_fish.png"
                            alt="Cat eating fish"
                            className="w-12 h-12 rounded-full"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm text-indigo-300 uppercase tracking-wider font-medium">
                            Expert Stage
                          </span>
                          <p className="text-indigo-100 font-semibold">
                            Stage is yours, try new things out here
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="mt-2 flex items-center gap-4 rounded-2xl bg-indigo-500/10 ring-2 ring-indigo-400/30 shadow-lg px-6 py-4 text-indigo-100 transition-all">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-indigo-700/20 flex items-center justify-center">
                        <img
                          src={moodImages[characterMood] || moodImages.idle}
                          alt="Character"
                          className="w-12 h-12 rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm text-indigo-300 uppercase tracking-wider font-medium">
                          Tutorial Step{" "}
                          {level === "Beginner"
                            ? tutorialStep + 1
                            : tutorialStepIntermediate + 1}
                        </span>
                        <p className="text-indigo-100 font-semibold">
                          {level === "Beginner"
                            ? tutorialHints[tutorialStep].message
                            : intermediateHints[tutorialStepIntermediate]
                                .message}
                        </p>
                      </div>
                    </div>
                  );
                })()
              : null}

            {/* Action Row */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveSubmit(false)}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2"
                  title="Save locally"
                >
                  <Save className="w-4 h-4" /> Save (Local)
                </button>

                <button
                  onClick={async () => {
                    const nameToUse =
                      saveName.trim() ||
                      `Code ${new Date().toLocaleTimeString()}`;
                    const saved = await saveLocally(nameToUse, code);
                    await saveSnippetToFirebase(saved);
                    alert(
                      "Saved locally and (stub) to Firebase. Replace stub with Firestore implementation to persist on cloud."
                    );
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2"
                  title="Save to Firebase (stub)"
                >
                  <Database className="w-4 h-4" /> Save → Firebase
                </button>

                <button
                  onClick={() => downloadToDisk("html")}
                  className="px-3 py-2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-lg flex items-center gap-2 border border-white/10 transition-all"
                >
                  <Download className="w-4 h-4" /> Download HTML
                </button>

                <button
                  onClick={() => downloadToDisk("txt")}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg flex items-center gap-2 border border-white/10 transition-all"
                >
                  <Download className="w-4 h-4" /> Download TXT
                </button>
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    if (!editorRef.current) return;
                    navigator.clipboard?.writeText(editorRef.current.value);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-lg flex items-center gap-2 transition-all"
                  title="Copy code to clipboard"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>

                <button
                  onClick={() => {
                    setCode(presets[level]);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg flex items-center gap-2 transition-all"
                  title="Reset to preset"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Error Panel */}
            {errors.length > 0 && (
              <div
                className={`mt-1 rounded-2xl overflow-hidden transition-all border ${
                  showErrors ? "" : ""
                } bg-rose-900/20 border-rose-500/20 backdrop-blur`}
              >
                <div
                  className="px-4 py-2 bg-rose-900/40 border-b border-rose-500/20 flex justify-between items-center cursor-pointer"
                  onClick={() => setShowErrors((s) => !s)}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-300" />
                    <h3 className="font-semibold text-rose-100">
                      Errors ({errors.length})
                    </h3>
                  </div>
                  <button className="text-rose-200">
                    {showErrors ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {showErrors && (
                  <div className="p-3 max-h-64 overflow-y-auto">
                    <ul className="space-y-2 text-sm">
                      {errors.map((err, idx) => (
                        <li
                          key={`${err.line}-${idx}`}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5">
                            {err.severity === "error" ? (
                              <AlertCircle className="w-5 h-5 text-rose-300" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-amber-300" />
                            )}
                          </div>
                          <div className="flex-1 text-indigo-100/90">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-rose-200">
                                Line {err.line}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  err.type === "HTML"
                                    ? "bg-blue-400/10 text-blue-200 ring-1 ring-blue-400/20"
                                    : "bg-purple-400/10 text-purple-200 ring-1 ring-purple-400/20"
                                }`}
                              >
                                {err.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  err.severity === "error"
                                    ? "bg-rose-400/10 text-rose-200 ring-1 ring-rose-400/20"
                                    : "bg-amber-400/10 text-amber-200 ring-1 ring-amber-400/20"
                                }`}
                              >
                                {err.severity}
                              </span>
                              {err.word && (
                                <span className="ml-auto text-xs text-indigo-200/70 italic">
                                  "{err.word}"
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-indigo-100/90">
                              {err.message}
                              <button
                                onClick={() => jumpToLine(err.line)}
                                className="ml-3 text-fuchsia-300 hover:text-fuchsia-200 text-xs"
                                title={`Jump to line ${err.line}`}
                              >
                                Jump
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Controls for snippet saving, now moved to Preview & Saved Column */}
          </section>

          {/* Preview & Saved Column */}
          <aside className="flex flex-col space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-700/60 to-fuchsia-700/60">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-white" />
                  <h3 className="font-semibold text-white">Live Preview</h3>
                </div>
                <StatusBadge status={status} />
              </div>

              <div
                ref={previewRef}
                className="h-96 overflow-auto bg-gradient-to-b from-indigo-950/60 to-indigo-900/30 p-4"
              />
            </div>

            {/* Controls for snippet saving */}
            <div className="flex items-center gap-3 mb-4">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Snippet name (optional)"
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-indigo-100 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
              />
              <button
                onClick={() => handleSaveSubmit(false)}
                className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl"
              >
                Quick Save
              </button>
              <button
                onClick={() => handleSaveSubmit(true)}
                className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl"
              >
                Save + Firebase (stub)
              </button>
              <button
                onClick={handleClearAllSaves}
                className="px-3 py-2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white rounded-xl"
              >
                Clear All Saves
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-indigo-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-300" /> Saved Snippets
                </h4>
                <span className="text-xs bg-white/10 text-indigo-200 px-2 py-1 rounded-full border border-white/10">
                  {savedItems.length}
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedItems.length === 0 ? (
                  <div className="text-sm text-indigo-200/70 text-center py-6">
                    No saved code snippets yet
                  </div>
                ) : (
                  savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 border border-white/10 rounded-xl bg-white/5 text-indigo-100"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-indigo-200/70">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          title="Load snippet"
                          onClick={() => handleLoadCode(item.code)}
                          className="px-2 py-1 bg-white/10 border border-white/10 rounded text-sm hover:bg-white/15"
                        >
                          Load
                        </button>
                        <button
                          title="Delete snippet"
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2 py-1 bg-rose-500/10 border border-rose-400/20 rounded text-sm text-rose-200 hover:bg-rose-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Welcome modal */}
            {showWelcome && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10">
                  <div className="bg-gradient-to-r from-indigo-700 to-fuchsia-700 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white">
                      Welcome to TailSpark! 🎉
                    </h2>
                  </div>
                  <div className="p-6">
                    <p className="text-indigo-100/90 mb-6 text-center">
                      Start experimenting with Tailwind HTML. Edit on the left,
                      preview on the right. Save locally or later connect to
                      Firebase.
                    </p>

                    <div className="bg-indigo-400/10 ring-1 ring-indigo-400/20 p-4 rounded-xl mb-4">
                      <h3 className="font-semibold text-indigo-100">
                        Quick tips
                      </h3>
                      <ul className="list-disc list-inside text-indigo-200 text-sm mt-2 space-y-1">
                        <li>Use the preset selector to load sample layouts.</li>
                        <li>
                          Press{" "}
                          <span className="font-semibold">Ctrl + Enter</span> to
                          run.
                        </li>
                        <li>
                          Click an error's "Jump" to focus the offending line.
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowWelcome(false);
                          localStorage.setItem("welcomeShown", "true");
                        }}
                        className="flex-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl"
                      >
                        Let's go
                      </button>
                      <button
                        onClick={() => {
                          setShowWelcome(false);
                        }}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

/* ------------------------ ChatWidget Component ------------------------ */
const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data: { reply?: string; error?: string } = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot" as "bot", text: data.reply ?? "No reply from AI" },
      ]);
      setIsLoading(false);
    } catch {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot" as "bot",
            text: "Error fetching reply. Please try again.",
          },
        ]);
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white rounded-t-2xl">
            <span className="font-semibold">AI Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-sm">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm text-indigo-100">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-lg max-w-[75%] ${
                  m.role === "user"
                    ? "ml-auto bg-indigo-500 text-white"
                    : "mr-auto bg-fuchsia-500/80 text-white"
                }`}
              >
                {m.text}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto px-3 py-2 rounded-lg max-w-[75%] bg-fuchsia-500/60 text-white animate-pulse">
                ...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/20 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me about Tailwind..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="px-3 py-2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white rounded-lg"
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 shadow-lg flex items-center justify-center text-white text-xl"
        >
          💬
        </button>
      )}
    </div>
  );
};

// Wrapper component for the page
const PlaygroundPage: React.FC = () => {
  return (
    <>
      <TailwindPlaygroundNoNav />
      <ChatWidget />
    </>
  );
};

export default PlaygroundPage;

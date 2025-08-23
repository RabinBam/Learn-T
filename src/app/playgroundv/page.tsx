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
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";

/**
 * TailwindPlaygroundNoNav.tsx
 *
 * - Navigation removed
 * - Local saving / download (.html /.txt)
 * - localStorage persistence of snippets
 * - Improved error detection:
 *    - reports line number, severity, and the exact offending word/snippet
 *    - supports HTML tag issues and Tailwind-ish classname basic validation
 * - Error list items can be clicked to jump/select the offending line in the editor
 * - Firebase placeholders with explicit instructions where to add your code
 *
 * Usage:
 * - Place file in your app (e.g. app/components/)
 * - Import and render in a page or layout
 *
 * Firebase quick setup guide (copy into lib/firebase.ts):
 * -----------------------------------------------------
 * 1) npm install firebase
 * 2) Create `lib/firebase.ts`:
 *
 * import { initializeApp } from "firebase/app";
 * import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
 *
 * const firebaseConfig = {
 *   apiKey: "YOUR_API_KEY",
 *   authDomain: "YOUR_AUTH_DOMAIN",
 *   projectId: "YOUR_PROJECT_ID",
 *   storageBucket: "YOUR_STORAGE_BUCKET",
 *   messagingSenderId: "YOUR_MSG_SENDER_ID",
 *   appId: "YOUR_APP_ID",
 * };
 *
 * const app = initializeApp(firebaseConfig);
 * export const db = getFirestore(app);
 *
 * 3) Replace the stubs saveSnippetToFirebase/loadSnippetsFromFirebase/deleteSnippetFromFirebase
 *    inside this file with Firestore calls (examples are provided in comments where the stubs are).
 */

/* ----------------------------- TypeScript types ---------------------------- */

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

/* --------------------------------- Component -------------------------------- */

const TailwindPlaygroundNoNav: React.FC = () => {
  // Hydration guard
  const [isMounted, setIsMounted] = useState(false);

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
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  // Refs
  const previewRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  /* ----------------------------- Preset templates ---------------------------- */
  const presets = useMemo(
    () => ({
      Beginner:
        '<div class="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">\n  <h1 class="text-2xl font-bold text-gray-800">Hello Tailwind!</h1>\n  <p class="text-gray-600 mt-2">This is a simple beginner layout. Edit this code to see live changes.</p>\n  <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Click Me</button>\n</div>',
      Intermediate:
        '<div class="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">\n  <h2 class="text-xl font-semibold text-gray-800 mb-2">Intermediate Layout</h2>\n  <p class="text-gray-600 mb-4">This example includes grid layout and more advanced styling.</p>\n  <div class="grid grid-cols-3 gap-4 mb-4">\n    <div class="bg-blue-100 p-4 rounded-lg text-center">1</div>\n    <div class="bg-blue-200 p-4 rounded-lg text-center">2</div>\n    <div class="bg-blue-300 p-4 rounded-lg text-center">3</div>\n  </div>\n  <button class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity">Continue</button>\n</div>',
      Expert:
        '<div class="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-8">\n  <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full">\n    <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">Expert Level UI</h1>\n    <p class="text-gray-600 mb-6">This example uses gradients, custom animations, and complex responsive layouts.</p>\n    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">\n      <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-xl transform hover:-translate-y-1 transition-transform">\n        <h3 class="font-semibold text-yellow-800">Feature One</h3>\n        <p class="text-yellow-600 text-sm mt-2">With hover effects</p>\n      </div>\n      <div class="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl transform hover:-translate-y-1 transition-transform">\n        <h3 class="font-semibold text-green-800">Feature Two</h3>\n        <p class="text-green-600 text-sm mt-2">And smooth transitions</p>\n      </div>\n    </div>\n    <button class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">Launch Project 🚀</button>\n  </div>\n</div>',
    }),
    []
  );

  /* ----------------------------- Error detection ----------------------------- */
  const detectErrors = useCallback((codeContent: string): ErrorItem[] => {
    const found: ErrorItem[] = [];
    const lines = codeContent.split("\n");

    const tagStack: Array<{ tag: string; line: number }> = [];

    // Tailwind class validator (permissive, accepts responsive prefixes, pseudo prefixes, arbitrary values)
    // This regex allows letters, numbers, -, _, :, /, [], %, ., #, (, ), @
    const tailwindClassRegex = /^[a-z0-9@_\-:\/\[\]\.%()#]+$/i;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // HTML tag parsing (simple, not full parser)
      const tagRegex = /<\/?([a-z][a-z0-9-]*)\b([^>]*)>/gi;
      let match: RegExpExecArray | null;
      while ((match = tagRegex.exec(line)) !== null) {
        const full = match[0];
        const tag = match[1].toLowerCase();
        const attrs = match[2] || "";

        // closing tag
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
          // opening tag (skip void elements)
          if (
            !full.endsWith("/>") &&
            !["img", "br", "hr", "input", "meta", "link"].includes(tag)
          ) {
            tagStack.push({ tag, line: lineNumber });
          }
        }

        // check for malformed attributes in this tag substring (very basic)
        if (attrs && /(\w+=[^\s"'>]+)/.test(attrs)) {
          // attribute values should be quoted
          found.push({
            type: "HTML",
            line: lineNumber,
            message: `Attribute values should be quoted in ${full}`,
            severity: "warning",
            word: attrs.trim().split(/\s+/)[0],
          });
        }
      }

      // Malformed standalone class attribute (e.g., class=noquotes)
      if (line.includes("class=") && !line.match(/class\s*=\s*"(.*?)"/)) {
        // Find approximate token
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

      // Tailwind-like class checking: extract class="..."/className="..."
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
            // optional: flag suspicious patterns (typos like 'bg--blue' or stray colon at end)
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

      // Basic check for missing closing angle bracket
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

    // any unclosed tags left?
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
  // STUBS - replace with your Firestore calls after adding lib/firebase.ts
  // Example:
  // import { db } from '@/lib/firebase'
  // import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

  const saveSnippetToFirebase = useCallback(async (item: SavedItem) => {
    // STUB - replace with Firestore call e.g.:
    // const docRef = await addDoc(collection(db, 'snippets'), item);
    // return { ...item, id: docRef.id };
    console.info("[Firebase Stub] saveSnippetToFirebase", item);
    return { ...item };
  }, []);

  const loadSnippetsFromFirebase = useCallback(async (): Promise<
    SavedItem[]
  > => {
    // STUB - replace with Firestore fetching logic:
    // const snap = await getDocs(collection(db, 'snippets'));
    // return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    console.info("[Firebase Stub] loadSnippetsFromFirebase");
    return [];
  }, []);

  const deleteSnippetFromFirebase = useCallback(async (id: string) => {
    // STUB - replace with Firestore delete logic:
    // await deleteDoc(doc(db, 'snippets', id));
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

  const handleSaveClick = useCallback(() => {
    setSaveName(`Code ${new Date().toLocaleTimeString()}`);
  }, []);

  const handleSaveSubmit = useCallback(
    async (alsoSaveToFirebase = false) => {
      const nameToUse =
        saveName.trim() || `Code ${new Date().toLocaleTimeString()}`;

      try {
        const saved = await saveLocally(nameToUse, code);

        if (alsoSaveToFirebase) {
          // Replace the stub with a Firestore implementation
          await saveSnippetToFirebase(saved);
          // Optionally replace the saved.id after firebase returns actual id
        }

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

        // If you add Firebase deletion, call deleteSnippetFromFirebase(id) here.
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

    // status animation
    setTimeout(() => {
      setStatus("Updated");
      setTimeout(() => setStatus("Ready"), 1200);
    }, 250);
  }, [code, detectErrors]);

  /* --------------------------- Download to disk ----------------------------- */

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

  /* ------------------------- Editor helper: jump to line -------------------- */

  const jumpToLine = useCallback((lineNumber: number) => {
    const ta = editorRef.current;
    if (!ta) return;
    const lines = ta.value.split("\n");

    // compute start index of line
    let start = 0;
    for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
      start += lines[i].length + 1; // +1 for newline
    }
    const lineText = lines[lineNumber - 1] ?? "";
    const end = start + lineText.length;

    // focus and select that line
    ta.focus();
    ta.selectionStart = start;
    ta.selectionEnd = end;

    // scroll to approx position - compute line height
    try {
      const style = window.getComputedStyle(ta);
      const lineHeightStr = style.lineHeight;
      const lineHeight =
        lineHeightStr && lineHeightStr.includes("px")
          ? parseFloat(lineHeightStr)
          : 18;
      ta.scrollTop = Math.max(0, (lineNumber - 1) * lineHeight - 40); // offset
    } catch {
      // fallback
      ta.scrollTop = Math.max(0, (lineNumber - 1) * 18 - 40);
    }
  }, []);

  /* -------------------------- Component lifecycle --------------------------- */

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    setCode(presets[level]);

    // load saved snippets
    const local = readSavedSnippets();
    setSavedItems(local);

    // If you implement Firebase load, call loadSnippetsFromFirebase here and merge results
    // Example:
    // loadSnippetsFromFirebase().then(remote => setSavedItems(prev => [...remote, ...prev]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

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
        ? "bg-yellow-100 text-yellow-800"
        : status === "Updated"
        ? "bg-green-100 text-green-800"
        : "bg-purple-100 text-purple-800";
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{status}</span>
    );
  };

  /* ------------------------------- Rendering -------------------------------- */

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Column */}
          <section className="flex flex-col space-y-4">
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between bg-gray-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-white" />
                  <h2 className="text-white font-semibold">
                    Edit Tailwind HTML
                  </h2>
                  <span className="text-sm text-gray-300 ml-2">Preset:</span>
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
                    className="ml-2 bg-indigo-700 text-white px-2 py-1 rounded text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={updatePreview}
                    title="Run (Ctrl + Enter)"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Run
                  </button>

                  <button
                    onClick={() =>
                      setSaveName(`Code ${new Date().toLocaleTimeString()}`)
                    }
                    title="Prepare save name"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="bg-gray-900 p-4">
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full h-96 resize-none bg-transparent text-green-300 font-mono text-sm leading-5 focus:outline-none"
                />
              </div>
            </div>

            {/* Buttons row (compact, consistent sizes) */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveSubmit(false)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
                  title="Save locally"
                >
                  <Save className="w-4 h-4" /> Save (Local)
                </button>

                <button
                  onClick={async () => {
                    // Save locally first
                    const nameToUse =
                      saveName.trim() ||
                      `Code ${new Date().toLocaleTimeString()}`;
                    const saved = await saveLocally(nameToUse, code);
                    // Then call Firebase stub (replace later)
                    await saveSnippetToFirebase(saved);
                    alert(
                      "Saved locally and (stub) to Firebase. Replace stub with Firestore implementation to persist on cloud."
                    );
                  }}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
                  title="Save to Firebase (stub)"
                >
                  <Database className="w-4 h-4" /> Save → Firebase
                </button>

                <button
                  onClick={() => downloadToDisk("html")}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download HTML
                </button>

                <button
                  onClick={() => downloadToDisk("txt")}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download TXT
                </button>
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    if (!editorRef.current) return;
                    navigator.clipboard
                      ?.writeText(editorRef.current.value)
                      .then(() => {
                        // feedback
                      });
                  }}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded flex items-center gap-2"
                  title="Copy code to clipboard"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>

                <button
                  onClick={() => {
                    setCode(presets[level]);
                  }}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded flex items-center gap-2"
                  title="Reset to preset"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Error Panel */}
            {errors.length > 0 && (
              <div
                className={`mt-1 bg-red-50 border border-red-200 rounded-lg overflow-hidden transition-all ${
                  showErrors ? "max-h-96" : "max-h-12"
                }`}
              >
                <div
                  className="px-4 py-2 bg-red-100 border-b border-red-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setShowErrors((s) => !s)}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-700" />
                    <h3 className="font-semibold text-red-800">
                      Errors ({errors.length})
                    </h3>
                  </div>
                  <button className="text-red-600">
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
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-red-800">
                                Line {err.line}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  err.type === "HTML"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {err.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  err.severity === "error"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {err.severity}
                              </span>
                              {err.word && (
                                <span className="ml-auto text-xs text-gray-600 italic">
                                  "{err.word}"
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-gray-700">
                              {err.message}
                              <button
                                onClick={() => jumpToLine(err.line)}
                                className="ml-3 text-indigo-600 text-xs"
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

            {/* Save snippets small controls */}
            <div className="flex gap-2 items-center">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Snippet name (optional)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => handleSaveSubmit(false)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Quick Save
              </button>
              <button
                onClick={() => handleSaveSubmit(true)}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save + Firebase (stub)
              </button>
              <button
                onClick={handleClearAllSaves}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
              >
                Clear All Saves
              </button>
            </div>
          </section>

          {/* Preview & Saved Column */}
          <aside className="flex flex-col space-y-4">
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 bg-purple-200">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-purple-800" />
                  <h3 className="font-semibold text-purple-800">
                    Live Preview
                  </h3>
                </div>
                <StatusBadge status={status} />
              </div>

              <div
                ref={previewRef}
                className="h-96 overflow-auto bg-gradient-to-b from-purple-50 to-purple-100 p-4"
              />
            </div>

            <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" /> Saved Snippets
                </h4>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {savedItems.length}
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedItems.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-6">
                    No saved code snippets yet
                  </div>
                ) : (
                  savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 border rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          title="Load snippet"
                          onClick={() => handleLoadCode(item.code)}
                          className="px-2 py-1 bg-white border rounded text-sm hover:bg-gray-50"
                        >
                          Load
                        </button>
                        <button
                          title="Delete snippet"
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2 py-1 bg-red-50 rounded text-sm text-red-700 hover:bg-red-100"
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
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white">
                      Welcome to TailSpark! 🎉
                    </h2>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 text-center">
                      Start experimenting with Tailwind HTML. Edit on the left,
                      preview on the right. Save locally or later connect to
                      Firebase.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h3 className="font-semibold text-blue-800">
                        Quick tips
                      </h3>
                      <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
                        <li>Use the preset selector to load sample layouts.</li>
                        <li>
                          Press{" "}
                          <span className="font-semibold">Ctrl + Enter</span> to
                          run.
                        </li>
                        <li>
                          Click an error's "Jump" to focus and select the
                          offending line.
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowWelcome(false);
                          localStorage.setItem("welcomeShown", "true");
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                      >
                        Let's go
                      </button>
                      <button
                        onClick={() => {
                          setShowWelcome(false);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
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

export default TailwindPlaygroundNoNav;

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
} from "lucide-react";

/**
 * TailwindPlaygroundNoNav.tsx
 *
 * Full, drop-in client component for Next.js (App Router).
 * - Navigation bar removed as requested.
 * - Local disk saving (download .html/.txt).
 * - Local persistence using localStorage.
 * - Firebase placeholders with clear comments showing where to add
 *   Firebase init and Firestore/Realtime DB calls later.
 * - SSR/hydration safe (isMounted gate + typeof window checks).
 *
 * To use:
 * - Place in your project (e.g. app/components/TailwindPlaygroundNoNav.tsx)
 * - Import and render in any page or route
 *
 * NOTE: This file intentionally does NOT include actual Firebase code.
 * See the TODO markers below for exactly where to paste your Firebase logic.
 */

/* ----------------------------- TypeScript types ---------------------------- */

interface ErrorItem {
  type: "HTML" | "Tailwind";
  line: number;
  message: string;
  severity: "error" | "warning";
}

interface SavedItem {
  id: string;
  name: string;
  code: string;
  timestamp: string;
  level?: string;
}

type Level = "Beginner" | "Intermediate" | "Expert";

/* --------------------------------- Component -------------------------------- */

const TailwindPlaygroundNoNav: React.FC = () => {
  // Hydration guard to avoid SSR/localStorage problems
  const [isMounted, setIsMounted] = useState(false);

  // Editor state
  const [code, setCode] = useState<string>("");
  const [level, setLevel] = useState<Level>("Beginner");

  // UI state
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
  const presets: Record<Level, string> = useMemo(
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

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // naive tag parsing (works for typical cases; not a full HTML parser)
      const tagRegex = /<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi;
      let match: RegExpExecArray | null;
      while ((match = tagRegex.exec(line)) !== null) {
        const full = match[0];
        const tag = match[1];

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
            });
          } else {
            tagStack.pop();
          }
        } else if (
          !full.endsWith("/>") &&
          !["img", "br", "hr", "input", "meta", "link"].includes(tag)
        ) {
          tagStack.push({ tag, line: lineNumber });
        }
      }

      // class attribute basic checks
      if (line.includes("class=") && !line.match(/class="[^"]*"/)) {
        found.push({
          type: "HTML",
          line: lineNumber,
          message:
            'Malformed class attribute - ensure double quotes: class="..."',
          severity: "warning",
        });
      }

      // check attributes without quotes
      if (/\w+=[^"'\s>]+[\s>]/.test(line)) {
        found.push({
          type: "HTML",
          line: lineNumber,
          message: "Attribute value should be quoted",
          severity: "warning",
        });
      }

      // simple tailwind-ish classname validation
      const classMatches = line.match(/class="([^"]*)"/g);
      if (classMatches) {
        classMatches.forEach((cm) => {
          const content = cm.match(/class="([^"]*)"/);
          if (content && content[1]) {
            const classes = content[1].split(/\s+/);
            classes.forEach((cls) => {
              if (cls && !/^[a-z0-9-_:\/\[\]\.%]+$/i.test(cls)) {
                found.push({
                  type: "Tailwind",
                  line: lineNumber,
                  message: `Potential invalid classname: "${cls}"`,
                  severity: "warning",
                });
              }
            });
          }
        });
      }
    });

    // any unclosed tags left?
    if (tagStack.length > 0) {
      tagStack.forEach((t) =>
        found.push({
          type: "HTML",
          line: t.line,
          message: `Unclosed tag: <${t.tag}>`,
          severity: "error",
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
  /**
   * TODO (FIREBASE):
   *
   * 1) Create a file like `lib/firebase.ts` and initialize Firebase there:
   *
   * import { initializeApp } from "firebase/app";
   * import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
   *
   * const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... };
   * const app = initializeApp(firebaseConfig);
   * export const db = getFirestore(app);
   *
   * 2) Here, replace the stub implementations below with real Firestore calls.
   *
   * Example usage:
   * await addDoc(collection(db, 'snippets'), { name, code, timestamp: new Date().toISOString(), level });
   *
   */

  // Stub: replace with actual upload function
  const saveSnippetToFirebase = useCallback(async (item: SavedItem) => {
    // STUB - replace with Firestore call
    // Example:
    // const docRef = await addDoc(collection(db, 'snippets'), item);
    console.info("[Firebase Stub] saveSnippetToFirebase called", item);
    // Optionally return a saved id if using Firestore return value
    return { ...item, id: item.id };
  }, []);

  const loadSnippetsFromFirebase = useCallback(async (): Promise<
    SavedItem[]
  > => {
    // STUB - replace with Firestore fetching logic
    // Example:
    // const q = query(collection(db, 'snippets'), orderBy('timestamp', 'desc'));
    // const snap = await getDocs(q);
    // return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    console.info("[Firebase Stub] loadSnippetsFromFirebase called");
    return [];
  }, []);

  const deleteSnippetFromFirebase = useCallback(async (id: string) => {
    // STUB - replace with Firestore delete logic
    // Example: await deleteDoc(doc(db, 'snippets', id));
    console.info("[Firebase Stub] deleteSnippetFromFirebase called", id);
  }, []);

  /* ------------------------------ Save / Load ------------------------------- */

  const saveLocally = useCallback(
    async (name: string, codeContent: string) => {
      // Create SavedItem and write to localStorage
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

  const handleSaveSubmit = useCallback(async () => {
    const nameToUse =
      saveName.trim() || `Code ${new Date().toLocaleTimeString()}`;

    try {
      const saved = await saveLocally(nameToUse, code);

      // Also optionally save to Firebase (commented for now; user will toggle later)
      // await saveSnippetToFirebase(saved);

      // small UI feedback
      setSaveName("");
    } catch (e) {
      console.error("Failed to save snippet", e);
    }
  }, [code, saveLocally, saveName, saveSnippetToFirebase]);

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

        // Also delete from Firebase if you implement it later:
        // await deleteSnippetFromFirebase(id);
      } catch (e) {
        console.error("Failed to delete snippet", e);
      }
    },
    [readSavedSnippets, writeSavedSnippets, deleteSnippetFromFirebase]
  );

  /* ------------------------------ Preview / Run ----------------------------- */

  const updatePreview = useCallback(() => {
    setStatus("Updating...");
    const detected = detectErrors(code);
    setErrors(detected);
    setShowErrors(detected.length > 0);

    if (previewRef.current) {
      // NOTE: injecting HTML for preview. Keep sandboxed in production if needed.
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

  /* -------------------------- Component lifecycle --------------------------- */

  // mount gate + initial load
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // initial code preset
    setCode(presets[level]);

    // load saved snippets from localStorage
    const local = readSavedSnippets();
    setSavedItems(local);

    // Optionally load from Firebase (if you implement loadSnippetsFromFirebase)
    // (Uncomment after implementing firebase)
    // loadSnippetsFromFirebase().then(remote => {
    //   setSavedItems(prev => [...remote, ...prev]);
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // update preview whenever code changes (live preview)
  useEffect(() => {
    if (!isMounted) return;
    updatePreview();
  }, [code, updatePreview, isMounted]);

  // keyboard shortcut ctrl+enter to run
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

  if (!isMounted) {
    // avoid SSR mismatches
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Column */}
          <section className="flex flex-col">
            <div className="bg-gray-800 rounded-t-xl border-2 border-indigo-500 overflow-hidden">
              <div className="px-4 py-3 bg-indigo-900 border-b border-indigo-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Code className="mr-2 w-5 h-5" />
                  Edit Tailwind HTML
                </h2>

                <div className="flex items-center space-x-3">
                  <select
                    value={level}
                    onChange={(e) => {
                      const v = e.target.value as Level;
                      setLevel(v);
                      setCode(presets[v]);
                    }}
                    className="bg-indigo-800 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>

                  <button
                    onClick={updatePreview}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center font-medium transition-colors shadow"
                    title="Run (Ctrl + Enter)"
                  >
                    <Play className="mr-2 w-4 h-4" />
                    Run
                  </button>

                  <button
                    onClick={() => {
                      setSaveName(`Code ${new Date().toLocaleTimeString()}`);
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center font-medium transition-colors shadow"
                    title="Prepare save"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900 text-green-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-700"
                placeholder="<!-- Type your Tailwind HTML here -->"
              />
            </div>

            {/* Error Panel */}
            {errors.length > 0 && (
              <div
                className={`mt-4 bg-red-50 border border-red-200 rounded-lg overflow-hidden transition-all ${
                  showErrors ? "max-h-96" : "max-h-12"
                }`}
              >
                <div
                  className="px-4 py-2 bg-red-100 border-b border-red-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setShowErrors((s) => !s)}
                >
                  <h3 className="font-semibold text-red-800 flex items-center">
                    <AlertCircle className="mr-2 w-4 h-4" />
                    Errors ({errors.length})
                  </h3>
                  <button className="text-red-600">
                    {showErrors ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {showErrors && (
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <ul className="space-y-2">
                      {errors.map((err, idx) => (
                        <li
                          key={`${err.line}-${idx}`}
                          className="flex items-start space-x-2 text-sm"
                        >
                          {err.severity === "error" ? (
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-red-800">
                                Line {err.line}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  err.type === "HTML"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {err.type}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  err.severity === "error"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {err.severity}
                              </span>
                            </div>
                            <p className="text-red-700 mt-1">{err.message}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Save Controls */}
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex gap-2 items-center">
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Name your code snippet (optional)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSaveSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save (Local)
                </button>

                {/* Save to Firebase button: calls the stub. Replace with real function later */}
                <button
                  onClick={async () => {
                    if (!saveName.trim()) {
                      alert(
                        "Please enter a name before saving to Firebase (or save locally first)."
                      );
                      return;
                    }
                    const saved = await saveLocally(saveName.trim(), code);
                    // Replace stub below with your firebase implementation:
                    await saveSnippetToFirebase(saved);
                    alert(
                      "Saved locally and (stub) to Firebase. Replace stub with real Firebase code to persist online."
                    );
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save → Firebase (stub)
                </button>

                <div className="ml-2 flex items-center space-x-2">
                  <button
                    onClick={() => downloadToDisk("html")}
                    className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download HTML
                  </button>
                  <button
                    onClick={() => downloadToDisk("txt")}
                    className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download TXT
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Preview & Saved Column */}
          <aside className="flex flex-col">
            <div className="bg-purple-200 border-2 border-purple-500 rounded-t-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-purple-300 flex items-center justify-between">
                <h2 className="text-lg font-bold text-purple-800 flex items-center">
                  <Eye className="mr-2 w-5 h-5" /> Live Preview
                </h2>
                <StatusBadge status={status} />
              </div>

              <div
                ref={previewRef}
                className="h-96 w-full bg-gradient-to-b from-purple-50 to-purple-100 overflow-auto p-4 rounded-b-2xl"
              />
            </div>

            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center justify-between">
                <span className="flex items-center">
                  <Database className="text-blue-500 mr-2 w-5 h-5" /> Saved Code
                  Snippets
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {savedItems.length}
                </span>
              </h3>

              <div className="mb-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Quick save name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleSaveSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                {savedItems.length === 0 ? (
                  <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 text-center">
                    No saved code snippets yet
                  </div>
                ) : (
                  savedItems.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors ${
                        i !== savedItems.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <span>
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {item.level ?? "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleLoadCode(item.code)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Load code"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Small welcome modal */}
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
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
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
                        <li>Save to local storage and download as HTML/TXT.</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => {
                        setShowWelcome(false);
                        localStorage.setItem("welcomeShown", "true");
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Let’s go
                    </button>
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

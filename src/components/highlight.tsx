// server-only: this file must only be imported in Server Components
import "server-only";

import { Components, toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, type JSX } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { createHighlighter, type Highlighter, type ShikiTransformer } from "shiki";

import atApplyInjection from "./syntax-highlighter/at-apply.json";
import atRulesInjection from "./syntax-highlighter/at-rules.json";
import themeFnInjection from "./syntax-highlighter/theme-fn.json";
import theme from "./syntax-highlighter/theme.json";

/**
 * Preprocess the code before highlighting:
 * - Remove any prettier-ignore statements
 */
function preprocess(code: string): string {
  return code
    .split("\n")
    .filter((line) => !line.includes("prettier-ignore"))
    .join("\n")
    .trim();
}

/**
 * Transformer: remove empty newline text nodes
 */
function removeNewLines(): ShikiTransformer {
  return {
    name: "tailwindcss/remove-new-lines",
    code: (el) => ({
      ...el,
      children: el.children.filter(
        (child: any) => child.type !== "text" || child.value.trim() !== ""
      ),
    }),
  };
}

/**
 * Singleton highlighter (no top-level await).
 * This ensures Vercel can build successfully.
 */
let _highlighter: Promise<Highlighter> | null = null;
async function getHighlighter(): Promise<Highlighter> {
  if (!_highlighter) {
    _highlighter = createHighlighter({
      themes: [theme],
      langs: [
        atApplyInjection as any,
        atRulesInjection,
        themeFnInjection,
        "astro",
        "blade",
        "css",
        "edge",
        "elixir",
        "hbs",
        "html",
        "js",
        "json",
        "jsx",
        "mdx",
        "sh",
        "svelte",
        "ts",
        "tsx",
        "twig",
        "vue",
        "md",
      ],
    });
  }
  return _highlighter;
}

/**
 * Highlight a given code block and return JSX
 */
export async function highlight({
  code,
  lang,
  components,
  transformers,
}: {
  code: string;
  lang: string;
  components?: Components;
  transformers?: ShikiTransformer[];
}): Promise<JSX.Element> {
  const highlighter = await getHighlighter();

  const ast = highlighter.codeToHast(preprocess(code), {
    lang,
    theme: (theme as any).name ?? "default",
    transformers: [removeNewLines(), ...(transformers ?? [])],
  });

  return toJsxRuntime(ast, { Fragment, jsx, jsxs, components });
}

/**
 * Wrapper React component
 */
export async function HighlightedCode({
  className,
  example,
  components,
  transformers,
  ...props
}: {
  className?: string;
  example: { lang: string; code: string };
  components?: Components;
  transformers?: ShikiTransformer[];
  [key: string]: any;
}) {
  return (
    <div {...props} className={className}>
      {await highlight({ ...example, components, transformers })}
    </div>
  );
}
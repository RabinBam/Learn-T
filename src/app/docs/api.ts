import type { TOCEntry } from "@/components/table-of-contents";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import index, { DocEntry } from "./index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getDocPageBySlug(
  slug: string,
): Promise<null | { Component: React.FC; title: string; description: string }> {
  try {
    const filePath = path.join(process.cwd(), "src/docs", `${slug}.mdx`);

    if (!(await fs.stat(filePath).catch(() => false))) {
      return null;
    }

    // ✅ FIX: use @ alias so Next.js can bundle MDX correctly
    const module = await import(`@/docs/${slug}.mdx`);

    if (!module.default) {
      return null;
    }

    return {
      Component: module.default,
      title: module.title ?? slug,
      description: module.description ?? "",
    };
  } catch (e) {
    console.error("Error loading doc page:", e);
    return null;
  }
}


export async function getDocPageSlugs() {
  const slugs: string[] = [];
  const docsDir = path.join(process.cwd(), "./src/docs");

  for (const file of await fs.readdir(docsDir)) {
    if (!file.endsWith(".mdx")) continue;
    slugs.push(path.parse(file).name);
  }
  return slugs;
}

export async function generateTableOfContents(slug: string) {
  const filePath = path.join(process.cwd(), "./src/docs", `${slug}.mdx`);
  if (!(await fs.stat(filePath).catch(() => false))) {
    return [];
  }

  const markdown = await fs.readFile(filePath, "utf8");
  return generateTableOfContentsFromMarkdown(markdown);
}

export async function generateTableOfContentsFromMarkdown(markdown: string) {
  const headings = [
    ...markdown.matchAll(
      /^(#+)\s+(.+)$|^<h([1-6])(?:\s+[^>]*\bid=["'](.*?)["'][^>]*)?>(.*?)<\/h\3>/gm,
    ),
  ].map((match) => {
    let level: number;
    let text: string;
    let slug: string | undefined;

    if (match[1]) {
      level = match[1].length;
      text = match[2].trim().replaceAll("\\", "");
    } else {
      level = parseInt(match[3], 10);
      text = match[5].trim().replaceAll("\\", "");
      if (match[4]) {
        slug = `#${match[4]}`;
      }
    }

    slug ??= `#${text
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()}`;

    return { level, text, slug, children: [] as TOCEntry[] };
  });

  const toc: TOCEntry[] = [];
  const stack: TOCEntry[] = [{ level: 0, text: "", slug: "", children: toc }];

  const containsQuickReference = markdown.match(/\<ApiTable\s+rows=\{\[/);
  if (containsQuickReference) {
    toc.push({
      level: 0,
      text: "Quick reference",
      slug: "#quick-reference",
      children: [],
    });
  }

  for (const heading of headings) {
    while (stack[stack.length - 1].level >= heading.level) stack.pop();
    stack[stack.length - 1].children.push(heading);
    stack.push(heading);
  }

  return toc;
}

/**
 * Finds the section and title for a given slug from the docs index
 */
export function getSectionAndTitleBySlug(
  slug: string,
): { section: string; title: string } | null {
  const currentPath = `/docs/${slug}`;

  for (const [section, entries] of Object.entries(index)) {
    for (const entry of entries as DocEntry[]) {
      const { title, path, children } = entry;

      if (path === currentPath) {
        return { section, title };
      }

      if (children) {
        for (const child of children) {
          if (child.path === currentPath) {
            return { section, title: child.title };
          }
        }
      }
    }
  }

  return null;
}

// src/components/syntax-highlighter/lines-to-div.ts
import type { ShikiTransformer } from "shiki";

/**
 * A Shiki transformer that replaces <span> line wrappers with <div>.
 * Useful when you want each line of code to behave like a block element.
 */
export default function linesToDiv(): ShikiTransformer {
  return {
    name: "tailwindcss/lines-to-div",
    line(node) {
      // Ensure tagName is set to div instead of span
      if (node.tagName) {
        node.tagName = "div";
      }
    },
  };
}
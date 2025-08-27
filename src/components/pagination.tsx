import Link from "next/link";
import index, { DocEntry } from "@/app/docs/index";

// recursive flattener
function flatten(entries: DocEntry[]): DocEntry[] {
  return entries.flatMap((entry) => [
    entry,
    ...(entry.children ? flatten(entry.children) : []),
  ]);
}

const flatIndex: DocEntry[] = Object.values(index).flatMap((section) =>
  flatten(section)
);

export default function Pagination({ slug }: { slug: string }) {
  const position = flatIndex.findIndex(
    (entry) => entry.path === `/docs/${slug}`
  );
  if (position === -1) return null;

  const prev = position > 0 ? flatIndex[position - 1] : null;
  const next = position < flatIndex.length - 1 ? flatIndex[position + 1] : null;

  return (
    <footer className="mt-16 text-sm leading-6">
      <div className="flex items-center justify-between gap-2 text-gray-700 dark:text-gray-200">
        {prev ? (
          <Link
            className="group flex items-center gap-2 hover:text-gray-900 dark:hover:text-white"
            href={prev.path}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="size-4">
              <path
                fillRule="evenodd"
                d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            className="group flex items-center gap-2 hover:text-gray-900 dark:hover:text-white"
            href={next.path}
          >
            <span>{next.title}</span>
            <svg viewBox="0 0 16 16" fill="currentColor" className="size-4">
              <path
                fillRule="evenodd"
                d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </footer>
  );
}

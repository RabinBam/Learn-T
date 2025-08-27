import React from "react";

import { DocsSidebar } from "@/components/docs-sidebar";
import { DocsSidebarAutoscroll } from "@/components/docs-sidebar-autoscroll";
import TableOfContents from "@/components/table-of-contents";
import { RandomPromo } from "@/components/promos";

export default async function Layout({
  children,
}: React.PropsWithChildren<{ breadcrumb?: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-gray-100">
      {/* Grid Layout */}
      {/* Grid Layout */}
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[var(--container-2xs)_1fr]">
        {/* LEFT SIDEBAR */}
        <div className="relative col-start-1 row-span-full row-start-1 max-lg:hidden">
          <div className="sticky top-20 bottom-0 left-0 h-[calc(100vh-5rem)] overflow-y-auto p-6">
            <DocsSidebarAutoscroll>
              <DocsSidebar />
            </DocsSidebarAutoscroll>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="relative row-start-1 lg:col-start-2">{children}</div>
      </div>
    </div>
  );
}

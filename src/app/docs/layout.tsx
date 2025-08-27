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
      <div className="grid min-h-screen grid-cols-1 grid-rows-[1fr_auto_auto] lg:grid-cols-[var(--container-2xs)_2.5rem_minmax(0,1fr)_2.5rem_var(--container-2xs)]">
        {/* LEFT SIDEBAR */}
        <div className="relative col-start-1 row-span-full row-start-1 max-lg:hidden">
          <div className="sticky top-20 bottom-0 left-0 h-[calc(100vh-5rem)] overflow-y-auto p-6">
            <DocsSidebarAutoscroll>
              <DocsSidebar />
            </DocsSidebarAutoscroll>
          </div>
        </div>

        {/* Left border */}
        <div className="col-start-2 row-span-full border-x border-cyan-300/20 bg-[image:repeating-linear-gradient(315deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px] max-lg:hidden" />

        {/* MAIN CONTENT */}
        <div className="relative row-start-1 grid grid-cols-subgrid lg:col-start-3">
          {children}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="relative col-start-5 row-span-full row-start-1 max-lg:hidden">
          <div className="sticky top-20 bottom-0 right-0 h-[calc(100vh-5rem)] overflow-y-auto p-6 space-y-8">
            <TableOfContents tableOfContents={[]} />
            <RandomPromo />
          </div>
        </div>

        {/* Right border */}
        <div className="col-start-4 row-span-full border-x border-cyan-300/20 bg-[image:repeating-linear-gradient(315deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px] max-lg:hidden" />
      </div>
    </div>
  );
}

import {
  NavList,
  NavListHeading,
  NavListItem,
  NavListItems,
} from "@/components/nav-list";
import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import index, { DocEntry } from "@/app/docs/index";
import { DocsSidebarLink } from "./docs-sidebar-link";

export function DocsSidebar() {
  return (
    <nav className="flex flex-col gap-8">
      {Object.entries(index).map(([category, entries]) => (
        <NavList key={category} data-autoscroll>
          <NavListHeading>{category}</NavListHeading>
          <NavListItems>
            {entries.map((entry: DocEntry) => (
              <NavListItem key={entry.path}>
                <DocsSidebarLink title={entry.title} path={entry.path} />

                {Array.isArray(entry.children) && entry.children.length > 0 && (
                  <NavListItems nested>
                    {entry.children.map(
                      (
                        child: DocEntry // ✅ typed as DocEntry
                      ) => (
                        <NavListItem key={child.path}>
                          <DocsSidebarLink
                            title={child.title}
                            path={child.path}
                            nested
                          />
                        </NavListItem>
                      )
                    )}
                  </NavListItems>
                )}
              </NavListItem>
            ))}
          </NavListItems>
        </NavList>
      ))}
    </nav>
  );
}

import { Metadata } from "next";
import { TabBar } from "@/components/installation-tabs";
import {
  Grid,
  Smartphone,
  Pointer,
  Moon,
  Layers,
  Sliders,
} from "lucide-react"; // ✅ Lucide icons (safe on Vercel)

export const metadata: Metadata = {
  title: {
    template: "%s - Tailwind CSS",
    default: "Installation",
  },
  openGraph: {
    type: "article",
    title: {
      template: "%s - Installation",
      default: "Installation",
    },
  },
};

const tabs = {
  "Using Vite": "/docs/installation/using-vite",
  "Using PostCSS": "/docs/installation/using-postcss",
  "Tailwind CLI": "/docs/installation/tailwind-cli",
  "Framework Guides": "/docs/installation/framework-guides",
  "Play CDN": "/docs/installation/play-cdn",
};

const readNext = [
  {
    title: "Styling with utility classes",
    href: "/docs/styling-with-utility-classes",
    body: (
      <p>
        Using a utility-first workflow to build complex components from a
        constrained set of primitive utilities.
      </p>
    ),
    icon: Grid, // ✅ replaced missing require with Lucide Grid
  },
  {
    title: "Responsive Design",
    href: "/docs/responsive-design",
    body: (
      <p>
        Build fully responsive user interfaces that adapt to any screen size
        using responsive modifiers.
      </p>
    ),
    icon: Smartphone, // ✅ Lucide Smartphone
  },
  {
    title: "Hover, Focus & Other States",
    href: "/docs/hover-focus-and-other-states",
    body: (
      <p>
        Style elements in interactive states like hover, focus, and more using
        conditional modifiers.
      </p>
    ),
    icon: Pointer, // ✅ Lucide Pointer
  },
  {
    title: "Dark Mode",
    href: "/docs/dark-mode",
    body: (
      <p>
        Optimize your site for dark mode directly in your HTML using the dark
        mode modifier.
      </p>
    ),
    icon: Moon, // ✅ Lucide Moon
  },
  {
    title: "Reusing Styles",
    href: "/docs/reusing-styles",
    body: (
      <p>
        Manage duplication and keep your projects maintainable by creating
        reusable abstractions.
      </p>
    ),
    icon: Layers, // ✅ Lucide Layers
  },
  {
    title: "Customizing the Framework",
    href: "/docs/adding-custom-styles",
    body: (
      <p>
        Customize the framework to match your brand and extend it with your own
        custom styles.
      </p>
    ),
    icon: Sliders, // ✅ Lucide Sliders
  },
];

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Placeholder for router scroll */}
      <div hidden />

      <div className="isolate mx-auto grid w-full max-w-2xl grid-cols-1 gap-10 pt-10 md:pb-24 xl:max-w-5xl">
        <div className="px-4 sm:px-6">
          <p
            data-section="true"
            className="font-mono text-xs/6 font-medium tracking-widest text-gray-600 uppercase dark:text-gray-400"
          >
            Installation
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-gray-950 dark:text-white">
            Get started with Tailwind CSS
          </h1>
          <p
            data-description="true"
            className="mt-6 text-base/7 text-gray-700 dark:text-gray-300"
          >
            Tailwind CSS works by scanning all of your HTML files, JavaScript
            components, and any other templates for class names, generating the
            corresponding styles and then writing them to a static CSS file.
          </p>
          <p className="mt-4 text-base/7 text-gray-700 dark:text-gray-300">
            It's fast, flexible, and reliable — with zero-runtime.
          </p>

          <div className="mt-10" data-content="true">
            <section className="relative mb-16">
              <div className="relative z-10">
                <h2
                  data-docsearch-ignore
                  className="mb-6 text-lg font-semibold tracking-tight text-gray-950 dark:text-white"
                >
                  Installation
                </h2>
                <TabBar
                  tabs={Object.entries(tabs).map(([title, url]) => ({
                    title,
                    url,
                  }))}
                />
              </div>
              {children}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
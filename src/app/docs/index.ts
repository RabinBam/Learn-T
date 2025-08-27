export type DocEntry = {
  title: string;
  path: string;
  children?: DocEntry[];
};

const index: Record<string, DocEntry[]> = {
  "Getting started": [
    { title: "Editor setup", path: "/docs/editor-setup" },
    { title: "Compatibility", path: "/docs/compatibility" },
    { title: "Upgrade guide", path: "/docs/upgrade-guide" },
  ],

  "Core concepts": [
    { title: "Styling with utility classes", path: "/docs/styling-with-utility-classes" },
    { title: "Hover, focus, and other states", path: "/docs/hover-focus-and-other-states" },
    { title: "Responsive design", path: "/docs/responsive-design" },
    { title: "Dark mode", path: "/docs/dark-mode" },
    { title: "Theme variables", path: "/docs/theme" },
    { title: "Colors", path: "/docs/colors" },
    { title: "Adding custom styles", path: "/docs/adding-custom-styles" },
    { title: "Detecting classes in source files", path: "/docs/detecting-classes-in-source-files" },
    { title: "Functions and directives", path: "/docs/functions-and-directives" },
  ],

  "Base styles": [
    { title: "Preflight", path: "/docs/preflight" },
  ],

  Layout: [
    { title: "aspect-ratio", path: "/docs/aspect-ratio" },
    { title: "columns", path: "/docs/columns" },
    { title: "break-after", path: "/docs/break-after" },
    { title: "break-before", path: "/docs/break-before" },
    { title: "break-inside", path: "/docs/break-inside" },
    { title: "box-decoration-break", path: "/docs/box-decoration-break" },
    { title: "box-sizing", path: "/docs/box-sizing" },
    { title: "display", path: "/docs/display" },
    { title: "float", path: "/docs/float" },
    { title: "clear", path: "/docs/clear" },
    { title: "isolation", path: "/docs/isolation" },
    { title: "object-fit", path: "/docs/object-fit" },
    { title: "object-position", path: "/docs/object-position" },
    { title: "overflow", path: "/docs/overflow" },
    { title: "overscroll-behavior", path: "/docs/overscroll-behavior" },
    { title: "position", path: "/docs/position" },
    { title: "top / right / bottom / left", path: "/docs/top-right-bottom-left" },
    { title: "visibility", path: "/docs/visibility" },
    { title: "z-index", path: "/docs/z-index" },
  ],

  "Flexbox & Grid": [
    { title: "flex-basis", path: "/docs/flex-basis" },
    { title: "flex-direction", path: "/docs/flex-direction" },
    { title: "flex-wrap", path: "/docs/flex-wrap" },
    { title: "flex", path: "/docs/flex" },
    { title: "flex-grow", path: "/docs/flex-grow" },
    { title: "flex-shrink", path: "/docs/flex-shrink" },
    { title: "order", path: "/docs/order" },
    { title: "grid-template-columns", path: "/docs/grid-template-columns" },
    { title: "grid-column", path: "/docs/grid-column" },
    { title: "grid-template-rows", path: "/docs/grid-template-rows" },
    { title: "grid-row", path: "/docs/grid-row" },
    { title: "grid-auto-flow", path: "/docs/grid-auto-flow" },
    { title: "grid-auto-columns", path: "/docs/grid-auto-columns" },
    { title: "grid-auto-rows", path: "/docs/grid-auto-rows" },
    { title: "gap", path: "/docs/gap" },
    { title: "justify-content", path: "/docs/justify-content" },
    { title: "justify-items", path: "/docs/justify-items" },
    { title: "justify-self", path: "/docs/justify-self" },
    { title: "align-content", path: "/docs/align-content" },
    { title: "align-items", path: "/docs/align-items" },
    { title: "align-self", path: "/docs/align-self" },
    { title: "place-content", path: "/docs/place-content" },
    { title: "place-items", path: "/docs/place-items" },
    { title: "place-self", path: "/docs/place-self" },
  ],

  // Example of nested children (Filters)
  Filters: [
    {
      title: "filter",
      path: "/docs/filter",
      children: [
        { title: "blur", path: "/docs/filter-blur" },
        { title: "brightness", path: "/docs/filter-brightness" },
        { title: "contrast", path: "/docs/filter-contrast" },
        { title: "drop-shadow", path: "/docs/filter-drop-shadow" },
        { title: "grayscale", path: "/docs/filter-grayscale" },
        { title: "hue-rotate", path: "/docs/filter-hue-rotate" },
        { title: "invert", path: "/docs/filter-invert" },
        { title: "saturate", path: "/docs/filter-saturate" },
        { title: "sepia", path: "/docs/filter-sepia" },
      ],
    },
    {
      title: "backdrop-filter",
      path: "/docs/backdrop-filter",
      children: [
        { title: "blur", path: "/docs/backdrop-filter-blur" },
        { title: "brightness", path: "/docs/backdrop-filter-brightness" },
        { title: "contrast", path: "/docs/backdrop-filter-contrast" },
        { title: "grayscale", path: "/docs/backdrop-filter-grayscale" },
        { title: "hue-rotate", path: "/docs/backdrop-filter-hue-rotate" },
        { title: "invert", path: "/docs/backdrop-filter-invert" },
        { title: "opacity", path: "/docs/backdrop-filter-opacity" },
        { title: "saturate", path: "/docs/backdrop-filter-saturate" },
        { title: "sepia", path: "/docs/backdrop-filter-sepia" },
      ],
    },
  ],

  Accessibility: [
    { title: "forced-color-adjust", path: "/docs/forced-color-adjust" },
  ],
};

export default index;

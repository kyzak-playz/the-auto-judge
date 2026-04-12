// Allow side-effect stylesheet imports in Next.js App Router files.
declare module "*.css";

// Common stylesheet module formats used by frontend tooling.
declare module "*.scss";
declare module "*.sass";
declare module "*.less";

// Common static image imports. These resolve to string URLs in the app.
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.avif" {
  const src: string;
  export default src;
}

declare module "*.ico" {
  const src: string;
  export default src;
}

// SVGs as React components (SVGR setup)
declare module "*.svg" {
  import * as React from "react";
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}
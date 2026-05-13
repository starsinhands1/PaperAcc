import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const researchRuntimeTraceIncludes = [
  "./node_modules/@napi-rs/canvas/**/*",
  "./node_modules/@napi-rs/wasm-runtime/**/*",
  "./node_modules/@napi-rs/canvas-linux-*/**/*",
  "./node_modules/@napi-rs/canvas-win32-*/**/*",
  "./node_modules/jszip/**/*",
  "./node_modules/pptxgenjs/**/*",
];

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@napi-rs/canvas",
    "pptxgenjs",
    "jszip",
  ],
  outputFileTracingIncludes: {
    "/api/research/paper/*": researchRuntimeTraceIncludes,
    "/api/research/pdf-standard-fonts/\\[filename\\]": [
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
    ],
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;

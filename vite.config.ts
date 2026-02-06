import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import packageJson from "./package.json";

const getPackageName = () => {
  return packageJson.name;
};

/**
 * Convert package name to a safe JS identifier:
 * - Remove scope prefix (e.g. @scope/)
 * - Convert kebab-case to camelCase
 * - Remove any remaining invalid identifier chars
 * - Ensure it starts with a valid identifier start; if not, fall back to a safe name
 */
const getPackageNameCamelCase = () => {
  const pkgName = getPackageName();
  if (!pkgName) {
    throw new Error("Name property in package.json is missing.");
  }

  // remove scope: @scope/name -> name
  const noScope = pkgName.replace(/^@[^/]+\//, "");

  // kebab-case to camelCase: fluent-reveal-effect -> fluentRevealEffect
  const camel = noScope.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());

  // strip any invalid identifier characters (allow letters, digits, _ and $)
  const clean = camel.replace(/[^a-zA-Z0-9_$]/g, "");

  // ensure it starts with a valid identifier start (letter, _ or $). If not, prefix with a safe name.
  const safe = /^[A-Za-z_$]/.test(clean) ? clean : `FluentRevealEffect`;

  // Optionally make it PascalCase for a global (start with uppercase)
  return safe[0].toUpperCase() + safe.slice(1);
};

const fileName = {
  es: `${getPackageName()}.js`,
  iife: `${getPackageName()}.iife.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
  build: {
    outDir: "./dist",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      // sanitized, valid JS identifier used for UMD/IIFE globals
      name: getPackageNameCamelCase(),
      formats,
      fileName: (format) => fileName[format],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@@": resolve(__dirname),
    },
  },
  plugins: [
    dts(), // Generates .d.ts files for TypeScript
  ],
});

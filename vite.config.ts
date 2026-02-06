import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';

// base name without scope, e.g. "@scope/name" -> "name"
const getPackageBaseName = () => {
  const pkg = packageJson.name || '';
  return pkg.replace(/^@[^/]+\//, '');
};

// produce sanitized file base name (kebab-case preserved)
const baseName = getPackageBaseName() || 'fluent-reveal-effect';

// we recommend ESM + CJS outputs for library consumption
const formats = ['es', 'cjs'];

export default defineConfig({
  build: {
    outDir: './dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      // valid JS identifier used for UMD/IIFE globals (if you ever output iife/umd)
      name: baseName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9_$]/g, ''),
      formats,
      // file names like: dist/fluent-reveal-effect.es.js and dist/fluent-reveal-effect.cjs.js
      fileName: format => `${baseName}.${format}.js`,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@@': resolve(__dirname),
    },
  },
  plugins: [
    dts(), // Generates .d.ts files for TypeScript
  ],
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { resolve } from 'path';

// Tests (Vitest, Node) : react-pdf lit les polices sur disque. Les imports
// « font.woff?url » renvoient donc le chemin absolu du fichier au lieu d'une URL.
const fontPathsForTests = {
  name: 'profila:test-font-paths',
  enforce: 'pre',
  async resolveId(source, importer) {
    if (!process.env.VITEST || !/\.woff\?url$/.test(source)) return null;
    const resolved = await this.resolve(source.replace(/\?url$/, ''), importer, { skipSelf: true });
    return resolved ? `\0font-path:${resolved.id}` : null;
  },
  load(id) {
    if (!id.startsWith('\0font-path:')) return null;
    return `export default ${JSON.stringify(id.slice('\0font-path:'.length))};`;
  },
};

export default defineConfig({
  plugins: [
    fontPathsForTests,
    react(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@context': resolve(__dirname, 'src/context'),
      '@theme': resolve(__dirname, 'src/theme'),
      '@data': resolve(__dirname, 'src/data'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@ai': resolve(__dirname, 'src/ai'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          pdf: ['@react-pdf/renderer'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Pre-bundle @react-pdf/renderer so Vite (esbuild) resolves its CommonJS
    // dependency chain (base64-js, pako, fontkit, events, queue…) into ESM with
    // proper default exports. Excluding it instead breaks the dev server with
    // "does not provide an export named 'default'" on those CJS deps.
    include: ['@react-pdf/renderer'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
    testTimeout: 30000,
  },
});

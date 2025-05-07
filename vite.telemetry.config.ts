import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    ssr: true,
    target: 'es2020',
    outDir: 'build',
    rollupOptions: {
      input: {
        telemetry: 'src/telemetry.ts',
      },
    },
    lib: {
      formats: ['cjs'],
      entry: 'src/telemetry.ts',
    },
  },
});

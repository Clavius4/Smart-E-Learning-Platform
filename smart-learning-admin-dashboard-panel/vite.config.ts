import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tsconfigPaths(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
  ],
  define:
    command === 'serve'
      ? {
          'process.env.NODE_ENV': JSON.stringify('development'),
        }
      : undefined,
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    port: 5000,
  },
  base: '/admin/',
}));

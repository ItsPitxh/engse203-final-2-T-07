import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/engse203-student-labs-<your-student-id>/labs/week-13/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
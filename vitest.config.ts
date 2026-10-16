import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    unstubGlobals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "web",
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "api",
          environment: "node",
          setupFiles: ["./api/_tests/setup.ts"],
          include: ["api/**/*.test.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

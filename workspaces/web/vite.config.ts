import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from "node:fs";
import { join } from "node:path";

const serverPackageJson = (() => {
  try {
    const file = readFileSync(
      join(__dirname, "..", "server", "package.json"),
      "utf8"
    );
    return JSON.parse(file);
  } catch (e: unknown) {
    console.error(e);
    throw new Error("Failed to read server package");
  }
})();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: './dist',
    rollupOptions: {
        input: {
          main: 'index.html',
          setup: 'setup.html',
        },
    },
  },
  envDir: './env',
  define: {
    __EXPECTED_SERVER_VERSION: JSON.stringify(serverPackageJson.version),
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
});

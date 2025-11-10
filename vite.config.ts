import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Set base to your repository name for GitHub Pages
  // If deploying to https://username.github.io/repository-name/, use '/repository-name/'
  // If deploying to a custom domain or https://username.github.io/, use '/'
  base: mode === 'production' ? '/Inventor-Studio/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

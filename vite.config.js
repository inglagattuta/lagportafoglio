import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/lagportafoglio/", // <-- importantissimo! qui va il nome della tua repo
});

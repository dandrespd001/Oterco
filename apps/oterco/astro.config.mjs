import { defineConfig } from "astro/config";

// OT-01: salida exclusivamente estática. Sin adaptador SSR, sin endpoints remotos.
export default defineConfig({
  output: "static",
});

import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.mioi.io",
  integrations: [tailwind(), sitemap(), partytown({ config: { forward: ["dataLayer.push"] } })],
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  }
});

import { defineConfig } from "vite";
import { oxContentSlides } from "@ox-content/vite-plugin-slides";

export default defineConfig({
  plugins: [
    oxContentSlides({
      srcDir: "slides",
      routeBase: "slides",
      pdf: true,
      ssg: {
        clean: true,
        generateOgImage: true,
        siteUrl: "https://example.com",
      },
      theme: {
        surfaceBorder: "rgba(41, 60, 107, 0.14)",
        colorPrimary: "#314b88",
      },
    }),
  ],
});

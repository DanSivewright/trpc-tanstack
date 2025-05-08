import { defineConfig } from "@tanstack/react-start/config"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  server: {
    preset: "vercel",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
  // react: {
  //   babel: {
  //     plugins: [
  //       [
  //         "babel-plugin-react-compiler",
  //         {
  //           target: "19",
  //         },
  //       ],
  //     ],
  //   },
  // },
})

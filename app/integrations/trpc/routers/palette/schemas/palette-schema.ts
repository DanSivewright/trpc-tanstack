import { z } from "zod"

const swatch = z.object({
  rgb: z.array(z.number().min(0).max(255)).max(3).min(3),
  population: z.number(),
  bodyTextColor: z.string(),
  titleTextColor: z.string(),
  hex: z.string(),
})

export const paletteSchema = z.object({
  Vibrant: swatch,
  DarkVibrant: swatch,
  LightVibrant: swatch,
  Muted: swatch,
  DarkMuted: swatch,
  LightMuted: swatch,
})

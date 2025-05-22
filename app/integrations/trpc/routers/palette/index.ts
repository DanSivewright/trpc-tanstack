import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { Vibrant } from "node-vibrant/node"
import sharp from "sharp"
import { z } from "zod"

import { cachedFunction, generateCacheKey } from "@/lib/cache"

import { protectedProcedure } from "../../init"

const CACHE_GROUP = "palette"

const convertAvifToJpg = async (url: string): Promise<Buffer> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const avifBuffer = Buffer.from(await response.arrayBuffer())

    const jpgBuffer = await sharp(avifBuffer).jpeg().toBuffer()

    return jpgBuffer
  } catch (err) {
    console.error("Error converting AVIF to JPG:", err)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Failed to convert image from AVIF to JPG.",
    })
  }
}

export const paletteRouter = {
  get: protectedProcedure
    .input(z.object({ url: z.string() }))
    // @ts-ignore
    .query(async ({ input, ctx, type, path }) => {
      const cachedFetcher = cachedFunction(
        async () => {
          // Check if the URL is an AVIF image
          const isAvif = input.url.toLowerCase().includes(".avif")
          let imageSource

          if (isAvif) {
            imageSource = await convertAvifToJpg(input.url)
          } else {
            imageSource = input.url
          }

          const palette = await tryCatch(
            Vibrant.from(imageSource)
              .getPalette()
              .then((p) => ({
                Vibrant: {
                  rgb: p.Vibrant?.rgb,
                  population: p.Vibrant?.population,
                  bodyTextColor: p.Vibrant?.bodyTextColor,
                  titleTextColor: p.Vibrant?.titleTextColor,
                  hex: p.Vibrant?.hex,
                },
                DarkVibrant: {
                  rgb: p.DarkVibrant?.rgb,
                  population: p.DarkVibrant?.population,
                  bodyTextColor: p.DarkVibrant?.bodyTextColor,
                  titleTextColor: p.DarkVibrant?.titleTextColor,
                  hex: p.DarkVibrant?.hex,
                },
                LightVibrant: {
                  rgb: p.LightVibrant?.rgb,
                  population: p.LightVibrant?.population,
                  bodyTextColor: p.LightVibrant?.bodyTextColor,
                  titleTextColor: p.LightVibrant?.titleTextColor,
                  hex: p.LightVibrant?.hex,
                },
                Muted: {
                  rgb: p.Muted?.rgb,
                  population: p.Muted?.population,
                  bodyTextColor: p.Muted?.bodyTextColor,
                  titleTextColor: p.Muted?.titleTextColor,
                  hex: p.Muted?.hex,
                },
                DarkMuted: {
                  rgb: p.DarkMuted?.rgb,
                  population: p.DarkMuted?.population,
                  bodyTextColor: p.DarkMuted?.bodyTextColor,
                  titleTextColor: p.DarkMuted?.titleTextColor,
                  hex: p.DarkMuted?.hex,
                },
                LightMuted: {
                  rgb: p.LightMuted?.rgb,
                  population: p.LightMuted?.population,
                  bodyTextColor: p.LightMuted?.bodyTextColor,
                  titleTextColor: p.LightMuted?.titleTextColor,
                  hex: p.LightMuted?.hex,
                },
              }))
          )

          if (palette.error || !palette.success) {
            console.log("palette.error:::", palette.error)
            return null
          }

          return {
            ...palette.data,
            url: input.url,
          }
        },
        {
          name: generateCacheKey({
            type,
            path,
            input,
          }),
          maxAge: import.meta.env.VITE_CACHE_MAX_AGE, // Cache for 5 minutes
          group: CACHE_GROUP,
        }
      )
      return cachedFetcher()
    }),
}

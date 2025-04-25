import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface BounceCardsProps {
  /**
   * Additional CSS classes for the container
   */
  className?: string
  /**
   * Array of image URLs to display
   */
  images?: string[]
  /**
   * Width of the container in pixels
   */
  containerWidth?: number
  /**
   * Height of the container in pixels
   */
  containerHeight?: number
  /**
   * Delay before animation starts (in seconds)
   */
  animationDelay?: number
  /**
   * Delay between each card animation (in seconds)
   */
  animationStagger?: number
  /**
   * Array of transform styles for each card
   */
  transformStyles?: string[]
}

/**
 * A component that displays a group of cards with a bouncing animation effect.
 * Uses GSAP for smooth animations and supports custom positioning and timing.
 */
export function BounceCards({
  className = "",
  images = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  transformStyles = [
    "rotate(10deg) translate(-170px)",
    "rotate(5deg) translate(-85px)",
    "rotate(-3deg)",
    "rotate(-10deg) translate(85px)",
    "rotate(2deg) translate(170px)",
  ],
}: BounceCardsProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {images.map((src, idx) => (
        <motion.div
          key={idx}
          className={cn(
            "absolute aspect-square w-[200px] overflow-hidden rounded-[30px]",
            "border-8 border-white dark:border-white/90",
            "shadow-lg dark:shadow-black/20"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: animationDelay + idx * animationStagger,
          }}
          style={{
            transform:
              transformStyles[idx] !== undefined
                ? transformStyles[idx]
                : "none",
            zIndex: images.length - idx,
          }}
        >
          <img
            className="h-full w-full object-cover"
            src={src}
            alt={`card-${idx}`}
            loading="lazy"
          />
        </motion.div>
      ))}
    </div>
  )
}

import { useEffect, useRef, useState } from "react"
import { useInView } from "motion/react"

import { useLocalStorage } from "@/hooks/use-local-storage"

type Props = {
  videoUrl: string
  containerStyle?: React.CSSProperties
  videoStyle?: React.CSSProperties
  blurThreshold?: number
  controls?: boolean
  className?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}
const VideoWithConditionalBlur: React.FC<Props> = ({
  videoUrl,
  containerStyle, // Expect an object for inline styles or use classNames
  videoStyle, // Expect an object for inline styles or use classNames
  blurThreshold = 0.8, // Show blur if video occupies less than 80% of container area
  controls = false,
  className = "", // For the main wrapper div
  onClick,
}) => {
  const [showBlurredBg, setShowBlurredBg] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const foregroundVideoRef = useRef<HTMLVideoElement>(null)
  const backgroundVideoRef = useRef<HTMLVideoElement>(null)
  const programmaticActionRef = useRef(false) // To track programmatic play/pause
  const isInView = useInView(containerRef, {
    amount: 0.7,
  })

  const [preferMuted, setPreferMuted] = useLocalStorage({
    key: "prefer-muted",
    defaultValue: false,
  })

  const [preferAutoResume, setPreferAutoResume] = useLocalStorage({
    key: "prefer-auto-play",
    defaultValue: true,
  })

  useEffect(() => {
    const videoElement = foregroundVideoRef.current
    const containerElement = containerRef.current

    if (!videoElement || !containerElement || !videoUrl) {
      setShowBlurredBg(false)
      return
    }

    const calculateAndSetBlur = () => {
      // Ensure video metadata is loaded to get intrinsic dimensions
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        // Metadata not yet loaded or video has no dimensions
        // Depending on desired behavior, you might want to hide blur or maintain previous state
        // For now, let's default to not showing blur if dimensions are unknown.
        setShowBlurredBg(false)
        return
      }

      const containerWidth = containerElement.clientWidth
      const containerHeight = containerElement.clientHeight

      // If container has no area, don't do calculations
      if (containerWidth === 0 || containerHeight === 0) {
        setShowBlurredBg(false)
        return
      }

      const intrinsicVideoWidth = videoElement.videoWidth
      const intrinsicVideoHeight = videoElement.videoHeight

      const containerAspectRatio = containerWidth / containerHeight
      const videoAspectRatio = intrinsicVideoWidth / intrinsicVideoHeight

      let renderedVideoWidth
      let renderedVideoHeight

      // Calculate the rendered dimensions of the video with 'object-contain'
      if (videoAspectRatio > containerAspectRatio) {
        // Video is wider than container proportionally (limited by container width)
        renderedVideoWidth = containerWidth
        renderedVideoHeight = containerWidth / videoAspectRatio
      } else {
        // Video is taller or same aspect ratio as container (limited by container height)
        renderedVideoHeight = containerHeight
        renderedVideoWidth = containerWidth * videoAspectRatio
      }

      const containerArea = containerWidth * containerHeight
      const videoArea = renderedVideoWidth * renderedVideoHeight

      // Avoid division by zero if containerArea is somehow zero after checks
      if (containerArea === 0) {
        setShowBlurredBg(false)
        return
      }

      const occupiedRatio = videoArea / containerArea

      // Show blur if the video occupies less than the threshold percentage
      // and the occupiedRatio is a valid positive number.
      setShowBlurredBg(occupiedRatio > 0 && occupiedRatio < blurThreshold)
    }

    // Event listener for when video metadata is loaded
    videoElement.addEventListener("loadedmetadata", calculateAndSetBlur)

    // Call once in case metadata is already loaded (e.g., for cached videos)
    if (videoElement.readyState >= 1) {
      // HAVE_METADATA or higher
      calculateAndSetBlur()
    }

    // Optional: Handle container resize.
    // For robust resize detection, consider using ResizeObserver.
    // This is a simplified version using window resize.
    const handleResize = () => {
      // Timeout to allow layout to settle after resize
      setTimeout(calculateAndSetBlur, 100)
    }
    window.addEventListener("resize", handleResize)

    const handleVolumeChange = () => {
      if (videoElement) {
        setPreferMuted(videoElement.muted)
      }
    }
    videoElement.addEventListener("volumechange", handleVolumeChange)

    const handleForegroundPause = () => {
      if (backgroundVideoRef.current && !backgroundVideoRef.current.paused) {
        backgroundVideoRef.current.pause()
      }
      if (!programmaticActionRef.current) {
        setPreferAutoResume(false)
      }
    }
    videoElement.addEventListener("pause", handleForegroundPause)

    const handleForegroundPlay = () => {
      if (
        backgroundVideoRef.current &&
        backgroundVideoRef.current.paused &&
        isInView &&
        true // If foreground plays, background should sync if in view
      ) {
        const playPromiseBg = backgroundVideoRef.current.play()
        if (playPromiseBg !== undefined) {
          playPromiseBg.catch((error) => {
            console.warn(
              "Background video play attempt failed on foreground play event:",
              error
            )
          })
        }
      }
      if (!programmaticActionRef.current) {
        setPreferAutoResume(true)
      }
    }
    videoElement.addEventListener("play", handleForegroundPlay)

    // Cleanup function
    return () => {
      videoElement.removeEventListener("loadedmetadata", calculateAndSetBlur)
      window.removeEventListener("resize", handleResize)
      videoElement.removeEventListener("volumechange", handleVolumeChange)
      videoElement.removeEventListener("pause", handleForegroundPause)
      videoElement.removeEventListener("play", handleForegroundPlay)
    }
  }, [videoUrl, blurThreshold, setPreferMuted, isInView, setPreferAutoResume]) // preferAutoResume (value) no longer a direct dependency for these handlers

  useEffect(() => {
    const foregroundVideo = foregroundVideoRef.current
    const backgroundVideo = backgroundVideoRef.current

    if (!foregroundVideo) return

    if (isInView) {
      if (preferAutoResume && foregroundVideo.paused) {
        programmaticActionRef.current = true
        foregroundVideo
          .play()
          .catch((error) =>
            console.warn("Programmatic foreground play failed:", error)
          )
          .finally(() => {
            programmaticActionRef.current = false
          })

        if (backgroundVideo && backgroundVideo.paused) {
          backgroundVideo
            .play()
            .catch((error) =>
              console.warn("Programmatic background play failed:", error)
            )
        }
      }
    } else {
      // Not in view
      if (!foregroundVideo.paused) {
        programmaticActionRef.current = true
        foregroundVideo.pause()
        programmaticActionRef.current = false // pause() is synchronous
      }
      if (backgroundVideo && !backgroundVideo.paused) {
        backgroundVideo.pause()
      }
    }
    // Original logic for when preferAutoResume is false and video is playing (e.g. scrolled out)
    // This is now covered by the "else" block (Not in view) which always pauses.
    // The autoPlay={preferAutoResume} prop handles initial state.
  }, [isInView, preferAutoResume, videoUrl]) // Updated dependencies

  if (!videoUrl) {
    return (
      <div className={className} style={containerStyle}>
        No video source.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-black ${className}`} // bg-black is a fallback
      style={containerStyle}
      onClick={onClick ? (e) => onClick(e) : undefined}
    >
      {showBlurredBg && (
        <video
          key={`bg-${videoUrl}`} // Ensures re-render if src changes
          ref={backgroundVideoRef} // Added ref to background video
          src={videoUrl}
          autoPlay={preferAutoResume} // Conditional autoplay based on local storage
          muted
          loop
          playsInline // Important for mobile browsers
          className="absolute left-0 top-0 h-full w-full scale-110 object-cover"
          style={{ filter: "blur(16px)", transform: "scale(1.15)" }} // Adjust blur and scale as needed
        ></video>
      )}
      <video
        key={`fg-${videoUrl}`}
        ref={foregroundVideoRef}
        src={videoUrl}
        controls={controls}
        autoPlay={preferAutoResume} // Conditional autoplay based on local storage
        muted={preferMuted}
        loop
        playsInline
        className="relative z-10 h-full w-full object-contain" // Core style for foreground
        style={videoStyle} // Allows further customization
      ></video>
    </div>
  )
}
export default VideoWithConditionalBlur

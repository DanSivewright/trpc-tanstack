import { useEffect, useRef, type ChangeEvent } from "react"
import { cn } from "@/utils/cn"

interface AutoGrowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number
  maxHeight?: number
}

export function AutoGrowTextarea({
  value,
  defaultValue,
  minHeight = 40,
  maxHeight,
  className,
  onChange,
  ...props
}: AutoGrowTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto"

    // Calculate new height
    let newHeight = textarea.scrollHeight

    // Apply min/max constraints
    if (minHeight && newHeight < minHeight) newHeight = minHeight
    if (maxHeight && newHeight > maxHeight) {
      // newHeight = 72
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.overflowY = "hidden"
    }

    textarea.style.height = `${newHeight}px`
  }

  // Adjust height on content change
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e)
    adjustHeight()
  }

  // Adjust height on initial render and when value changes
  useEffect(() => {
    adjustHeight()
  }, [value, defaultValue])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      className={cn(
        "my-2 w-full resize-none overflow-hidden text-title-h1 font-normal transition-all focus:outline-none focus:ring-0",
        className
      )}
      style={{
        minHeight: minHeight ? `${minHeight}px` : undefined,
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
      }}
      {...props}
    />
  )
}

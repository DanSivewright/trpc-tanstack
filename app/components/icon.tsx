import { memo } from "react"
import { icons } from "lucide-react"

import { cn } from "@/lib/utils"

export type IconProps = {
  name: keyof typeof icons
  className?: string
  strokeWidth?: number
  style?: React.CSSProperties
}

export const Icon = memo(
  ({ name, className, strokeWidth, style }: IconProps) => {
    const IconComponent = icons[name]

    if (!IconComponent) {
      return null
    }

    return (
      <IconComponent
        style={style}
        className={cn("h-4 w-4", className)}
        strokeWidth={strokeWidth || 2.5}
      />
    )
  }
)

Icon.displayName = "Icon"

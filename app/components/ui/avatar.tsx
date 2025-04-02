import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusVariants = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
  // Add any other status variants you need
}

const sizes = {
  20: "size-5 text-[10px]",
  24: "size-6 text-xs",
  32: "size-8 text-sm",
  40: "size-10 text-base",
  48: "size-12 text-lg",
  56: "size-14 text-lg",
  64: "size-16 text-xl",
  72: "size-[72px] text-xl",
  80: "size-20 text-xl",
}
const groupedSpacing = {
  20: " -ml-1",
  24: " -ml-1",
  32: " -ml-1.5",
  40: " -ml-3",
  48: " -ml-3",
  56: " -ml-4",
  64: " -ml-4",
  72: " -ml-4",
  80: "-ml-4",
}

const avatarVariants = cva("relative flex shrink-0 rounded-full", {
  variants: {
    size: sizes,
    grouped: {
      true: "",
      false: "",
    },
    color: {
      gray: "bg-gray-200 text-neutral-950",
      yellow: "bg-yellow-200 text-yellow-950",
      blue: "bg-blue-200 text-blue-950",
      sky: "bg-sky-200 text-sky-950",
      purple: "bg-purple-200 text-purple-950",
      red: "bg-red-200 text-red-950",
      green: "bg-green-200 text-green-950",
    },
    status: statusVariants,
  },
  compoundVariants: [
    ...Object.entries(sizes).map(([size, className]) => ({
      grouped: true,
      size: Number(size) as keyof typeof sizes,
      className: `${className} ${groupedSpacing[Number(size) as keyof typeof groupedSpacing]}`,
    })),
  ],
  defaultVariants: {
    size: 40,
    color: "gray",
    grouped: false,
  },
})

function Avatar({
  className,
  size,
  color,
  status,
  grouped,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={avatarVariants({ className, size, color, grouped })}
      {...props}
    >
      {status && (
        <div
          className={cn(
            "absolute -right-2 -bottom-2 flex size-8 items-center justify-center drop-shadow-[0_2px_4px_#1b1c1d0a]"
          )}
        >
          <span
            className={cn(
              "border-bg-white-0 box-content size-3 rounded-full border-4",
              statusVariants[status]
            )}
          ></span>
        </div>
      )}
      {children}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }

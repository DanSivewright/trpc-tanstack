import { useState } from "react"
import { RiAddLine } from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export const Route = createFileRoute("/x/todos")({
  component: RouteComponent,
})

function RouteComponent() {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-white-0">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-full max-w-screen-sm"
      >
        <motion.div
          className="relative z-10 w-full rounded-20 bg-bg-weak-50 ring-1 ring-stroke-soft-200 drop-shadow-xl"
          animate={{
            rotateZ: isHovered ? 3 : 0,
            x: isHovered ? 19 : 0,
            y: isHovered ? 19 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <header className="flex items-center gap-2 px-4 py-3">
            <span className="font-mono text-label-md">Fri, 02 May 2025</span>
            <Badge.Root size="medium" className="rounded-md px-2">
              17:59
            </Badge.Root>
          </header>
          <div className="flex flex-col gap-3 rounded-20 bg-bg-white-0 p-6 ring-1 ring-stroke-soft-200">
            <h1 className="font-mono text-title-h6">THINGS TO DO TODAY</h1>

            <ul className="flex flex-col gap-6">
              <li className="flex items-center gap-2">
                <Checkbox.Root checked />
                <span className="text-paragraph-lg text-text-sub-600 line-through">
                  5km Run
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox.Root checked />
                <span className="text-paragraph-lg text-text-sub-600 line-through">
                  Survive 9 - 5
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox.Root />
                <span className="text-paragraph-lg">
                  Water plant or admint defeat
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox.Root checked />
                <span className="text-paragraph-lg text-text-sub-600 line-through">
                  Review Ollie & Max's PRs
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox.Root />
                <span className="text-paragraph-lg">Dinner at Lucca, 7pm</span>
              </li>
            </ul>
            <Button.Root className="w-fit" variant="neutral" mode="ghost">
              <Button.Icon as={RiAddLine} />
              Add new
            </Button.Root>
          </div>
        </motion.div>
        <motion.div
          className="absolute inset-0 z-0 w-full rounded-20 bg-bg-weak-50 ring-1 ring-stroke-soft-200 drop-shadow-xl"
          animate={{
            rotateZ: isHovered ? -3 : 0,
            x: isHovered ? -19 : 0,
            y: isHovered ? -19 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <header className="flex items-center gap-2 px-4 py-3">
            <span className="font-mono text-label-md">Thu, 01 May 2025</span>
            <Badge.Root size="medium" className="rounded-md px-2">
              17:59
            </Badge.Root>
          </header>
          <div className="flex flex-col gap-3 rounded-20 bg-bg-white-0 p-6 ring-1 ring-stroke-soft-200">
            <h1 className="font-mono text-title-h6">THINGS TO DO TODAY</h1>

            <ul className="flex flex-col gap-6">
              <li className="flex items-center gap-2">
                <Checkbox.Root checked />
                <span className="text-paragraph-lg text-text-sub-600 line-through">
                  5km Run
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox.Root checked />
                <span className="text-paragraph-lg text-text-sub-600 line-through">
                  Survive 9 - 5
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox.Root />
                <span className="text-paragraph-lg">
                  Water plant or admint defeat
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox.Root checked />
                <span className="text-paragraph-lg text-text-sub-600 line-through">
                  Review Ollie & Max's PRs
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox.Root />
                <span className="text-paragraph-lg">Dinner at Lucca, 7pm</span>
              </li>
            </ul>
            <Button.Root className="w-fit" variant="neutral" mode="ghost">
              <Button.Icon as={RiAddLine} />
              Add new
            </Button.Root>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

import {
  createFileRoute,
  Outlet,
  retainSearchParams,
} from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { z } from "zod"

import { cn } from "@/lib/utils"
import NavigationLearnerHeader from "@/components/navigation/navigation-learner/navigation-learner-header"

export const Route = createFileRoute("/_learner")({
  component: RouteComponent,
  validateSearch: z.object({
    sidebar: z.boolean().default(false).optional(),
  }).parse,
  search: {
    middlewares: [retainSearchParams(["sidebar"])],
  },
})

function RouteComponent() {
  const { sidebar } = Route.useSearch()
  return (
    <div
      className={cn("flex", {
        "bg-accent": sidebar,
      })}
    >
      <AnimatePresence>
        {sidebar && (
          <motion.div
            className="bg-accent fixed inset-y-0 left-0 z-10 h-screen w-[25vw]"
            initial={{ left: "-25vw" }}
            animate={{ left: "0" }}
            exit={{ left: "-25vw" }}
          >
            Sidebar
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{
          width: sidebar ? "calc(100% - 25vw)" : "100%",
          position: sidebar ? "absolute" : "relative",
          left: sidebar ? "25vw" : "0",
        }}
        animate={{
          width: sidebar ? "calc(100% - 25vw)" : "100%",
          position: sidebar ? "absolute" : "relative",
          left: sidebar ? "25vw" : "0",
        }}
        className={cn("bg-background", {
          "bg-background h-screen overflow-x-hidden overflow-y-scroll rounded-l-2xl shadow-2xl":
            sidebar,
        })}
      >
        <NavigationLearnerHeader />
        <Outlet />
      </motion.div>
    </div>
  )
}

import React from "react"
import { cn } from "@/utils/cn"
import { RiArrowRightSLine } from "@remixicon/react"
import { isMatch, Link, useMatches } from "@tanstack/react-router"
import { motion, useScroll, useTransform } from "motion/react"

import * as Breadcrumb from "@/components/ui/breadcrumb"

type Props = {
  children?: React.ReactNode
  hideBreadcrumbs?: boolean
  mode?: "light" | "default"
  className?: string
  overrideChildren?: boolean
}

const NavigationLearnerSubHeader: React.FC<Props> = ({
  children,
  hideBreadcrumbs,
  mode = "default",
  className,
  overrideChildren = false,
}) => {
  const matches = useMatches()
  const matchesWithCrumbs = matches.filter((match) =>
    isMatch(match, "loaderData.crumb")
  )

  const items = matchesWithCrumbs.map(({ pathname, loaderData, routeId }) => {
    return {
      routeId,
      tabs: loaderData && "tabs" in loaderData ? loaderData.tabs : null,
      href: pathname,
      label: loaderData?.crumb,
    }
  })

  const { scrollY } = useScroll()

  const rgba = mode === "light" ? "255, 255, 255" : "235, 235, 235"
  const backgroundColor = useTransform(
    scrollY,
    [0, 88, 144],
    [`rgba(${rgba})`, `rgba(${rgba})`, `rgba(${rgba}, 0.88)`]
  )
  const backdropBlur = useTransform(
    scrollY,
    [0, 88, 144],
    ["blur(0px)", "blur(0px)", "blur(20px)"]
  )
  const boxShadow = useTransform(
    scrollY,

    [0, 88, 144],
    [
      "0px 0px 0px rgba(0, 0, 0, 0)",
      "0px 0px 0px rgba(0, 0, 0, 0)",
      `0px 4px 12px rgba(${rgba}, 0.2)`,
    ]
  )
  return (
    <motion.div
      style={
        overrideChildren
          ? {}
          : {
              backgroundColor,
              backdropFilter: backdropBlur,
              boxShadow,
            }
      }
      className={cn("sticky inset-x-0 top-0 z-50 px-8 xl:px-0", className)}
    >
      {overrideChildren ? (
        children
      ) : (
        <>
          <div className="mx-auto flex w-full max-w-screen-lg items-center justify-between">
            {!hideBreadcrumbs && (
              <Breadcrumb.Root>
                {items?.map((crumb, i) => {
                  const isLast = items?.length - 1 === i
                  return (
                    <React.Fragment key={crumb.href + crumb.label}>
                      <Breadcrumb.Item
                        key={crumb.href + crumb.label}
                        active={isLast}
                        asChild
                      >
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </Breadcrumb.Item>
                      {!isLast && (
                        <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />
                      )}
                    </React.Fragment>
                  )
                })}
              </Breadcrumb.Root>
            )}

            <div className="flex items-center gap-5">{children}</div>
          </div>
        </>
      )}
    </motion.div>
  )
}
export default NavigationLearnerSubHeader

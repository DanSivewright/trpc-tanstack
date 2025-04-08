import React from "react"
import { RiAddLine, RiArrowRightSLine } from "@remixicon/react"
import { isMatch, Link, useMatches } from "@tanstack/react-router"
import { motion, useScroll, useTransform } from "motion/react"

import * as Breadcrumb from "@/components/ui/breadcrumb"
import * as Button from "@/components/ui/button"
import * as TabMenuHorizontal from "@/components/ui/tab-menu-horizontal"

type Props = {
  children?: React.ReactNode
}

const NavigationLearnerSubHeader: React.FC<Props> = ({ children }) => {
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

  const backgroundColor = useTransform(
    scrollY,
    [0, 88, 144],
    ["rgba(235, 235, 235)", "rgba(235, 235, 235)", "rgba(235, 235, 235, 0.88)"]
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
      "0px 4px 12px rgba(235, 235, 235, 0.2)",
    ]
  )
  return (
    <motion.div
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
        boxShadow,
      }}
      className="sticky inset-x-0 top-0 z-50"
    >
      <div className="mx-auto flex w-full max-w-screen-lg items-center justify-between">
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
                {!isLast && <Breadcrumb.ArrowIcon as={RiArrowRightSLine} />}
              </React.Fragment>
            )
          })}
        </Breadcrumb.Root>

        <div className="flex items-center gap-5">{children}</div>
      </div>
    </motion.div>
  )
}
export default NavigationLearnerSubHeader

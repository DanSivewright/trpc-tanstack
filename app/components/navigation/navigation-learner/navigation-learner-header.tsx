import React from "react"
import { Link } from "@tanstack/react-router"

type Props = {}
const NavigationLearnerHeader: React.FC<Props> = ({}) => {
  const navClass =
    "text flex h-full items-center hover:text-primary-dark transition-colors justify-center px-2 text-center text-[13px] font-light"
  const navActiveProps = {
    className: "text-primary-base ",
  }
  return (
    <>
      <header className="relative z-10 bg-bg-soft-200 px-8 xl:px-0">
        <nav className="mx-auto flex w-full max-w-screen-lg items-center justify-between">
          <ul className="flex h-11 grow items-center gap-4">
            <li className="h-11 py-3">
              <div className="aspect-square h-full overflow-hidden rounded-br-lg bg-primary-base">
                <Link className="block h-full w-full" to="/"></Link>
              </div>
            </li>
            <li className="h-full">
              <Link className={navClass} activeProps={navActiveProps} to="/">
                Learning
              </Link>
            </li>
            <li className="h-full">
              <Link
                className={navClass}
                activeProps={navActiveProps}
                to="/communities"
                preload="intent"
              >
                Communities
              </Link>
            </li>
            <li className="h-full">
              <Link
                className={navClass}
                activeProps={navActiveProps}
                to="/explore"
              >
                Explore
              </Link>
            </li>
            <li className="h-full">
              <Link
                className={navClass}
                activeProps={navActiveProps}
                to="/calendar"
              >
                Calendar
              </Link>
            </li>
            <li className="h-full">
              <Link
                className={navClass}
                activeProps={navActiveProps}
                to="/tasks"
              >
                Tasks
              </Link>
            </li>
            <li className="h-full">
              <Link
                className={navClass}
                activeProps={navActiveProps}
                to="/chat"
              >
                Chat
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  )
}
export default NavigationLearnerHeader

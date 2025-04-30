import { cn } from "@/utils/cn"
import { RiCheckboxCircleFill, RiSparklingLine } from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"

import * as Badge from "@/components/ui/badge"
import { FancyButton } from "@/components/ui/fancy-button"
import { Label } from "@/components/ui/label"
import { Radio } from "@/components/ui/radio"
import * as StatusBadge from "@/components/ui/status-badge"
import * as Switch from "@/components/ui/switch"

export const Route = createFileRoute("/test")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-white-0">
      <div className="w-full max-w-screen-md overflow-hidden rounded-10 border border-stroke-soft-200 bg-bg-white-0 drop-shadow-2xl">
        <header className="w-full p-1">
          <div className="flex aspect-[16/5] w-full flex-col items-start justify-between rounded-[6px] bg-bg-surface-800 p-6">
            <Badge.Root size="medium" color="purple">
              PRO
            </Badge.Root>
            <div className="flex flex-col gap-3">
              <h1 className="text-title-h5 font-normal text-text-white-0">
                Upgrade Your Buying Power
              </h1>
              <p className="text-pretty text-label-lg font-light text-text-soft-400">
                Find better matches, get exclusive access, and move faster with
                a plan that suits your buying goals
              </p>
            </div>
          </div>
        </header>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <Switch.Root />
              <label className="text-label-sm font-light">Yearly</label>
            </div>

            <div className="flex items-center gap-5 rounded-md border border-stroke-soft-200 bg-bg-white-0 py-0.5 pl-2.5 pr-0.5">
              <span className="text-label-sm font-light">
                💡 Tip: Most buyers close in 6-9 months. Yearly covers it all.
              </span>
              <StatusBadge.Root status="completed" variant="light">
                Save 15%
              </StatusBadge.Root>
            </div>
          </div>
          <Radio.Group value="plus" className="flex w-full items-center gap-6">
            <div className="group/radio grow">
              <Label.Root
                htmlFor="plus"
                className={cn([
                  "flex h-full w-full items-start gap-3 rounded-20 border border-bg-soft-200 bg-bg-white-0 p-4",
                  "border-2 border-transparent group-has-[[data-state=checked]]/radio:border-bg-surface-800",
                  "group-has-[[data-state=checked]]/radio:outline group-has-[[data-state=checked]]/radio:outline-2 group-has-[[data-state=checked]]/radio:outline-offset-1 group-has-[[data-state=checked]]/radio:outline-bg-soft-200",
                ])}
              >
                <Radio.Item id="plus" value="plus" />
                <div className="flex w-full flex-col gap-1">
                  <div className="flex w-full items-center justify-between">
                    <p className="text-paragraph-lg font-semibold">SMB Plus</p>
                    <p className="text-paragraph-lg font-semibold">$50 / mo</p>
                  </div>
                  <p className="text-paragraph-md font-light text-text-soft-400">
                    For active searchers needing more support.
                  </p>
                </div>
              </Label.Root>
            </div>
            <div className="group/radio grow">
              <Label.Root
                htmlFor="pro"
                className={cn([
                  "flex h-full w-full items-start gap-3 rounded-20 border border-bg-soft-200 bg-bg-white-0 p-4",
                  "border border-stroke-soft-200 group-has-[[data-state=checked]]/radio:border-bg-surface-800",
                  "group-has-[[data-state=checked]]/radio:outline group-has-[[data-state=checked]]/radio:outline-2 group-has-[[data-state=checked]]/radio:outline-offset-1 group-has-[[data-state=checked]]/radio:outline-bg-soft-200",
                ])}
              >
                <Radio.Item id="pro" value="pro" />
                <div className="flex w-full flex-col gap-1">
                  <div className="flex w-full items-center justify-between">
                    <p className="text-paragraph-lg font-semibold">SMB Pro</p>
                    <p className="text-paragraph-lg font-semibold">$250 / mo</p>
                  </div>
                  <p className="text-paragraph-md font-light text-text-soft-400">
                    Best for dedicated searchers or teams.
                  </p>
                </div>
              </Label.Root>
            </div>
          </Radio.Group>

          <div className="flex flex-col gap-3">
            <h2 className="text-label-lg font-normal">What you get:</h2>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-2.5 text-label-md font-normal text-text-sub-600">
                <RiCheckboxCircleFill className="fill-bg-sub-300" />
                <span>Everything in Searcher, plus</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md font-normal text-text-sub-600">
                <RiCheckboxCircleFill className="fill-bg-sub-300" />
                <span>Proactive Business Match Notifications</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md font-normal text-text-sub-600">
                <RiCheckboxCircleFill className="fill-bg-sub-300" />
                <span>Early Acces to For-Sale Listings</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md font-normal text-text-sub-600">
                <RiCheckboxCircleFill className="fill-bg-sub-300" />
                <span>200 SMB Requests/month (On and Off Market)</span>
              </li>
            </ul>
          </div>
        </div>
        <footer className="flex flex-col gap-2 border-t border-bg-soft-200 bg-bg-weak-50 p-5 pb-3 text-center">
          <FancyButton.Root variant="primary">
            <FancyButton.Icon as={RiSparklingLine} />
            Upgrade
          </FancyButton.Root>
          <span className="text-label-xs font-light text-text-soft-400">
            We securely process your payments through Stripe
          </span>
        </footer>
      </div>
    </div>
  )
}

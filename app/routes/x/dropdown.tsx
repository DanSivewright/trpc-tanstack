import { faker } from "@faker-js/faker"
import { RiEmojiStickerLine, RiMore2Line, RiPencilLine } from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { formatDistance } from "date-fns"

import * as Avatar from "@/components/ui/avatar"
import * as CompactButton from "@/components/ui/compact-button"
import * as Divider from "@/components/ui/divider"
import * as Dropdown from "@/components/ui/dropdown"
import * as Input from "@/components/ui/input"

export const Route = createFileRoute("/x/dropdown")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-white-0">
      <div className="w-full max-w-screen-sm">
        <div className="flex items-start gap-3">
          <Avatar.Root
            color="blue"
            className="rounded-bl-lg outline outline-primary-base"
            size="48"
          >
            <Avatar.Image
              className="rounded-bl-lg"
              src="https://www.alignui.com/images/avatar/memoji/arthur.png"
            />
          </Avatar.Root>
          <div className="grow rounded-10 border border-stroke-soft-200 shadow-regular-md">
            <header className="border-b border-stroke-soft-200 px-3 py-2">
              <p>Comment</p>
            </header>
            <div className="flex flex-col gap-3 p-1">
              <div className="flex flex-col px-3 py-2 pb-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar.Root size="24">
                      <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/james.png" />
                    </Avatar.Root>
                    <p>John Doe</p>
                    <p className="text-label-sm font-light text-text-soft-400">
                      {formatDistance(faker.date.recent(), new Date(), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CompactButton.Root size="medium" variant="ghost">
                      <CompactButton.Icon as={RiEmojiStickerLine} />
                    </CompactButton.Root>
                    <Dropdown.Root>
                      <Dropdown.Trigger asChild>
                        <CompactButton.Root size="medium" variant="ghost">
                          <CompactButton.Icon as={RiMore2Line} />
                        </CompactButton.Root>
                      </Dropdown.Trigger>
                      <Dropdown.Content align="end">
                        <p className="text-label-xm p-2 text-text-soft-400">
                          Assign Status
                        </p>
                        <Dropdown.Item>
                          <span className="size-2 rounded-full bg-error-base"></span>
                          Urgent
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <span className="size-2 rounded-full bg-warning-base"></span>
                          Low Priority
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <span className="size-2 rounded-full bg-success-base"></span>
                          Done
                        </Dropdown.Item>
                        <Divider.Root />
                        <p className="text-label-xm p-2 text-text-soft-400">
                          Integrate With
                        </p>
                        <Dropdown.Item>
                          <Avatar.Root size="20">
                            <Avatar.Image src="https://www.alignui.com/images/major-brands/slack.svg" />
                          </Avatar.Root>
                          Slack
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Avatar.Root size="20">
                            <Avatar.Image src="https://www.alignui.com/images/major-brands/linear.svg" />
                          </Avatar.Root>
                          Linear
                        </Dropdown.Item>
                        <Divider.Root />
                        <Dropdown.Item>
                          <Dropdown.ItemIcon as={RiPencilLine} />
                          Edit...
                        </Dropdown.Item>
                      </Dropdown.Content>
                    </Dropdown.Root>
                  </div>
                </div>
                <p>
                  <span className="text-primary-base">@David</span>
                  <span className="">, {faker.lorem.sentence()}</span>
                </p>
              </div>
              <Input.Root size="small">
                <Input.Wrapper className="bg-bg-soft-200">
                  <Input.Input type="text" placeholder="Message" />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

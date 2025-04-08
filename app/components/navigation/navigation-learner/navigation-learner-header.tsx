import React from "react"
import { useTRPC } from "@/integrations/trpc/react"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation } from "@tanstack/react-router"

type Props = {}
const NavigationLearnerHeader: React.FC<Props> = ({}) => {
  const trpc = useTRPC()
  const me = useQuery(trpc.people.me.queryOptions())

  const location = useLocation()

  const navClass =
    "text flex h-full items-center hover:text-primary-dark transition-colors justify-center px-2 text-center text-[13px] font-light"
  const navActiveProps = {
    className: "text-primary-base ",
  }
  return (
    <>
      <header className="relative z-10 bg-bg-soft-200">
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

      {/* <header className="gutter sticky top-0 z-10 flex w-full items-center justify-between gap-x-2 border-b bg-bg-white-0 backdrop-blur-md sm:gap-x-3">
        <nav className="flex h-11 w-1/3 items-center gap-x-4 md:h-[unset] md:gap-x-6">
          <Link to="/" className="h-6 w-6 rounded-br-lg bg-blue-500" />

          <SegmentedControl.Root
            defaultValue="system"
            className="bg-transparent bg-none"
          >
            <SegmentedControl.List
            //   floatingBgClassName="rounded-full bg-primary-base w-fit"
            //   className="rounded-full bg-transparent bg-none"
            >
              <SegmentedControl.Trigger
                value="light"
                // className="data-[state=active]: h-8 w-fit data-[state=active]:px-2"
                asChild
              >
                <Link to="/">Home</Link>
              </SegmentedControl.Trigger>
              <SegmentedControl.Trigger
                // className="data-[state=active]: h-8 w-fit data-[state=active]:px-2"
                value="dark"
                asChild
              >
                <Link to="/communities">Communities</Link>
              </SegmentedControl.Trigger>
              <SegmentedControl.Trigger
                // className="data-[state=active]: h-8 w-fit data-[state=active]:px-2"
                value="system"
                asChild
              >
                <Link to="/explore">Explore</Link>
              </SegmentedControl.Trigger>
            </SegmentedControl.List>
          </SegmentedControl.Root>
        </nav>
        <div className="flex grow items-center justify-center">
          <Input.Root
            className="max-w-[500px] rounded-full border-none bg-bg-soft-200"
            size="small"
          >
            <Input.Wrapper className="rounded-full border-none bg-bg-soft-200">
              <Input.Icon as={RiSearchLine} />
              <Input.Input
                type="text"
                placeholder="Search anything, anytime..."
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className="flex w-1/3 items-center justify-end gap-4 py-2.5">
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button.Root
                mode="ghost"
                variant="neutral"
                className="aspect-square"
                size="xsmall"
              >
                <Button.Icon className="size-3.5" as={RiChatUnreadLine} />
              </Button.Root>
            </Popover.Trigger>
            <Popover.Content
              showArrow={false}
              className="mx-4 h-[480px] w-screen max-w-[calc(100vw-36px)] rounded-3xl bg-bg-white-0 p-0 shadow-regular-md will-change-transform min-[480px]:max-w-[420px]"
            >
              <Popover.Close asChild>
                <CompactButton.Root size="large" variant="ghost">
                  <CompactButton.Icon as={RiCloseLine} />
                </CompactButton.Root>
              </Popover.Close>
              <header className="relative z-10 flex items-center justify-between px-5 py-4">
                <h5 className="text-label-md text-text-sub-600">
                  Notifications
                </h5>
              </header>
              <Divider.Root />
              <div className="flex items-center justify-between gap-5 px-5 py-2.5">
                <div className="flex items-center gap-5">
                  <LinkButton.Root variant="primary">All</LinkButton.Root>
                  <LinkButton.Root>Unread</LinkButton.Root>
                </div>
                <LinkButton.Root>Mark all as read</LinkButton.Root>
              </div>
              <Divider.Root />
              <div className="overflow-auto">
                <div>
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex shrink-0 items-center justify-center text-text-soft-400">
                        <svg
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          className="remixicon size-5"
                        >
                          <path d="M9 2.4578V4.58152C6.06817 5.76829 4 8.64262 4 12C4 16.4183 7.58172 20 12 20C15.3574 20 18.2317 17.9318 19.4185 15H21.5422C20.2679 19.0571 16.4776 22 12 22C6.47715 22 2 17.5228 2 12C2 7.52236 4.94289 3.73207 9 2.4578ZM12 2C17.5228 2 22 6.47715 22 12C22 12.3375 21.9833 12.6711 21.9506 13H11V2.04938C11.3289 2.01672 11.6625 2 12 2ZM13 4.06189V11H19.9381C19.4869 7.38128 16.6187 4.51314 13 4.06189Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <h5 className="text-label-sm text-text-strong-950">
                          Performance Review Due
                        </h5>
                        <span className="pt-1 text-paragraph-sm text-text-sub-600">
                          5 team members need Q4 evaluation
                        </span>
                        <span className="pt-2 text-label-xs text-text-soft-400">
                          15 minutes ago
                        </span>
                      </div>
                      <div className="ml-auto flex size-4 items-center justify-center">
                        <div className="size-1.5 shrink-0 rounded-full bg-primary-base"></div>
                      </div>
                    </div>
                  </div>
                  <Divider.Root />
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex shrink-0 items-center justify-center text-text-soft-400">
                        <svg
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          className="remixicon size-5"
                        >
                          <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 11V8H13V11H16V13H13V16H11V13H8V11H11Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <h5 className="text-label-sm text-text-strong-950">
                          Onboarding Status
                        </h5>
                        <span className="pt-1 text-paragraph-sm text-text-sub-600">
                          New hire documentation pending for James
                        </span>
                        <span className="pt-2 text-label-xs text-text-soft-400">
                          1 hour ago
                        </span>
                      </div>
                      <div className="ml-auto flex size-4 items-center justify-center">
                        <div className="size-1.5 shrink-0 rounded-full bg-primary-base"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Popover.Content>
          </Popover.Root>

          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <Avatar.Root size="32" placeholderType="user">
                <Avatar.Image
                  className="object-cover"
                  src={me?.data?.imageUrl || undefined}
                />
              </Avatar.Root>
            </Dropdown.Trigger>
            <Dropdown.Content align="end">
              <div className="flex items-center gap-3 p-2">
                <Avatar.Root size="40">
                  <Avatar.Image src={me?.data?.imageUrl || undefined} />
                  <Avatar.Indicator position="top">
                    <CustomVerifiedIconSVG />
                  </Avatar.Indicator>
                </Avatar.Root>
                <div className="flex-1">
                  <div className="text-label-sm text-text-strong-950">
                    {me?.data?.firstName} {me?.data?.lastName}
                  </div>
                  <div className="mt-1 text-paragraph-xs text-text-sub-600">
                    {me?.data?.companyPerson?.email ||
                      me?.data?.contact?.email ||
                      ""}
                  </div>
                </div>
                <Badge.Root variant="light" color="green" size="medium">
                  PRO
                </Badge.Root>
              </div>
              <Dropdown.Item>
                <Dropdown.ItemIcon as={RiMoonLine} />
                Dark Mode
                <span className="flex-1" />
                <Switch.Root />
              </Dropdown.Item>
              <Divider.Root variant="line-spacing" />
              <Dropdown.Group>
                <Dropdown.Item>
                  <Dropdown.ItemIcon as={RiPulseLine} />
                  Activity
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.ItemIcon as={RiLayoutGridLine} />
                  Integrations
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.ItemIcon as={RiSettings2Line} />
                  Settings
                </Dropdown.Item>
              </Dropdown.Group>
              <Divider.Root variant="line-spacing" />
              <Dropdown.Group>
                <Dropdown.Item>
                  <Dropdown.ItemIcon as={RiAddLine} />
                  Add Account
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={(e) => {
                    e.preventDefault()
                    signOut(auth)
                  }}
                >
                  <Dropdown.ItemIcon as={RiLogoutBoxRLine} />
                  Logout
                </Dropdown.Item>
              </Dropdown.Group>
              <div className="p-2 text-paragraph-sm text-text-soft-400">
                v.1.5.69 · Terms & Conditions
              </div>
            </Dropdown.Content>
          </Dropdown.Root>
        </div>
      </header> */}
    </>
  )
}
export default NavigationLearnerHeader

function CustomVerifiedIconSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M22.3431 5.51481L20.1212 3.29299C18.9497 2.12141 17.0502 2.12141 15.8786 3.29299L13.6568 5.51481H10.5146C8.85778 5.51481 7.51463 6.85796 7.51463 8.51481V11.6569L5.2928 13.8788C4.12123 15.0503 4.12123 16.9498 5.2928 18.1214L7.51463 20.3432V23.4854C7.51463 25.1422 8.85777 26.4854 10.5146 26.4854H13.6568L15.8786 28.7072C17.0502 29.8788 18.9497 29.8788 20.1212 28.7072L22.3431 26.4854H25.4852C27.142 26.4854 28.4852 25.1422 28.4852 23.4854V20.3432L30.707 18.1214C31.8786 16.9498 31.8786 15.0503 30.707 13.8788L28.4852 11.6569V8.51481C28.4852 6.85796 27.142 5.51481 25.4852 5.51481H22.3431ZM21.2217 7.22192C21.4093 7.40946 21.6636 7.51481 21.9288 7.51481H25.4852C26.0375 7.51481 26.4852 7.96253 26.4852 8.51481V12.0712C26.4852 12.3364 26.5905 12.5907 26.7781 12.7783L29.2928 15.293C29.6833 15.6835 29.6833 16.3167 29.2928 16.7072L26.7781 19.2219C26.5905 19.4095 26.4852 19.6638 26.4852 19.929V23.4854C26.4852 24.0377 26.0375 24.4854 25.4852 24.4854H21.9288C21.6636 24.4854 21.4093 24.5907 21.2217 24.7783L18.707 27.293C18.3165 27.6835 17.6833 27.6835 17.2928 27.293L14.7781 24.7783C14.5905 24.5907 14.3362 24.4854 14.071 24.4854H10.5146C9.96234 24.4854 9.51463 24.0377 9.51463 23.4854V19.929C9.51463 19.6638 9.40927 19.4095 9.22174 19.2219L6.70702 16.7072C6.31649 16.3167 6.31649 15.6835 6.70702 15.293L9.22174 12.7783C9.40927 12.5907 9.51463 12.3364 9.51463 12.0712V8.51481C9.51463 7.96253 9.96234 7.51481 10.5146 7.51481H14.071C14.3362 7.51481 14.5905 7.40946 14.7781 7.22192L17.2928 4.7072C17.6833 4.31668 18.3165 4.31668 18.707 4.7072L21.2217 7.22192Z"
        className="fill-bg-white-0"
      />
      <path
        d="M21.9288 7.51457C21.6636 7.51457 21.4092 7.40921 21.2217 7.22167L18.707 4.70696C18.3164 4.31643 17.6833 4.31643 17.2927 4.70696L14.778 7.22167C14.5905 7.40921 14.3361 7.51457 14.0709 7.51457H10.5146C9.96228 7.51457 9.51457 7.96228 9.51457 8.51457V12.0709C9.51457 12.3361 9.40921 12.5905 9.22167 12.778L6.70696 15.2927C6.31643 15.6833 6.31643 16.3164 6.70696 16.707L9.22167 19.2217C9.40921 19.4092 9.51457 19.6636 9.51457 19.9288V23.4851C9.51457 24.0374 9.96228 24.4851 10.5146 24.4851H14.0709C14.3361 24.4851 14.5905 24.5905 14.778 24.778L17.2927 27.2927C17.6833 27.6833 18.3164 27.6833 18.707 27.2927L21.2217 24.778C21.4092 24.5905 21.6636 24.4851 21.9288 24.4851H25.4851C26.0374 24.4851 26.4851 24.0374 26.4851 23.4851V19.9288C26.4851 19.6636 26.5905 19.4092 26.778 19.2217L29.2927 16.707C29.6833 16.3164 29.6833 15.6833 29.2927 15.2927L26.778 12.778C26.5905 12.5905 26.4851 12.3361 26.4851 12.0709V8.51457C26.4851 7.96228 26.0374 7.51457 25.4851 7.51457H21.9288Z"
        fill="#47C2FF"
      />
      <path
        d="M23.3737 13.3739L16.6666 20.081L13.2928 16.7073L14.707 15.2931L16.6666 17.2526L21.9595 11.9597L23.3737 13.3739Z"
        className="fill-text-white-0"
      />
    </svg>
  )
}

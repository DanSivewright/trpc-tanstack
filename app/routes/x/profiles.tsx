import { useEffect, useState } from "react"
import { cn } from "@/utils/cn"
import { RiNotificationFill, RiVipCrownLine } from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FancyButton } from "@/components/ui/fancy-button"
import VerifiedIcon from "@/components/verified-icon"

export const Route = createFileRoute("/x/profiles")({
  component: RouteComponent,
})

const positions = {
  center: { zIndex: 10, x: 0, scale: 1, opacity: 1 },
  left1: { zIndex: 5, x: "-20%", scale: 0.9, opacity: 1 },
  left2: { zIndex: 0, x: "-35%", scale: 0.8, opacity: 1 },
  right1: { zIndex: 5, x: "20%", scale: 0.9, opacity: 1 },
  right2: { zIndex: 0, x: "35%", scale: 0.8, opacity: 1 },
}

// Profile data
const profiles = [
  {
    id: 1,
    name: "David Bowie",
    username: "@david_bowie12",
    avatar: "https://www.alignui.com/images/avatar/memoji/arthur.png",
    gradientFrom: "from-primary-alpha-24",
    avatarColor: "blue",
    title: "Product Designer - Mobile App Designer",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia autem pariatur nam, veniam sunt maiores quibusdam. Distinctio iusto mollitia excepturi corrupti eos veritatis officiis delectus alias laudantium maxime! Laudantium, consectetur.",
    skills: [
      "Adobe Photoshop",
      "Notion",
      "Motion Design",
      "Visual 3D",
      "Webflow",
      "Framer",
      "UX Research",
      "Brand Identity",
    ],
  },
  {
    id: 2,
    name: "Emilia Clarke",
    username: "@emilia_clarke",
    avatar: "https://www.alignui.com/images/avatar/memoji/emma.png",
    gradientFrom: "from-success-light",
    avatarColor: "gray",
    title: "Web Designer",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia autem pariatur nam, veniam sunt maiores quibusdam. Distinctio iusto mollitia excepturi corrupti eos veritatis officiis delectus alias laudantium maxime! Laudantium, consectetur.",
    skills: [
      "Adobe Photoshop",
      "Notion",
      "Motion Design",
      "Visual 3D",
      "Webflow",
      "Framer",
      "UX Research",
      "Brand Identity",
    ],
  },
  {
    id: 3,
    name: "Wei Zhou",
    username: "@wei_zhou",
    avatar: "https://www.alignui.com/images/avatar/memoji/wei.png",
    gradientFrom: "from-purple-alpha-24",
    avatarColor: "purple",
    title: "Software Engineer",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia autem pariatur nam, veniam sunt maiores quibusdam. Distinctio iusto mollitia excepturi corrupti eos veritatis officiis delectus alias laudantium maxime! Laudantium, consectetur.",
    skills: [
      "Adobe Photoshop",
      "Notion",
      "Motion Design",
      "Visual 3D",
      "Webflow",
      "Framer",
      "UX Research",
      "Brand Identity",
    ],
  },
  {
    id: 4,
    name: "Emma Watson",
    username: "@emma_watson",
    avatar: "https://www.alignui.com/images/avatar/memoji/lena.png",
    gradientFrom: "from-warning-light",
    avatarColor: "yellow",
    title: "Actress",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia autem pariatur nam, veniam sunt maiores quibusdam. Distinctio iusto mollitia excepturi corrupti eos veritatis officiis delectus alias laudantium maxime! Laudantium, consectetur.",
    skills: [
      "Adobe Photoshop",
      "Notion",
      "Motion Design",
      "Visual 3D",
      "Webflow",
      "Framer",
      "UX Research",
      "Brand Identity",
    ],
  },
  {
    id: 5,
    name: "Alexis Ohanian",
    username: "@alexis_ohanian",
    avatar: "https://www.alignui.com/images/avatar/memoji/james.png",
    gradientFrom: "from-error-light",
    avatarColor: "red",
    title: "Front-End Developer",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia autem pariatur nam, veniam sunt maiores quibusdam. Distinctio iusto mollitia excepturi corrupti eos veritatis officiis delectus alias laudantium maxime! Laudantium, consectetur.",
    skills: [
      "Adobe Photoshop",
      "Notion",
      "Motion Design",
      "Visual 3D",
      "Webflow",
      "Framer",
      "UX Research",
      "Brand Identity",
    ],
  },
]
function RouteComponent() {
  const [cards, setCards] = useState([0, 1, 2, 3, 4])

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newCards = [...prevCards]
        // Move the last card to the front
        const lastCard = newCards.pop()
        if (lastCard !== undefined) {
          newCards.unshift(lastCard)
        }
        return newCards
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Get position name based on index
  const getPositionName = (index: number) => {
    switch (index) {
      case 0:
        return "left2"
      case 1:
        return "left1"
      case 2:
        return "center"
      case 3:
        return "right1"
      case 4:
        return "right2"
      default:
        return "center"
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center bg-white pt-24">
      <div className="group relative w-full max-w-screen-sm">
        {cards.map((profileIndex, positionIndex) => (
          <motion.div
            key={profiles[profileIndex].id}
            initial={positions.center}
            animate={positions[getPositionName(positionIndex)]}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
            className="absolute top-0 z-10 w-full overflow-hidden rounded-20 bg-bg-white-0 shadow-regular-sm ring-1 ring-stroke-soft-200"
          >
            <header
              className={cn(
                "flex aspect-[16/6] w-full items-end bg-gradient-to-b to-bg-white-0 p-6",
                profiles[profileIndex].gradientFrom
              )}
            >
              <Avatar.Root
                color={profiles[profileIndex].avatarColor as any}
                className="ring-4 ring-bg-white-0"
              >
                <Avatar.Image src={profiles[profileIndex].avatar} />
              </Avatar.Root>
            </header>
            <div className="flex w-full flex-col gap-0.5 px-6 pb-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="shrink-0 text-title-h4">
                    {profiles[profileIndex].name}
                  </h1>
                  <VerifiedIcon className="mt-2 size-10" />
                  <FancyButton.Root
                    className="h-7 rounded-full"
                    variant="primary"
                    size="xsmall"
                  >
                    <FancyButton.Icon className="size-4" as={RiVipCrownLine} />
                    Pro
                  </FancyButton.Root>
                </div>
                <RiNotificationFill className="fill-primary-base" />
              </div>
              <span className="text-label-md text-text-soft-400">
                {profiles[profileIndex].username}
              </span>
            </div>
            <div className="flex flex-col gap-6 p-6 pt-2">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-title-h6">
                  {profiles[profileIndex].title}
                </h2>
                <p className="text-label-md text-text-sub-600">
                  {profiles[profileIndex].description}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-label-sm text-text-soft-400">Skills</span>
                <div className="flex flex-wrap gap-2">
                  {profiles[profileIndex].skills.map((skill) => (
                    <Button.Root
                      key={skill}
                      size="xsmall"
                      variant="neutral"
                      mode="lighter"
                    >
                      {skill}
                    </Button.Root>
                  ))}
                </div>
              </div>
              <footer className="flex w-full flex-1 items-center gap-3">
                <Button.Root className="grow" variant="neutral" mode="stroke">
                  Message {profiles[profileIndex].name.split(" ")[0]}
                </Button.Root>
                <FancyButton.Root className="grow" variant="primary">
                  Connect
                </FancyButton.Root>
              </footer>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
  //   return (
  //     <div className="flex h-screen w-screen flex-col items-center justify-center bg-bg-white-0">
  //       <div className="group relative w-full max-w-screen-sm">
  //         {/* RIGHT */}
  //         <motion.div className="absolute -right-56 top-0 z-0 w-full scale-[0.8] overflow-hidden rounded-20 bg-bg-white-0 shadow-regular-sm ring-1 ring-stroke-soft-200">
  //           <header className="flex aspect-[16/6] w-full items-end bg-gradient-to-b from-purple-alpha-24 to-bg-white-0 p-6">
  //             <Avatar.Root color="purple" className="ring-4 ring-bg-white-0">
  //               <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/emma.png" />
  //             </Avatar.Root>
  //           </header>
  //           <div className="flex w-full flex-col gap-0.5 px-6 pb-6">
  //             <div className="flex items-center justify-between gap-2">
  //               <div className="flex items-center gap-2">
  //                 <h1 className="shrink-0 text-title-h4">Emma Watson</h1>
  //                 <VerifiedIcon className="mt-2 size-10" />
  //                 <FancyButton.Root
  //                   className="h-7 rounded-full"
  //                   variant="primary"
  //                   size="xsmall"
  //                 >
  //                   <FancyButton.Icon className="size-4" as={RiVipCrownLine} />
  //                   Pro
  //                 </FancyButton.Root>
  //               </div>
  //               <RiNotificationFill className="fill-primary-base" />
  //             </div>
  //             <span className="text-label-md text-text-soft-400">
  //               @emma_watson
  //             </span>
  //           </div>
  //           <div className="flex flex-col gap-6 p-6 pt-2">
  //             <div className="flex flex-col gap-1.5">
  //               <h2 className="text-title-h6">Actress</h2>
  //               <p className="text-label-md text-text-sub-600">
  //                 Actress at twisterdesign.pro | More than 5 Years of experience
  //               </p>
  //             </div>
  //             <div className="flex flex-col gap-2">
  //               <span className="text-label-sm text-text-soft-400">Skills</span>
  //               <div className="flex flex-wrap gap-2">
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Acting
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Singing
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Dancing
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   tRPC
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Writing
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Reading
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Git
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   CI/CD
  //                 </Button.Root>
  //               </div>
  //             </div>
  //             <footer className="flex w-full flex-1 items-center gap-3">
  //               <Button.Root className="grow" variant="neutral" mode="stroke">
  //                 Message Emilia
  //               </Button.Root>
  //               <FancyButton.Root className="grow" variant="primary">
  //                 Connect
  //               </FancyButton.Root>
  //             </footer>
  //           </div>
  //         </motion.div>
  //         <motion.div className="absolute -right-32 top-0 z-[1] w-full scale-[0.9] overflow-hidden rounded-20 bg-bg-white-0 shadow-regular-sm ring-1 ring-stroke-soft-200">
  //           <header className="flex aspect-[16/6] w-full items-end bg-gradient-to-b from-success-light to-bg-white-0 p-6">
  //             <Avatar.Root color="gray" className="ring-4 ring-bg-white-0">
  //               <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/wei.png" />
  //             </Avatar.Root>
  //           </header>
  //           <div className="flex w-full flex-col gap-0.5 px-6 pb-6">
  //             <div className="flex items-center justify-between gap-2">
  //               <div className="flex items-center gap-2">
  //                 <h1 className="shrink-0 text-title-h4">Wei Zhou</h1>
  //                 <VerifiedIcon className="mt-2 size-10" />
  //                 <FancyButton.Root
  //                   className="h-7 rounded-full"
  //                   variant="primary"
  //                   size="xsmall"
  //                 >
  //                   <FancyButton.Icon className="size-4" as={RiVipCrownLine} />
  //                   Pro
  //                 </FancyButton.Root>
  //               </div>
  //               <RiNotificationFill className="fill-primary-base" />
  //             </div>
  //             <span className="text-label-md text-text-soft-400">@wei_zhou</span>
  //           </div>
  //           <div className="flex flex-col gap-6 p-6 pt-2">
  //             <div className="flex flex-col gap-1.5">
  //               <h2 className="text-title-h6">Software Engineer</h2>
  //               <p className="text-label-md text-text-sub-600">
  //                 Software Engineer at twisterdesign.pro | More than 5 Years of
  //                 experience
  //               </p>
  //             </div>
  //             <div className="flex flex-col gap-2">
  //               <span className="text-label-sm text-text-soft-400">Skills</span>
  //               <div className="flex flex-wrap gap-2">
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   TypeScript
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   React
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Node.js
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   tRPC
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   TanStack
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Tailwind CSS
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Git
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   CI/CD
  //                 </Button.Root>
  //               </div>
  //             </div>
  //             <footer className="flex w-full flex-1 items-center gap-3">
  //               <Button.Root className="grow" variant="neutral" mode="stroke">
  //                 Message Emilia
  //               </Button.Root>
  //               <FancyButton.Root className="grow" variant="primary">
  //                 Connect
  //               </FancyButton.Root>
  //             </footer>
  //           </div>
  //         </motion.div>
  //         {/* CENTER */}
  //         <motion.div className="relative z-10 w-full overflow-hidden rounded-20 bg-bg-white-0 shadow-regular-sm ring-1 ring-stroke-soft-200">
  //           <header className="flex aspect-[16/6] w-full items-end bg-gradient-to-b from-primary-alpha-24 to-bg-white-0 p-6">
  //             <Avatar.Root color="blue" className="ring-4 ring-bg-white-0">
  //               <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/arthur.png" />
  //             </Avatar.Root>
  //           </header>
  //           <div className="flex w-full flex-col gap-0.5 px-6 pb-6">
  //             <div className="flex items-center justify-between gap-2">
  //               <div className="flex items-center gap-2">
  //                 <h1 className="shrink-0 text-title-h4">David Bowie</h1>
  //                 <VerifiedIcon className="mt-2 size-10" />
  //                 <FancyButton.Root
  //                   className="h-7 rounded-full"
  //                   variant="primary"
  //                   size="xsmall"
  //                 >
  //                   <FancyButton.Icon className="size-4" as={RiVipCrownLine} />
  //                   Pro
  //                 </FancyButton.Root>
  //               </div>
  //               <RiNotificationFill className="fill-primary-base" />
  //             </div>
  //             <span className="text-label-md text-text-soft-400">
  //               @david_bowie12
  //             </span>
  //           </div>
  //           <div className="flex flex-col gap-6 p-6 pt-2">
  //             <div className="flex flex-col gap-1.5">
  //               <h2 className="text-title-h6">
  //                 Product Designer - Mobile App Designer
  //               </h2>
  //               <p className="text-label-md text-text-sub-600">
  //                 Design Partner for Startup Founders at twisterdesign.pro | More
  //                 than 5 Years of experience | DM for any inquries
  //               </p>
  //             </div>
  //             <div className="flex flex-col gap-2">
  //               <span className="text-label-sm text-text-soft-400">Skills</span>
  //               <div className="flex flex-wrap gap-2">
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   TypeScript
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   React
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Node.js
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   tRPC
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   TanStack
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Tailwind CSS
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Git
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   CI/CD
  //                 </Button.Root>
  //               </div>
  //             </div>
  //             <footer className="flex w-full flex-1 items-center gap-3">
  //               <Button.Root className="grow" variant="neutral" mode="stroke">
  //                 Message David
  //               </Button.Root>
  //               <FancyButton.Root className="grow" variant="primary">
  //                 Connect
  //               </FancyButton.Root>
  //             </footer>
  //           </div>
  //         </motion.div>
  //         {/* LEFT */}
  //         <motion.div className="absolute -left-32 top-0 z-[1] w-full scale-[0.9] overflow-hidden rounded-20 bg-bg-white-0 shadow-regular-sm ring-1 ring-stroke-soft-200">
  //           <header className="flex aspect-[16/6] w-full items-end bg-gradient-to-b from-error-light to-bg-white-0 p-6">
  //             <Avatar.Root color="red" className="ring-4 ring-bg-white-0">
  //               <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/lena.png" />
  //             </Avatar.Root>
  //           </header>
  //           <div className="flex w-full flex-col gap-0.5 px-6 pb-6">
  //             <div className="flex items-center justify-between gap-2">
  //               <div className="flex items-center gap-2">
  //                 <h1 className="shrink-0 text-title-h4">Emilia Clarke</h1>
  //                 <VerifiedIcon className="mt-2 size-10" />
  //                 <FancyButton.Root
  //                   className="h-7 rounded-full"
  //                   variant="primary"
  //                   size="xsmall"
  //                 >
  //                   <FancyButton.Icon className="size-4" as={RiVipCrownLine} />
  //                   Pro
  //                 </FancyButton.Root>
  //               </div>
  //               <RiNotificationFill className="fill-primary-base" />
  //             </div>
  //             <span className="text-label-md text-text-soft-400">
  //               @emilia_clarke
  //             </span>
  //           </div>
  //           <div className="flex flex-col gap-6 p-6 pt-2">
  //             <div className="flex flex-col gap-1.5">
  //               <h2 className="text-title-h6">Web Designer</h2>
  //               <p className="text-label-md text-text-sub-600">
  //                 Web Designer at twisterdesign.pro | More than 5 Years of
  //                 experience
  //               </p>
  //             </div>
  //             <div className="flex flex-col gap-2">
  //               <span className="text-label-sm text-text-soft-400">Skills</span>
  //               <div className="flex flex-wrap gap-2">
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   TypeScript
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   React
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Node.js
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   tRPC
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   TanStack
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Tailwind CSS
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Git
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   CI/CD
  //                 </Button.Root>
  //               </div>
  //             </div>
  //             <footer className="flex w-full flex-1 items-center gap-3">
  //               <Button.Root className="grow" variant="neutral" mode="stroke">
  //                 Message Emilia
  //               </Button.Root>
  //               <FancyButton.Root className="grow" variant="primary">
  //                 Connect
  //               </FancyButton.Root>
  //             </footer>
  //           </div>
  //         </motion.div>
  //         <motion.div className="absolute -left-56 top-0 z-0 w-full scale-[0.8] overflow-hidden rounded-20 bg-bg-white-0 shadow-regular-sm ring-1 ring-stroke-soft-200">
  //           <header className="flex aspect-[16/6] w-full items-end bg-gradient-to-b from-warning-light to-bg-white-0 p-6">
  //             <Avatar.Root color="yellow" className="ring-4 ring-bg-white-0">
  //               <Avatar.Image src="https://www.alignui.com/images/avatar/memoji/james.png" />
  //             </Avatar.Root>
  //           </header>
  //           <div className="flex w-full flex-col gap-0.5 px-6 pb-6">
  //             <div className="flex items-center justify-between gap-2">
  //               <div className="flex items-center gap-2">
  //                 <h1 className="shrink-0 text-title-h4">Alexis Ohanian</h1>
  //                 <VerifiedIcon className="mt-2 size-10" />
  //                 <FancyButton.Root
  //                   className="h-7 rounded-full"
  //                   variant="primary"
  //                   size="xsmall"
  //                 >
  //                   <FancyButton.Icon className="size-4" as={RiVipCrownLine} />
  //                   Pro
  //                 </FancyButton.Root>
  //               </div>
  //               <RiNotificationFill className="fill-primary-base" />
  //             </div>
  //             <span className="text-label-md text-text-soft-400">
  //               @alexis_ohanian
  //             </span>
  //           </div>
  //           <div className="flex flex-col gap-6 p-6 pt-2">
  //             <div className="flex flex-col gap-1.5">
  //               <h2 className="text-title-h6">Front-End Developer</h2>
  //               <p className="text-label-md text-text-sub-600">
  //                 Front-End Developer at twisterdesign.pro | More than 5 Years of
  //                 experience
  //               </p>
  //             </div>
  //             <div className="flex flex-col gap-2">
  //               <span className="text-label-sm text-text-soft-400">Skills</span>
  //               <div className="flex flex-wrap gap-2">
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   TypeScript
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   React
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Node.js
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   tRPC
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   TanStack
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Tailwind CSS
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   Git
  //                 </Button.Root>
  //                 <Button.Root size="xsmall" variant="neutral" mode="lighter">
  //                   CI/CD
  //                 </Button.Root>
  //               </div>
  //             </div>
  //             <footer className="flex w-full flex-1 items-center gap-3">
  //               <Button.Root className="grow" variant="neutral" mode="stroke">
  //                 Message Emilia
  //               </Button.Root>
  //               <FancyButton.Root className="grow" variant="primary">
  //                 Connect
  //               </FancyButton.Root>
  //             </footer>
  //           </div>
  //         </motion.div>
  //       </div>
  //     </div>
  //   )
}

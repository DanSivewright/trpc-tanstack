import { cva, type VariantProps } from "class-variance-authority"

// import { Skeleton } from "./ui/skeleton"

const titleVariants = cva("", {
  variants: {
    level: {
      1: "text-4xl lg:text-5xl xl:text-6xl",
      2: "text-3xl lg:text-4xl xl:text-5xl",
      3: "text-2xl lg:text-3xl xl:text-4xl",
      4: "text-xl lg:text-2xl xl:text-3xl",
      5: "text-lg lg:text-xl xl:text-2xl",
      6: "text-base lg:text-lg xl:text-xl",
    },
    skeleton: {
      true: "",
      false: "",
    },
    margin: {
      true: "",
      false: "",
      t: "",
      b: "",
    },
  },
  compoundVariants: [
    {
      level: 1,
      skeleton: true,
      className: "h-9 lg:h-12 xl:h-[60px]",
    },
    {
      level: 2,
      skeleton: true,
      className: "h-[30px] lg:h-9 xl:h-12",
    },
    {
      level: 3,
      skeleton: true,
      className: "h-6 lg:h-[30px] xl:h-9",
    },
    {
      level: 4,
      skeleton: true,
      className: "h-5 lg:h-6 xl:h-[30px]",
    },
    {
      level: 5,
      skeleton: true,
      className: "h-[18px] lg:h-5 xl:h-6",
    },
    {
      level: 6,
      skeleton: true,
      className: "h-4 lg:h-[18px] xl:h-5",
    },
    {
      level: 1,
      margin: true,
      className: "my-7 lg:my-8 xl:my-9",
    },
    {
      level: 1,
      margin: "t",
      className: "mt-7 lg:mt-8 xl:mt-9",
    },
    {
      level: 1,
      margin: "b",
      className: "mb-7 lg:mb-8 xl:mb-9",
    },
    {
      level: 2,
      margin: true,
      className: "my-6 lg:my-7 xl:my-8",
    },
    {
      level: 2,
      margin: "t",
      className: "mt-6 lg:mt-7 xl:mt-8",
    },
    {
      level: 2,
      margin: "b",
      className: "mb-6 lg:mb-7 xl:mb-8",
    },
    {
      level: 3,
      margin: true,
      className: "my-5 lg:my-6 xl:my-7",
    },
    {
      level: 3,
      margin: "t",
      className: "mt-5 lg:mt-6 xl:mt-7",
    },
    {
      level: 3,
      margin: "b",
      className: "mb-5 lg:mb-6 xl:mb-7",
    },
    {
      level: 4,
      margin: true,
      className: "my-4 lg:my-5 xl:my-6",
    },
    {
      level: 4,
      margin: "t",
      className: "mt-4 lg:mt-5 xl:mt-6",
    },
    {
      level: 4,
      margin: "b",
      className: "mb-4 lg:mb-5 xl:mb-6",
    },
    {
      level: 5,
      margin: true,
      className: "my-3 lg:my-4 xl:my-5",
    },
    {
      level: 5,
      margin: "t",
      className: "mt-3 lg:mt-4 xl:mt-5",
    },
    {
      level: 5,
      margin: "b",
      className: "mb-3 lg:mb-4 xl:mb-5",
    },
    {
      level: 6,
      margin: true,
      className: "my-2 lg:my-3 xl:my-4",
    },
    {
      level: 6,
      margin: "t",
      className: "mt-2 lg:mt-3 xl:mt-4",
    },
    {
      level: 6,
      margin: "b",
      className: "mb-2 lg:mb-3 xl:mb-4",
    },
  ],
  defaultVariants: {
    level: 1,
    skeleton: false,
    margin: true,
  },
})

export interface TitleProps extends VariantProps<typeof titleVariants> {
  balance?: number
  showAs?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

type TitleComponent = React.FC<TitleProps> & {
  Skeleton: React.FC<Omit<TitleProps, "children">>
}

const Title: TitleComponent = ({
  children,
  level = 1,
  showAs,
  margin = true,
  className,
  balance = 0,
  ...rest
}) => {
  const Component: React.ElementType<any> = `h${level}` as React.ElementType
  const determinedLevel = showAs || level
  return (
    <Component
      className={titleVariants({ level: determinedLevel, margin, className })}
      {...rest}
    >
      {children}
    </Component>
  )
}
Title.displayName = "Title"

// const TitleSkeleton: React.FC<Omit<TitleProps, "children">> = ({
//   level = 1,
//   className,
//   margin = true,
//   ...rest
// }) => {
//   return (
//     <Skeleton
//       className={titleVariants({
//         level,
//         skeleton: true,
//         margin,
//         className,
//       })}
//       {...rest}
//     />
//   )
// }
// TitleSkeleton.displayName = "Title.Skeleton"

// Title.Skeleton = TitleSkeleton

export { Title, titleVariants }

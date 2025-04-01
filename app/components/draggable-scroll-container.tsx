"use client"

import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
}
const DraggableScrollContainer: React.FC<Props> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current!.offsetLeft)
    setScrollLeft(scrollRef.current!.scrollLeft)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false)
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current!.offsetLeft
    const walk = (x - startX) * 1.75
    scrollRef.current!.scrollLeft = scrollLeft - walk
  }
  return (
    <div
      ref={scrollRef}
      className={cn(
        "no-scrollbar w-full cursor-grab overflow-x-auto active:cursor-grabbing",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  )
}
export default DraggableScrollContainer

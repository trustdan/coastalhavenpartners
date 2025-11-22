"use client"

import React, { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 315,
  className,
}: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    []
  )
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const styles = [...new Array(number)].map(() => ({
      "--angle": `${angle}deg`,
      top: Math.floor(Math.random() * 50) + "%",
      left: Math.floor(Math.random() * 120) - 10 + "%",
      animationDelay: Math.random() * (maxDelay - minDelay) + minDelay + "s",
      animationDuration:
        Math.floor(Math.random() * (maxDuration - minDuration) + minDuration) +
        "s",
    } as React.CSSProperties))
    setMeteorStyles(styles)
  }, [isMounted, number, minDelay, maxDelay, minDuration, maxDuration, angle])

  if (!isMounted) {
    return null
  }

  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        // Meteor Head
        <span
          key={idx}
          style={style}
          className={cn(
            "animate-meteor pointer-events-none absolute size-[0.125rem] rounded-full",
            "bg-indigo-500 dark:bg-purple-400",
            "opacity-100",
            "shadow-[0_0_8px_2px_rgba(99,102,241,0.75)] dark:shadow-[0_0_8px_2px_rgba(168,85,247,0.7)]",
            className
          )}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[24px] -translate-y-1/2 opacity-100 bg-linear-to-r from-indigo-500/80 to-transparent dark:from-purple-400/70 dark:to-transparent" />
        </span>
      ))}
    </>
  )
}

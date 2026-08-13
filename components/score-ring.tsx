"use client"

import { levelForScore } from "@/lib/assessment"
import { TONE_CLASSES } from "@/lib/tone"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type Size = "sm" | "lg"

export function ScoreRing({
  score,
  size = "lg",
  label,
}: {
  score: number
  size?: Size
  label?: string
}) {
  const dims = size === "lg" ? { box: 200, r: 86, stroke: 10 } : { box: 128, r: 55, stroke: 7 }
  const circumference = 2 * Math.PI * dims.r

  const level = levelForScore(score)
  const tone = TONE_CLASSES[level.tone]

  const [progress, setProgress] = useState(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(score))
    const start = performance.now()
    const duration = 1000
    let frame: number
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * score))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(frame)
    }
  }, [score])

  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: dims.box, height: dims.box }}
      role="img"
      aria-label={`Readiness score ${score} out of 100, ${level.label}`}
    >
      <svg width={dims.box} height={dims.box} className="-rotate-90 overflow-visible">
        <circle
          cx={dims.box / 2}
          cy={dims.box / 2}
          r={dims.r}
          fill="none"
          strokeWidth={dims.stroke}
          className="stroke-inset"
        />
        <circle
          cx={dims.box / 2}
          cy={dims.box / 2}
          r={dims.r}
          fill="none"
          strokeWidth={dims.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", tone.stroke)}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "numeric font-semibold text-foreground",
            size === "lg" ? "text-[3.5rem] leading-none" : "text-4xl leading-none",
          )}
        >
          {display}
        </span>
        {size === "lg" ? (
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">out of 100</span>
        ) : null}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide",
            size === "lg" ? "mt-2 px-2.5 py-1 text-[11px]" : "mt-2 px-2 py-0.5 text-[10px]",
            tone.softBg,
            tone.text,
          )}
        >
          <span className={cn("size-1.5 rounded-full", tone.dot)} />
          {(label ?? level.label).toUpperCase()}
        </span>
      </div>
    </div>
  )
}

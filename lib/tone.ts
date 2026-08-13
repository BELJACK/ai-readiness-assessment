import type { ReadinessLevel } from "@/lib/assessment"

// Static class strings so Tailwind's compiler keeps them. Keyed by tone.
export const TONE_CLASSES: Record<
  ReadinessLevel["tone"],
  { text: string; bg: string; softBg: string; border: string; stroke: string; dot: string }
> = {
  critical: {
    text: "text-tone-critical",
    bg: "bg-tone-critical",
    softBg: "bg-tone-critical/10",
    border: "border-tone-critical/25",
    stroke: "stroke-tone-critical",
    dot: "bg-tone-critical",
  },
  emerging: {
    text: "text-tone-emerging",
    bg: "bg-tone-emerging",
    softBg: "bg-tone-emerging/10",
    border: "border-tone-emerging/25",
    stroke: "stroke-tone-emerging",
    dot: "bg-tone-emerging",
  },
  developing: {
    text: "text-tone-developing",
    bg: "bg-tone-developing",
    softBg: "bg-tone-developing/10",
    border: "border-tone-developing/25",
    stroke: "stroke-tone-developing",
    dot: "bg-tone-developing",
  },
  advanced: {
    text: "text-tone-advanced",
    bg: "bg-tone-advanced",
    softBg: "bg-tone-advanced/10",
    border: "border-tone-advanced/25",
    stroke: "stroke-tone-advanced",
    dot: "bg-tone-advanced",
  },
}

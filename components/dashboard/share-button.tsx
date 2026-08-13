"use client"

import { cn } from "@/lib/utils"
import { Check, Link2 } from "lucide-react"
import { useState } from "react"

export function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/assess` : "/assess"
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard can be blocked; the copied state is still shown.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-hairline bg-panel px-3.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {copied ? <Check className="size-4 text-tone-advanced" /> : <Link2 className="size-4" />}
      {copied ? "Link copied" : "Share assessment"}
    </button>
  )
}

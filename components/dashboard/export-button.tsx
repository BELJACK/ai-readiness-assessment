"use client"

import { cn } from "@/lib/utils"
import { Check, ChevronDown, Download, FileSpreadsheet, Printer } from "lucide-react"
import { useEffect, useRef, useState } from "react"

/**
 * Two ways out of the dashboard: a PDF via the browser's own print pipeline
 * (so the report always matches the screen), and a CSV of the aggregates for
 * anyone who wants to work with the numbers. Print rules live in globals.css.
 */
export function ExportButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={cn("relative", className)} data-print-hide>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 shrink-0 items-center gap-2 border border-hairline bg-panel px-4 text-sm font-medium text-foreground transition-colors hover:bg-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Download className="size-4" />
        Export
        <ChevronDown
          className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-60 border border-hairline bg-panel shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              window.print()
            }}
            className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-inset"
          >
            <Printer className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="block text-sm font-medium text-foreground">Print or save PDF</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                The full report as shown here.
              </span>
            </span>
          </button>

          <a
            role="menuitem"
            href="/api/export"
            download
            onClick={() => {
              setDownloaded(true)
              setTimeout(() => {
                setDownloaded(false)
                setOpen(false)
              }, 1200)
            }}
            className="flex w-full items-start gap-3 border-t border-hairline p-4 text-left transition-colors hover:bg-inset"
          >
            {downloaded ? (
              <Check className="mt-0.5 size-4 shrink-0 text-tone-advanced" />
            ) : (
              <FileSpreadsheet className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            )}
            <span>
              <span className="block text-sm font-medium text-foreground">
                {downloaded ? "Downloaded" : "Download CSV"}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                Scores by team, capability, and month.
              </span>
            </span>
          </a>
        </div>
      ) : null}
    </div>
  )
}

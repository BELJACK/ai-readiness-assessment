"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

// Logo is home, so it isn't repeated here. Two destinations and one CTA is
// what a product nav needs; anything more reads as a sitemap.
const NAV = [
  { href: "/methodology", label: "How it works" },
  { href: "/dashboard", label: "Overview" },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M15.8 8.2 11.3 10.8 8.2 15.8l4.5-2.6z" fill="currentColor" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">Compass</span>
        <span className="mt-0.5 text-[11px] font-medium tracking-wide text-muted-foreground">
          AI Readiness
        </span>
      </span>
    </Link>
  )
}

export function SiteHeader({
  action,
}: {
  action?: { href: string; label: string; variant?: "primary" | "ghost" }
}) {
  const pathname = usePathname()

  return (
    <header data-print-hide className="sticky top-0 z-30 border-b border-hairline bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-inset text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {action ? (
            <Link
              href={action.href}
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                action.variant === "ghost"
                  ? "border border-hairline bg-panel text-foreground hover:bg-inset"
                  : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
              )}
            >
              {action.label}
            </Link>
          ) : null}
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile navigation. A scrollable row rather than a hamburger overlay:
          four links fit, and it keeps the current page visible at all times. */}
      <nav
        aria-label="Primary"
        className="flex gap-1 overflow-x-auto border-t border-hairline px-4 py-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-inset text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}

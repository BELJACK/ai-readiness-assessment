import { DIMENSIONS, TEAMS } from "@/lib/assessment"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer data-print-hide className="border-t border-hairline bg-band">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
                <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M15.8 8.2 11.3 10.8 8.2 15.8l4.5-2.6z" fill="currentColor" />
                </svg>
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                Compass
              </span>
            </div>
            <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              Most AI projects stall on readiness, not technology. Compass shows you which teams
              are ready, which are not, and what to fix first.
            </p>
          </div>

          <div>
            <p className="eyebrow text-muted-foreground">Pages</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/assess"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Take the assessment
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Business overview
                </Link>
              </li>
              <li>
                <Link
                  href="/methodology"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  How scoring works
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-muted-foreground">What it measures</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {DIMENSIONS.map((d) => (
                <li key={d.id}>{d.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Covers {TEAMS.length} teams. Answers are anonymous and stored as team averages.
          </p>
          <p className="text-xs text-muted-foreground">
            Built by <span className="font-medium text-foreground">Belema Jackreece</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

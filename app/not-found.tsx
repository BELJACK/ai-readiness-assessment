import { Compass } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-6" />
        </span>
        <p className="numeric mt-8 text-sm font-semibold text-muted-foreground">404</p>
        <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          The link may be out of date.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-hairline bg-panel px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-inset"
          >
            View dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
